
//! ═══════════════════════════════════════════════════════
//! Nirium — ELO Reputation Contract (Soroban)
//! ═══════════════════════════════════════════════════════
//!
//! Tracks ELO scores for agents and strategy creators.
//! ELO goes up on profitable trades, down on losses.
//! Tiers: Silver (<1500) | Gold (1500-2000) | Matrix (>2000)

#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, contractmeta, Address, Env, String, Vec, symbol_short};

contractmeta!(
    key = "Description",
    val = "Nirium ELO Reputation System - Tracks sentinel rankings on Stellar Testnet"
);

/// ELO Tier enum
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum Tier {
    Unranked,
    Silver,
    Gold,
    Matrix,
}

/// A sentinel (agent or creator) profile
#[contracttype]
#[derive(Clone, Debug)]
pub struct SentinelProfile {
    pub address: Address,
    pub elo_score: i64,
    pub total_trades: u64,
    pub winning_trades: u64,
    pub total_volume_usdc: i128,
    pub tier: Tier,
}

/// Storage keys
#[contracttype]
pub enum DataKey {
    Admin,
    Sentinel(Address),
    TotalSentinels,
}

const ELO_INITIAL: i64 = 1200;
const ELO_K_FACTOR: i64 = 32;
const SILVER_THRESHOLD: i64 = 1500;
const GOLD_THRESHOLD: i64 = 2000;

/// ~2 years at 5s/ledger — prevents silent data expiration (SC-TTL-001)
const TTL_LEDGERS: u32 = 1_000_000;

fn compute_tier(elo: i64) -> Tier {
    if elo >= GOLD_THRESHOLD {
        Tier::Matrix
    } else if elo >= SILVER_THRESHOLD {
        Tier::Gold
    } else if elo >= 1000 {
        Tier::Silver
    } else {
        Tier::Unranked
    }
}

#[contract]
pub struct EloReputationContract;

#[contractimpl]
impl EloReputationContract {
    /// Initialize the contract with an admin address
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalSentinels, &0u64);
    }

    /// Register a new sentinel with initial ELO
    pub fn register_sentinel(env: Env, sentinel: Address) -> SentinelProfile {
        // Anyone can register themselves
        sentinel.require_auth();

        let key = DataKey::Sentinel(sentinel.clone());
        if env.storage().persistent().has(&key) {
            panic!("Sentinel already registered");
        }

        let profile = SentinelProfile {
            address: sentinel.clone(),
            elo_score: ELO_INITIAL,
            total_trades: 0,
            winning_trades: 0,
            total_volume_usdc: 0,
            tier: Tier::Silver,
        };

        env.storage().persistent().set(&key, &profile);

        // TTL extension on registration (SC-TTL-001)
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);

        // Increment total sentinels
        let total: u64 = env.storage().instance().get(&DataKey::TotalSentinels).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSentinels, &(total + 1));

        profile
    }

    /// Record a trade result and update ELO score.
    /// Called by the vault or authorized agent.
    /// profit_usdc: positive = win, negative = loss
    pub fn record_trade(
        env: Env,
        caller: Address,
        sentinel: Address,
        profit_usdc: i128,
        volume_usdc: i128,
    ) -> SentinelProfile {
        // Only admin or the vault contract can record trades
        let admin: Address = env.storage().instance().get(&DataKey::Admin).expect("Not initialized");
        caller.require_auth();
        if caller != admin {
            panic!("Only admin can record trades");
        }

        let key = DataKey::Sentinel(sentinel.clone());
        let mut profile: SentinelProfile = env.storage().persistent()
            .get(&key)
            .unwrap_or(SentinelProfile {
                address: sentinel.clone(),
                elo_score: ELO_INITIAL,
                total_trades: 0,
                winning_trades: 0,
                total_volume_usdc: 0,
                tier: Tier::Silver,
            });

        // ELO calculation: win = +K, loss = -K (simplified)
        let won = profit_usdc > 0;
        if won {
            profile.elo_score += ELO_K_FACTOR;
            profile.winning_trades += 1;
        } else {
            profile.elo_score -= ELO_K_FACTOR / 2; // Smaller penalty
            if profile.elo_score < 0 {
                profile.elo_score = 0;
            }
        }

        profile.total_trades += 1;
        profile.total_volume_usdc += volume_usdc;
        profile.tier = compute_tier(profile.elo_score);

        env.storage().persistent().set(&key, &profile);

        // TTL extension on every trade record (SC-TTL-001)
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);

        profile
    }

    /// Get a sentinel's profile
    pub fn get_profile(env: Env, sentinel: Address) -> Option<SentinelProfile> {
        env.storage().persistent().get(&DataKey::Sentinel(sentinel))
    }

    /// Get the ELO score of a sentinel
    pub fn get_elo(env: Env, sentinel: Address) -> i64 {
        let profile: Option<SentinelProfile> = env.storage().persistent()
            .get(&DataKey::Sentinel(sentinel));
        profile.map(|p| p.elo_score).unwrap_or(0)
    }

    /// Get total number of registered sentinels
    pub fn get_total_sentinels(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::TotalSentinels).unwrap_or(0)
    }
}
