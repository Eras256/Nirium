//! Nirium Vault — Core vault, flash loan, and DeFi orchestration contract.
//!
//! Implements non-custodial vaults with agent delegation using Soroban's
//! native `require_auth()` and persistent storage for delegation records.
//!
//! Flash loans use a SINGLE-INVOCATION pattern: borrow, execute, and verify
//! repayment all happen within one function call. If repayment fails,
//! `panic!()` reverts the entire transaction — no receipt struct needed.
//!
//! Stellar-native atomicity layers:
//! 1. PathPaymentStrictReceive — atomic multi-hop swaps (protocol-level)
//! 2. Multi-Operation Transactions — up to 100 ops, all-or-nothing
//! 3. Single-Invocation Flash Loans — this contract's pattern

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, Vec,
};

// ═══════════════════════════════════════════════════════════════
// ERROR CODES
// ═══════════════════════════════════════════════════════════════

const E_INSUFFICIENT_PROFIT: u32 = 1;
const E_INSUFFICIENT_FEE: u32 = 2;
const E_POOL_INSUFFICIENT_LIQUIDITY: u32 = 3;
const E_INVALID_REPAYMENT: u32 = 4;
const E_INSUFFICIENT_BALANCE: u32 = 5;
const E_AGENT_NOT_DELEGATED: u32 = 6;
const E_PATH_PAYMENT_FAILED: u32 = 7;
const E_VAULT_NOT_FOUND: u32 = 8;
const E_OVERFLOW: u32 = 9;
const E_ALREADY_INITIALIZED: u32 = 10;

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

/// Deployment fee: 0.5 XLM in stroops (1 XLM = 10^7 stroops)
const DEPLOYMENT_FEE: i128 = 5_000_000;

/// Maximum flash loan fee in basis points (5%)
const MAX_FLASH_LOAN_FEE_BPS: u32 = 500;

/// Default flash loan fee in basis points (0.3%)
const DEFAULT_FLASH_LOAN_FEE_BPS: u32 = 30;

// ═══════════════════════════════════════════════════════════════
// STORAGE KEYS
// ═══════════════════════════════════════════════════════════════

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Treasury,
    VaultCount,
    Vault(u64),
    VaultBalance(u64),
    /// Agent delegation: (vault_id, agent_address) → AgentDelegation
    AgentDelegation(u64, Address),
    PoolCount,
    Pool(u64),
    PoolBaseBalance(u64),
    PoolQuoteBalance(u64),
    PoolFeeBps(u64),
    TotalFeesCollected,
    AdminAddress,
}

// ═══════════════════════════════════════════════════════════════
// DATA STRUCTURES
// ═══════════════════════════════════════════════════════════════

/// Vault holding user capital with owner-controlled access.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Vault {
    pub vault_id: u64,
    pub owner: Address,
    pub token_address: Address,
    pub balance: i128,
    pub created_at: u64,
    pub is_active: bool,
}

/// Agent delegation record stored in persistent storage.
/// Replaces capability tokens — uses `env.require_auth(agent)` for verification.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AgentDelegation {
    pub vault_id: u64,
    pub agent: Address,
    pub is_active: bool,
    pub max_execution_amount: i128,
    pub executions_count: u64,
    pub total_profit: i128,
    pub created_at: u64,
}

/// Internal flash loan state — exists ONLY during function execution scope.
/// NOT stored in persistent storage. NOT a Hot Potato receipt.
/// If the function panics, this struct and all its effects are discarded.
struct FlashLoanState {
    pool_id: u64,
    borrowed_amount: i128,
    min_repay_amount: i128,
    borrower: Address,
}

/// Simulated liquidity pool for testnet usage.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MockPool {
    pub pool_id: u64,
    pub base_token: Address,
    pub quote_token: Address,
    pub base_balance: i128,
    pub quote_balance: i128,
    pub flash_loan_fee_bps: u32,
    pub total_flash_loans: u64,
    pub total_volume: i128,
}

// ═══════════════════════════════════════════════════════════════
// CONTRACT
// ═══════════════════════════════════════════════════════════════

#[contract]
pub struct NiriumVaultContract;

#[contractimpl]
impl NiriumVaultContract {
    // ─── Initialization ──────────────────────────────────────

    /// Initialize the contract with a treasury address for fee collection
    /// and an admin address for privileged operations.
    pub fn initialize(env: Env, treasury: Address, admin: Address) {
        if env.storage().instance().has(&DataKey::Treasury) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Treasury, &treasury);
        env.storage().instance().set(&DataKey::AdminAddress, &admin);
        env.storage().instance().set(&DataKey::VaultCount, &0u64);
        env.storage().instance().set(&DataKey::PoolCount, &0u64);
        env.storage()
            .instance()
            .set(&DataKey::TotalFeesCollected, &0i128);
    }

    // ─── Vault Operations ────────────────────────────────────

    /// Create a new vault. The caller becomes the owner.
    /// A deployment fee is collected and sent to the treasury.
    pub fn create_vault(env: Env, owner: Address, token_address: Address) -> Vault {
        owner.require_auth();

        let treasury: Address = env.storage().instance().get(&DataKey::Treasury).unwrap();
        let xlm_client = token::Client::new(&env, &token_address);
        xlm_client.transfer(&owner, &treasury, &DEPLOYMENT_FEE);

        let prev_fees: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalFeesCollected)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalFeesCollected, &(prev_fees + DEPLOYMENT_FEE));

        let vault_count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::VaultCount)
            .unwrap_or(0);
        let vault_id = vault_count + 1;

        let vault = Vault {
            vault_id,
            owner: owner.clone(),
            token_address: token_address.clone(),
            balance: 0,
            created_at: env.ledger().timestamp(),
            is_active: true,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Vault(vault_id), &vault);
        env.storage()
            .persistent()
            .set(&DataKey::VaultBalance(vault_id), &0i128);
        env.storage().instance().set(&DataKey::VaultCount, &vault_id);

        env.events().publish(
            (symbol_short!("vault"), symbol_short!("created")),
            (vault_id, owner),
        );

        vault
    }

    /// Deposit assets into a vault. Only the vault owner can deposit.
    pub fn deposit(env: Env, vault_id: u64, amount: i128) {
        if amount <= 0 {
            panic!("amount must be positive");
        }

        let mut vault: Vault = env
            .storage()
            .persistent()
            .get(&DataKey::Vault(vault_id))
            .expect("vault not found");

        vault.owner.require_auth();

        let xlm_client = token::Client::new(&env, &vault.token_address);
        xlm_client.transfer(&vault.owner, &env.current_contract_address(), &amount);

        let new_balance = vault
            .balance
            .checked_add(amount)
            .expect("balance overflow");
        vault.balance = new_balance;

        env.storage()
            .persistent()
            .set(&DataKey::Vault(vault_id), &vault);
        env.storage()
            .persistent()
            .set(&DataKey::VaultBalance(vault_id), &new_balance);

        env.events().publish(
            (symbol_short!("vault"), symbol_short!("deposit")),
            (vault_id, amount, new_balance),
        );
    }

    /// Withdraw assets from a vault. Only the vault owner can withdraw.
    /// Agents CANNOT call this function.
    pub fn withdraw(env: Env, vault_id: u64, amount: i128) {
        if amount <= 0 {
            panic!("amount must be positive");
        }

        let mut vault: Vault = env
            .storage()
            .persistent()
            .get(&DataKey::Vault(vault_id))
            .expect("vault not found");

        // Only the owner can withdraw — critical security boundary
        vault.owner.require_auth();

        if vault.balance < amount {
            panic!("insufficient vault balance");
        }

        let xlm_client = token::Client::new(&env, &vault.token_address);
        xlm_client.transfer(&env.current_contract_address(), &vault.owner, &amount);

        let new_balance = vault
            .balance
            .checked_sub(amount)
            .expect("balance underflow");
        vault.balance = new_balance;

        env.storage()
            .persistent()
            .set(&DataKey::Vault(vault_id), &vault);
        env.storage()
            .persistent()
            .set(&DataKey::VaultBalance(vault_id), &new_balance);

        env.events().publish(
            (symbol_short!("vault"), symbol_short!("withdraw")),
            (vault_id, amount, new_balance),
        );
    }

    pub fn get_vault(env: Env, vault_id: u64) -> Vault {
        env.storage()
            .persistent()
            .get(&DataKey::Vault(vault_id))
            .expect("vault not found")
    }

    pub fn get_vault_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::VaultCount)
            .unwrap_or(0)
    }

    // ─── Agent Delegation (Persistent Storage) ────────────────

    /// Delegate execution access to an agent. Stored in persistent storage;
    /// verified via `env.require_auth(agent)` on each execution call.
    pub fn delegate_agent(
        env: Env,
        vault_id: u64,
        agent_address: Address,
        max_execution_amount: i128,
    ) -> AgentDelegation {
        let vault: Vault = env
            .storage()
            .persistent()
            .get(&DataKey::Vault(vault_id))
            .expect("vault not found");

        vault.owner.require_auth();

        let delegation = AgentDelegation {
            vault_id,
            agent: agent_address.clone(),
            is_active: true,
            max_execution_amount,
            executions_count: 0,
            total_profit: 0,
            created_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(
            &DataKey::AgentDelegation(vault_id, agent_address.clone()),
            &delegation,
        );

        env.events().publish(
            (symbol_short!("agent"), symbol_short!("delegate")),
            (vault_id, agent_address),
        );

        delegation
    }

    /// Revoke an agent's delegation. Kill switch — immediately disables the agent.
    pub fn revoke_agent(env: Env, vault_id: u64, agent_address: Address) {
        let vault: Vault = env
            .storage()
            .persistent()
            .get(&DataKey::Vault(vault_id))
            .expect("vault not found");

        vault.owner.require_auth();

        let mut delegation: AgentDelegation = env
            .storage()
            .persistent()
            .get(&DataKey::AgentDelegation(vault_id, agent_address.clone()))
            .expect("delegation not found");

        delegation.is_active = false;

        env.storage().persistent().set(
            &DataKey::AgentDelegation(vault_id, agent_address.clone()),
            &delegation,
        );

        env.events().publish(
            (symbol_short!("agent"), symbol_short!("revoked")),
            (vault_id, agent_address),
        );
    }

    /// Get agent delegation details.
    pub fn get_agent_delegation(env: Env, vault_id: u64, agent: Address) -> AgentDelegation {
        env.storage()
            .persistent()
            .get(&DataKey::AgentDelegation(vault_id, agent))
            .expect("delegation not found")
    }

    // ─── Internal: Verify Agent ──────────────────────────────

    /// Verify an agent is delegated and within execution limits.
    fn verify_agent(env: &Env, vault_id: u64, agent: &Address, amount: i128) -> AgentDelegation {
        agent.require_auth();

        let delegation: AgentDelegation = env
            .storage()
            .persistent()
            .get(&DataKey::AgentDelegation(vault_id, agent.clone()))
            .expect("agent not delegated for this vault");

        if !delegation.is_active {
            panic!("agent delegation has been revoked");
        }
        if amount > delegation.max_execution_amount {
            panic!("exceeds agent max execution amount");
        }

        delegation
    }

    // ─── Mock Pool Operations ────────────────────────────────

    /// Create a testnet mock liquidity pool.
    pub fn create_pool(
        env: Env,
        creator: Address,
        base_token: Address,
        quote_token: Address,
        base_amount: i128,
        quote_amount: i128,
        fee_bps: u32,
    ) -> MockPool {
        creator.require_auth();

        if fee_bps > MAX_FLASH_LOAN_FEE_BPS {
            panic!("fee too high");
        }

        let pool_count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::PoolCount)
            .unwrap_or(0);
        let pool_id = pool_count + 1;

        let pool = MockPool {
            pool_id,
            base_token,
            quote_token,
            base_balance: base_amount,
            quote_balance: quote_amount,
            flash_loan_fee_bps: fee_bps,
            total_flash_loans: 0,
            total_volume: 0,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Pool(pool_id), &pool);
        env.storage().instance().set(&DataKey::PoolCount, &pool_id);

        env.events().publish(
            (symbol_short!("pool"), symbol_short!("created")),
            (pool_id, base_amount, quote_amount, fee_bps),
        );

        pool
    }

    // ─── SINGLE-INVOCATION FLASH LOAN ────────────────────────
    //
    // This is the core Stellar-native pattern. Instead of separate
    // flash_borrow() + flash_repay() with a receipt struct, everything
    // happens in ONE function call. If repayment verification fails,
    // panic!() reverts the ENTIRE transaction automatically.

    /// Execute a complete atomic flash loan: borrow → execute swap → verify repayment.
    /// All within a single contract invocation. Panics on failure = full revert.
    pub fn flash_loan_execute(
        env: Env,
        agent: Address,
        vault_id: u64,
        pool_id: u64,
        borrow_amount: i128,
        min_profit: i128,
    ) -> i128 {
        // 1. Verify agent delegation
        let mut delegation = Self::verify_agent(&env, vault_id, &agent, borrow_amount);

        // 2. Load pool and verify liquidity
        let mut pool: MockPool = env
            .storage()
            .persistent()
            .get(&DataKey::Pool(pool_id))
            .expect("pool not found");

        if pool.base_balance < borrow_amount {
            panic!("insufficient pool liquidity");
        }

        // 3. Calculate fee and minimum repayment
        let fee = (borrow_amount * pool.flash_loan_fee_bps as i128) / 10_000;
        let min_repay = borrow_amount
            .checked_add(fee)
            .expect("repay amount overflow");

        // -- FlashLoanState exists only in this scope --
        let _state = FlashLoanState {
            pool_id,
            borrowed_amount: borrow_amount,
            min_repay_amount: min_repay,
            borrower: agent.clone(),
        };

        // 4. Deduct from pool (temporary — reverted if we panic)
        pool.base_balance = pool
            .base_balance
            .checked_sub(borrow_amount)
            .expect("pool balance underflow");

        // 5. Simulate profitable trade (testnet mock: 0.5% profit)
        let simulated_profit = (borrow_amount * 50) / 10_000;
        let total_after_trade = borrow_amount
            .checked_add(simulated_profit)
            .expect("trade overflow");

        // 6. VERIFY REPAYMENT — this is where atomicity is enforced.
        //    If this check fails, panic!() reverts everything above.
        if total_after_trade < min_repay {
            panic!("insufficient profit to cover flash loan fee — transaction reverted");
        }

        let net_profit = total_after_trade
            .checked_sub(min_repay)
            .expect("profit underflow");

        if net_profit < min_profit {
            panic!("net profit below minimum threshold — transaction reverted");
        }

        // ─── LEVEL 6: METAVERSION 1% MATRIX FEE ───
        // The protocol captures 1% exclusively from the realized profit.
        let matrix_fee = net_profit / 100;
        let user_profit = net_profit.checked_sub(matrix_fee).expect("fee underflow");

        // Update Global Treasury (Fees Collected)
        let prev_fees: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalFeesCollected)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalFeesCollected, &(prev_fees + matrix_fee));

        // 7. Repay pool (with loan fee included)
        pool.base_balance = pool
            .base_balance
            .checked_add(min_repay)
            .expect("pool balance overflow");
        pool.total_flash_loans += 1;
        pool.total_volume = pool
            .total_volume
            .checked_add(borrow_amount)
            .expect("volume overflow");

        env.storage()
            .persistent()
            .set(&DataKey::Pool(pool_id), &pool);

        // 8. Update agent delegation stats with User Profit only
        delegation.executions_count += 1;
        delegation.total_profit = delegation
            .total_profit
            .checked_add(user_profit)
            .expect("profit tracking overflow");
        env.storage().persistent().set(
            &DataKey::AgentDelegation(vault_id, agent.clone()),
            &delegation,
        );

        // 9. Emit event
        env.events().publish(
            (symbol_short!("flash"), symbol_short!("executed")),
            (borrow_amount, min_repay, user_profit, matrix_fee),
        );

        user_profit
    }

    // ─── STELLAR-NATIVE AGENT FUNCTIONS ──────────────────────
    //
    // These functions orchestrate Stellar-native DeFi operations.
    // The actual PathPayment and SDEX operations are built into
    // Stellar's base protocol and are composed as multi-operation
    // transactions by the agent backend — the contract verifies
    // authorization and enforces profit constraints.

    /// Execute path arbitrage via Stellar's native PathPaymentStrictReceive.
    /// The agent backend discovers profitable routes via Horizon `/paths/strict-receive`
    /// and constructs the multi-operation transaction. This contract function
    /// verifies delegation and records the execution.
    pub fn execute_path_arbitrage(
        env: Env,
        agent: Address,
        vault_id: u64,
        path_length: u32,
        amount: i128,
        min_output: i128,
    ) -> i128 {
        let mut delegation = Self::verify_agent(&env, vault_id, &agent, amount);

        // The actual PathPaymentStrictReceive happens at the Stellar protocol level
        // as part of the same multi-operation transaction. Here we verify and record.
        if min_output <= amount {
            panic!("path arbitrage must produce positive output");
        }

        let expected_profit = min_output
            .checked_sub(amount)
            .expect("profit underflow");

        // Update delegation stats
        delegation.executions_count += 1;
        delegation.total_profit = delegation
            .total_profit
            .checked_add(expected_profit)
            .expect("profit tracking overflow");
        env.storage().persistent().set(
            &DataKey::AgentDelegation(vault_id, agent.clone()),
            &delegation,
        );

        env.events().publish(
            (symbol_short!("path"), symbol_short!("arb")),
            (path_length, amount, min_output, agent),
        );

        expected_profit
    }

    /// Execute cross-DEX arbitrage between Stellar's native SDEX and Soroswap AMM.
    /// Both operations are bundled in ONE multi-operation transaction (all-or-nothing).
    pub fn execute_cross_dex(
        env: Env,
        agent: Address,
        vault_id: u64,
        amount: i128,
        expected_sdex_output: i128,
        expected_amm_output: i128,
    ) -> i128 {
        let mut delegation = Self::verify_agent(&env, vault_id, &agent, amount);

        // The agent backend constructs a multi-op tx:
        // Op 1: Buy on SDEX (ManageBuyOffer)
        // Op 2: Sell on Soroswap (InvokeHostFunction)
        // Both succeed or both fail atomically.
        let profit = expected_amm_output
            .checked_sub(expected_sdex_output)
            .expect("cross-dex profit underflow");

        if profit <= 0 {
            panic!("cross-DEX arbitrage must produce positive profit");
        }

        delegation.executions_count += 1;
        delegation.total_profit = delegation
            .total_profit
            .checked_add(profit)
            .expect("profit tracking overflow");
        env.storage().persistent().set(
            &DataKey::AgentDelegation(vault_id, agent.clone()),
            &delegation,
        );

        env.events().publish(
            (symbol_short!("xdex"), symbol_short!("arb")),
            (amount, profit, agent),
        );

        profit
    }

    /// Execute a Blend Protocol yield action (lend or borrow).
    pub fn execute_blend_yield(
        env: Env,
        agent: Address,
        vault_id: u64,
        is_supply: bool,
        amount: i128,
    ) {
        let mut delegation = Self::verify_agent(&env, vault_id, &agent, amount);

        let action = if is_supply {
            symbol_short!("supply")
        } else {
            symbol_short!("borrow")
        };

        delegation.executions_count += 1;
        env.storage().persistent().set(
            &DataKey::AgentDelegation(vault_id, agent.clone()),
            &delegation,
        );

        env.events().publish(
            (symbol_short!("blend"), action),
            (amount, agent),
        );
    }

    /// Execute an AMM swap on Soroswap.
    pub fn execute_soroswap_swap(
        env: Env,
        agent: Address,
        vault_id: u64,
        amount_in: i128,
        min_amount_out: i128,
    ) -> i128 {
        let mut delegation = Self::verify_agent(&env, vault_id, &agent, amount_in);

        // Soroswap contract invocation happens via InvokeHostFunction in the
        // multi-operation transaction. Here we authorize and record.
        delegation.executions_count += 1;
        env.storage().persistent().set(
            &DataKey::AgentDelegation(vault_id, agent.clone()),
            &delegation,
        );

        env.events().publish(
            (symbol_short!("swap"), symbol_short!("soroswap")),
            (amount_in, min_amount_out, agent),
        );

        min_amount_out
    }

    // ─── Queries ─────────────────────────────────────────────

    pub fn get_pool(env: Env, pool_id: u64) -> MockPool {
        env.storage()
            .persistent()
            .get(&DataKey::Pool(pool_id))
            .expect("pool not found")
    }

    pub fn get_pool_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::PoolCount)
            .unwrap_or(0)
    }

    pub fn get_total_fees(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalFeesCollected)
            .unwrap_or(0)
    }
}
