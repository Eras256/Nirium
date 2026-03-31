
//! ═══════════════════════════════════════════════════════
//! Nirium — Strategy Marketplace Contract (Soroban)
//! ═══════════════════════════════════════════════════════
//!
//! Permissionless registry for published trading strategies.
//! Creators publish strategies with IPFS CID.
//! Users can subscribe; a subscription fee goes 100% to the creator.

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contractmeta,
    Address, Env, String, token, symbol_short,
};

contractmeta!(
    key = "Description",
    val = "Nirium Strategy Marketplace - Permissionless strategy registry on Stellar Testnet"
);

/// A published strategy listing
#[contracttype]
#[derive(Clone, Debug)]
pub struct StrategyListing {
    pub id: u64,
    pub creator: Address,
    pub name: String,
    pub ipfs_cid: String,         // IPFS CID of the strategy code/params
    pub subscription_fee_usdc: i128, // monthly fee in stroops USDC
    pub elo_score: i64,           // mirrors the creator's ELO from reputation contract
    pub subscriber_count: u64,
    pub total_revenue_usdc: i128,
    pub is_active: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Treasury,
    /// SECURITY FIX: Store canonical USDC token address to prevent token spoofing.
    /// The subscribe() function previously accepted a `usdc_token: Address` parameter,
    /// allowing attackers to pass a fake token contract that does nothing on transfer.
    /// Now the token address is set at initialization and retrieved from storage.
    UsdcToken,
    NextId,
    Strategy(u64),
    StrategyCount,
}

const CREATOR_SHARE_BPS: i128 = 9900; // 99% to creator
const PROTOCOL_SHARE_BPS: i128 = 100;  // 1% to protocol treasury

/// ~2 years at 5s/ledger — prevents silent data expiration (SC-TTL-001)
const TTL_LEDGERS: u32 = 1_000_000;

#[contract]
pub struct StrategyMarketplaceContract;

#[contractimpl]
impl StrategyMarketplaceContract {
    /// Initialize with admin, treasury, and canonical USDC token addresses.
    /// SECURITY (SC04 — Front-Run Prevention): admin must sign this call.
    pub fn initialize(env: Env, admin: Address, treasury: Address, usdc_token: Address) {
        // Require admin authorization to prevent front-running initialization
        admin.require_auth();
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Treasury, &treasury);
        // SECURITY: Store canonical USDC token address to prevent token spoofing in subscribe()
        env.storage().instance().set(&DataKey::UsdcToken, &usdc_token);
        env.storage().instance().set(&DataKey::NextId, &1u64);
        env.storage().instance().set(&DataKey::StrategyCount, &0u64);
    }

    /// Publish a new strategy to the marketplace
    pub fn publish_strategy(
        env: Env,
        creator: Address,
        name: String,
        ipfs_cid: String,
        subscription_fee_usdc: i128,
    ) -> u64 {
        creator.require_auth();

        let id: u64 = env.storage().instance()
            .get(&DataKey::NextId).unwrap_or(1);

        let listing = StrategyListing {
            id,
            creator: creator.clone(),
            name,
            ipfs_cid,
            subscription_fee_usdc,
            elo_score: 1200, // Initial ELO — updated by reputation contract
            subscriber_count: 0,
            total_revenue_usdc: 0,
            is_active: true,
        };

        env.storage().persistent().set(&DataKey::Strategy(id), &listing);
        env.storage().instance().set(&DataKey::NextId, &(id + 1));

        // TTL extension on publish (SC-TTL-001)
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Strategy(id), TTL_LEDGERS, TTL_LEDGERS);

        let count: u64 = env.storage().instance()
            .get(&DataKey::StrategyCount).unwrap_or(0);
        env.storage().instance().set(&DataKey::StrategyCount, &(count + 1));

        // Emit event
        env.events().publish(
            (symbol_short!("publish"), creator),
            id,
        );

        id
    }

    /// Subscribe to a strategy — pays fee, splits to creator + treasury.
    ///
    /// SECURITY FIX (Token Spoofing — SC04 variant):
    /// The `usdc_token` parameter has been REMOVED. The canonical USDC token address
    /// is now read from contract storage (set at initialization), preventing an attacker
    /// from passing a fake token contract that implements the token interface but does
    /// nothing on `transfer()`, effectively bypassing the payment.
    pub fn subscribe(
        env: Env,
        subscriber: Address,
        strategy_id: u64,
    ) {
        subscriber.require_auth();

        let key = DataKey::Strategy(strategy_id);
        let mut listing: StrategyListing = env.storage().persistent()
            .get(&key)
            .expect("Strategy not found");

        if !listing.is_active {
            panic!("Strategy is deactivated");
        }

        let fee = listing.subscription_fee_usdc;
        if fee <= 0 {
            panic!("Invalid subscription fee");
        }

        // SECURITY: Read canonical token address from storage — not from caller input
        let usdc_token: Address = env.storage().instance()
            .get(&DataKey::UsdcToken).expect("USDC token not configured");
        let treasury: Address = env.storage().instance()
            .get(&DataKey::Treasury).expect("Not initialized");

        // Calculate 1% protocol fee and 99% creator royalty
        let protocol_fee = (fee * PROTOCOL_SHARE_BPS) / 10000;
        let creator_royalty = fee - protocol_fee;

        let token_client = token::Client::new(&env, &usdc_token);

        // Transfer 99% to creator
        token_client.transfer(&subscriber, &listing.creator, &creator_royalty);
        // Transfer 1% to protocol treasury
        token_client.transfer(&subscriber, &treasury, &protocol_fee);

        // Update listing stats
        listing.subscriber_count += 1;
        listing.total_revenue_usdc += fee;
        env.storage().persistent().set(&key, &listing);

        // TTL extension on subscribe (SC-TTL-001)
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);

        // Emit subscribe event
        env.events().publish(
            (symbol_short!("subscrib"), subscriber),
            strategy_id,
        );
    }

    /// Update ELO score for a strategy (called by admin/reputation contract)
    pub fn update_elo(env: Env, caller: Address, strategy_id: u64, new_elo: i64) {
        let admin: Address = env.storage().instance()
            .get(&DataKey::Admin).expect("Not initialized");
        caller.require_auth();
        if caller != admin {
            panic!("Only admin can update ELO");
        }

        let key = DataKey::Strategy(strategy_id);
        let mut listing: StrategyListing = env.storage().persistent()
            .get(&key)
            .expect("Strategy not found");
        listing.elo_score = new_elo;
        env.storage().persistent().set(&key, &listing);

        // TTL extension on ELO update (SC-TTL-001)
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);
    }

    /// Deactivate a strategy (creator or admin only)
    pub fn deactivate(env: Env, caller: Address, strategy_id: u64) {
        caller.require_auth();
        let admin: Address = env.storage().instance()
            .get(&DataKey::Admin).expect("Not initialized");

        let key = DataKey::Strategy(strategy_id);
        let mut listing: StrategyListing = env.storage().persistent()
            .get(&key)
            .expect("Strategy not found");

        if caller != admin && caller != listing.creator {
            panic!("Only creator or admin can deactivate");
        }

        listing.is_active = false;
        env.storage().persistent().set(&key, &listing);

        // TTL extension on deactivate (SC-TTL-001)
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);
    }

    /// Get a strategy listing
    pub fn get_strategy(env: Env, strategy_id: u64) -> Option<StrategyListing> {
        env.storage().persistent().get(&DataKey::Strategy(strategy_id))
    }

    /// Get total number of published strategies
    pub fn get_strategy_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::StrategyCount).unwrap_or(0)
    }
}
