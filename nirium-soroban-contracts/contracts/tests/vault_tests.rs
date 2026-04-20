//! Comprehensive test suite for the Nirium Vault contract.
//!
//! Tests cover vault lifecycle, agent delegation, single-invocation flash loans,
//! Stellar-native agent operations, authorization boundaries, and error conditions.
//!
//! NOTE: The old LoopReceipt / flash_borrow / flash_repay Hot Potato pattern has
//! been removed in favor of a single-invocation `flash_loan_execute()` function
//! which reverts atomically via `panic!()` on failure.

#![cfg(test)]

use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, Events},
    token, vec, Address, Env, IntoVal,
};

use crate::nirium_vault::NiriumVaultContract;
use crate::nirium_vault::NiriumVaultContractClient;

fn setup_env() -> (Env, Address, NiriumVaultContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(NiriumVaultContract, ());
    let client = NiriumVaultContractClient::new(&env, &contract_id);

    (env, contract_id, client)
}

fn create_token(env: &Env) -> (Address, token::StellarAssetClient<'_>) {
    let admin = Address::generate(env);
    let token_address = env.register_stellar_asset_contract_v2(admin.clone());
    let token_client = token::StellarAssetClient::new(env, &token_address.address());
    (token_address.address(), token_client)
}

// ═══════════════════════════════════════════════════════════════
// VAULT CREATION TESTS
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_vault_creation() {
    let (env, _contract_id, client) = setup_env();
    let owner = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    // Create a token and fund the owner
    let (token_addr, token_admin) = create_token(&env);
    token_admin.mint(&owner, &100_000_000_000);
    token_admin.mint(&treasury, &0);

    // Initialize the contract
    client.initialize(&treasury, &admin);

    // Create vault
    let vault = client.create_vault(&owner, &token_addr);

    assert_eq!(vault.vault_id, 1);
    assert_eq!(vault.owner, owner);
    assert_eq!(vault.balance, 0);
    assert!(vault.is_active);
}

#[test]
fn test_multiple_vault_creation() {
    let (env, _contract_id, client) = setup_env();
    let owner1 = Address::generate(&env);
    let owner2 = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (token_addr, token_admin) = create_token(&env);
    token_admin.mint(&owner1, &100_000_000_000);
    token_admin.mint(&owner2, &100_000_000_000);

    client.initialize(&treasury, &admin);

    let vault1 = client.create_vault(&owner1, &token_addr);
    let vault2 = client.create_vault(&owner2, &token_addr);

    assert_eq!(vault1.vault_id, 1);
    assert_eq!(vault2.vault_id, 2);
    assert_ne!(vault1.owner, vault2.owner);
    assert_eq!(client.get_vault_count(), 2);
}

#[test]
fn test_deployment_fee_collection() {
    let (env, _contract_id, client) = setup_env();
    let owner = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (token_addr, token_admin) = create_token(&env);
    let initial_balance: i128 = 100_000_000_000;
    token_admin.mint(&owner, &initial_balance);

    client.initialize(&treasury, &admin);
    client.create_vault(&owner, &token_addr);

    // Verify fee was collected
    let token_client = token::Client::new(&env, &token_addr);
    let owner_balance = token_client.balance(&owner);
    assert!(owner_balance < initial_balance);

    let fees = client.get_total_fees();
    assert!(fees > 0);
}

// ═══════════════════════════════════════════════════════════════
// DEPOSIT / WITHDRAW TESTS
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_deposit() {
    let (env, contract_id, client) = setup_env();
    let owner = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (token_addr, token_admin) = create_token(&env);
    token_admin.mint(&owner, &100_000_000_000);

    client.initialize(&treasury, &admin);
    let vault = client.create_vault(&owner, &token_addr);

    let deposit_amount: i128 = 50_000_000_000;
    client.deposit(&vault.vault_id, &deposit_amount);

    let updated_vault = client.get_vault(&vault.vault_id);
    assert_eq!(updated_vault.balance, deposit_amount);
}

#[test]
fn test_withdraw() {
    let (env, contract_id, client) = setup_env();
    let owner = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (token_addr, token_admin) = create_token(&env);
    token_admin.mint(&owner, &100_000_000_000);

    client.initialize(&treasury, &admin);
    let vault = client.create_vault(&owner, &token_addr);

    let deposit_amount: i128 = 50_000_000_000;
    client.deposit(&vault.vault_id, &deposit_amount);

    let withdraw_amount: i128 = 20_000_000_000;
    client.withdraw(&vault.vault_id, &withdraw_amount);

    let updated_vault = client.get_vault(&vault.vault_id);
    assert_eq!(updated_vault.balance, deposit_amount - withdraw_amount);
}

#[test]
#[should_panic(expected = "insufficient vault balance")]
fn test_withdraw_exceeding_balance() {
    let (env, _contract_id, client) = setup_env();
    let owner = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (token_addr, token_admin) = create_token(&env);
    token_admin.mint(&owner, &100_000_000_000);

    client.initialize(&treasury, &admin);
    let vault = client.create_vault(&owner, &token_addr);

    client.deposit(&vault.vault_id, &10_000_000);
    client.withdraw(&vault.vault_id, &20_000_000); // Should panic
}

// ═══════════════════════════════════════════════════════════════
// AGENT DELEGATION TESTS (Persistent Storage, not Capability Tokens)
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_delegate_agent() {
    let (env, _contract_id, client) = setup_env();
    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (token_addr, token_admin) = create_token(&env);
    token_admin.mint(&owner, &100_000_000_000);

    client.initialize(&treasury, &admin);
    let vault = client.create_vault(&owner, &token_addr);

    let max_exec = 1_000_000_000i128;
    let delegation = client.delegate_agent(&vault.vault_id, &agent, &max_exec);

    assert_eq!(delegation.vault_id, vault.vault_id);
    assert_eq!(delegation.agent, agent);
    assert!(delegation.is_active);
    assert_eq!(delegation.max_execution_amount, max_exec);
    assert_eq!(delegation.executions_count, 0);
    assert_eq!(delegation.total_profit, 0);
}

#[test]
fn test_revoke_agent() {
    let (env, _contract_id, client) = setup_env();
    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (token_addr, token_admin) = create_token(&env);
    token_admin.mint(&owner, &100_000_000_000);

    client.initialize(&treasury, &admin);
    let vault = client.create_vault(&owner, &token_addr);

    client.delegate_agent(&vault.vault_id, &agent, &1_000_000_000);

    // Revoke the agent by address
    client.revoke_agent(&vault.vault_id, &agent);

    let revoked = client.get_agent_delegation(&vault.vault_id, &agent);
    assert!(!revoked.is_active);
}

// ═══════════════════════════════════════════════════════════════
// SINGLE-INVOCATION FLASH LOAN TESTS
//
// The new pattern: one function call = borrow + execute + verify + repay.
// If anything fails, panic!() reverts everything atomically.
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_flash_loan_execute_success() {
    let (env, _contract_id, client) = setup_env();
    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let creator = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (base_token, _) = create_token(&env);
    let (quote_token, _) = create_token(&env);
    let (vault_token, vault_token_admin) = create_token(&env);
    vault_token_admin.mint(&owner, &100_000_000_000);

    client.initialize(&treasury, &admin);

    // Create vault and delegate agent
    let vault = client.create_vault(&owner, &vault_token);
    client.delegate_agent(&vault.vault_id, &agent, &1_000_000_000);

    // Create pool
    let pool = client.create_pool(
        &creator,
        &base_token,
        &quote_token,
        &1_000_000_0_000_000i128,
        &100_000_0_000_000i128,
        &30u32,
    );

    // Execute single-invocation flash loan
    let borrow_amount: i128 = 100_000_000;
    let min_profit: i128 = 0; // Accept any profit
    let profit = client.flash_loan_execute(
        &agent,
        &vault.vault_id,
        &pool.pool_id,
        &borrow_amount,
        &min_profit,
    );

    assert!(profit >= 0);

    // Check delegation was updated
    let updated_delegation = client.get_agent_delegation(&vault.vault_id, &agent);
    assert_eq!(updated_delegation.executions_count, 1);
    assert!(updated_delegation.total_profit >= 0);
}

#[test]
#[should_panic(expected = "insufficient pool liquidity")]
fn test_flash_loan_insufficient_liquidity() {
    let (env, _contract_id, client) = setup_env();
    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let creator = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (base_token, _) = create_token(&env);
    let (quote_token, _) = create_token(&env);
    let (vault_token, vault_token_admin) = create_token(&env);
    vault_token_admin.mint(&owner, &100_000_000_000);

    client.initialize(&treasury, &admin);

    let vault = client.create_vault(&owner, &vault_token);
    client.delegate_agent(&vault.vault_id, &agent, &1_000_000_000);

    let pool = client.create_pool(
        &creator,
        &base_token,
        &quote_token,
        &1_000i128, // Very small pool
        &100i128,
        &30u32,
    );

    // Try to borrow more than pool has — should panic + auto-revert
    client.flash_loan_execute(&agent, &vault.vault_id, &pool.pool_id, &10_000, &0);
}

#[test]
#[should_panic(expected = "agent delegation has been revoked")]
fn test_flash_loan_revoked_agent() {
    let (env, _contract_id, client) = setup_env();
    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let creator = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (base_token, _) = create_token(&env);
    let (quote_token, _) = create_token(&env);
    let (vault_token, vault_token_admin) = create_token(&env);
    vault_token_admin.mint(&owner, &100_000_000_000);

    client.initialize(&treasury, &admin);

    let vault = client.create_vault(&owner, &vault_token);
    client.delegate_agent(&vault.vault_id, &agent, &1_000_000_000);

    let pool = client.create_pool(
        &creator,
        &base_token,
        &quote_token,
        &1_000_000_0_000_000i128,
        &100_000_0_000_000i128,
        &30u32,
    );

    // Revoke agent, then try to execute — should panic
    client.revoke_agent(&vault.vault_id, &agent);
    client.flash_loan_execute(&agent, &vault.vault_id, &pool.pool_id, &100_000_000, &0);
}

#[test]
#[should_panic(expected = "exceeds agent max execution amount")]
fn test_flash_loan_exceeds_limit() {
    let (env, _contract_id, client) = setup_env();
    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let creator = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (base_token, _) = create_token(&env);
    let (quote_token, _) = create_token(&env);
    let (vault_token, vault_token_admin) = create_token(&env);
    vault_token_admin.mint(&owner, &100_000_000_000);

    client.initialize(&treasury, &admin);

    let vault = client.create_vault(&owner, &vault_token);
    client.delegate_agent(&vault.vault_id, &agent, &100); // Very low limit

    let pool = client.create_pool(
        &creator,
        &base_token,
        &quote_token,
        &1_000_000_0_000_000i128,
        &100_000_0_000_000i128,
        &30u32,
    );

    // Try to execute more than max — should panic
    client.flash_loan_execute(&agent, &vault.vault_id, &pool.pool_id, &1_000_000, &0);
}

// ═══════════════════════════════════════════════════════════════
// STELLAR-NATIVE AGENT OPERATION TESTS
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_execute_path_arbitrage() {
    let (env, _contract_id, client) = setup_env();
    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (vault_token, vault_token_admin) = create_token(&env);
    vault_token_admin.mint(&owner, &100_000_000_000);

    client.initialize(&treasury, &admin);

    let vault = client.create_vault(&owner, &vault_token);
    client.delegate_agent(&vault.vault_id, &agent, &1_000_000_000);

    // Execute path arbitrage: amount=1000, min_output=1050 (5% profit)
    let profit = client.execute_path_arbitrage(
        &agent,
        &vault.vault_id,
        &3u32,        // 3 hops: XLM → yXLM → USDC → XLM
        &1000i128,
        &1050i128,    // min output
    );

    assert_eq!(profit, 50);

    let delegation = client.get_agent_delegation(&vault.vault_id, &agent);
    assert_eq!(delegation.executions_count, 1);
    assert_eq!(delegation.total_profit, 50);
}

#[test]
#[should_panic(expected = "path arbitrage must produce positive output")]
fn test_execute_path_arbitrage_no_profit() {
    let (env, _contract_id, client) = setup_env();
    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (vault_token, vault_token_admin) = create_token(&env);
    vault_token_admin.mint(&owner, &100_000_000_000);

    client.initialize(&treasury, &admin);

    let vault = client.create_vault(&owner, &vault_token);
    client.delegate_agent(&vault.vault_id, &agent, &1_000_000_000);

    // Try path arb with output <= input — should panic
    client.execute_path_arbitrage(&agent, &vault.vault_id, &2u32, &1000i128, &999i128);
}

#[test]
fn test_execute_cross_dex() {
    let (env, _contract_id, client) = setup_env();
    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (vault_token, vault_token_admin) = create_token(&env);
    vault_token_admin.mint(&owner, &100_000_000_000);

    client.initialize(&treasury, &admin);

    let vault = client.create_vault(&owner, &vault_token);
    client.delegate_agent(&vault.vault_id, &agent, &1_000_000_000);

    // Buy on SDEX for 950, sell on Soroswap for 980 = 30 profit
    let profit = client.execute_cross_dex(
        &agent,
        &vault.vault_id,
        &1000i128,
        &950i128,   // SDEX buy price
        &980i128,   // Soroswap sell price
    );

    assert_eq!(profit, 30);
}

#[test]
fn test_execute_soroswap_swap() {
    let (env, _contract_id, client) = setup_env();
    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (vault_token, vault_token_admin) = create_token(&env);
    vault_token_admin.mint(&owner, &100_000_000_000);

    client.initialize(&treasury, &admin);

    let vault = client.create_vault(&owner, &vault_token);
    client.delegate_agent(&vault.vault_id, &agent, &1_000_000_000);

    let out = client.execute_soroswap_swap(
        &agent,
        &vault.vault_id,
        &1000i128,
        &110i128,    // min amount out
    );

    assert_eq!(out, 110);

    let delegation = client.get_agent_delegation(&vault.vault_id, &agent);
    assert_eq!(delegation.executions_count, 1);
}

#[test]
fn test_execute_blend_yield() {
    let (env, _contract_id, client) = setup_env();
    let owner = Address::generate(&env);
    let agent = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (vault_token, vault_token_admin) = create_token(&env);
    vault_token_admin.mint(&owner, &100_000_000_000);

    client.initialize(&treasury, &admin);

    let vault = client.create_vault(&owner, &vault_token);
    client.delegate_agent(&vault.vault_id, &agent, &1_000_000_000);

    // Supply 5000 to Blend
    client.execute_blend_yield(&agent, &vault.vault_id, &true, &5000i128);

    let delegation = client.get_agent_delegation(&vault.vault_id, &agent);
    assert_eq!(delegation.executions_count, 1);
}

// ═══════════════════════════════════════════════════════════════
// POOL TESTS
// ═══════════════════════════════════════════════════════════════

#[test]
fn test_pool_creation() {
    let (env, _contract_id, client) = setup_env();
    let creator = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (base_token, _) = create_token(&env);
    let (quote_token, _) = create_token(&env);

    client.initialize(&treasury, &admin);

    let pool = client.create_pool(
        &creator,
        &base_token,
        &quote_token,
        &1_000_000i128,
        &500_000i128,
        &30u32,
    );

    assert_eq!(pool.pool_id, 1);
    assert_eq!(pool.base_balance, 1_000_000);
    assert_eq!(pool.quote_balance, 500_000);
    assert_eq!(pool.flash_loan_fee_bps, 30);
    assert_eq!(pool.total_flash_loans, 0);

    assert_eq!(client.get_pool_count(), 1);
}

#[test]
#[should_panic(expected = "fee too high")]
fn test_pool_creation_excessive_fee() {
    let (env, _contract_id, client) = setup_env();
    let creator = Address::generate(&env);
    let treasury = Address::generate(&env);
    let admin = Address::generate(&env);

    let (base_token, _) = create_token(&env);
    let (quote_token, _) = create_token(&env);

    client.initialize(&treasury, &admin);

    // 10% fee — should panic (max is 5%)
    client.create_pool(
        &creator,
        &base_token,
        &quote_token,
        &1_000_000i128,
        &500_000i128,
        &1000u32,
    );
}
