// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Nirium Protocol Contributors

//! ═══════════════════════════════════════════════════════════════
//! NiriumProtocol — Unified Protocol Registry (Soroban)
//! ═══════════════════════════════════════════════════════════════
//!
//! Merges four contracts into one auditable unit:
//!   1. ELO Reputation  — tracks agent/creator performance scores
//!   2. Strategy Market — permissionless IPFS strategy registry
//!   3. Agent Scoring   — oracle-based success/failure reporting
//!   4. Skill Gate      — x402 proof-of-payment for agent skills
//!
//! Single admin address controls all privileged operations.
//! All persistent storage is extended to TTL_LEDGERS (~2 years).

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contractmeta, contracttype,
    symbol_short, token, Address, Env, String,
};

contractmeta!(
    key = "Description",
    val = "NiriumProtocol v1.0 — ELO + Strategy Registry + Agent Scoring + Skill Gate on Stellar Testnet"
);

// ─── TTL ────────────────────────────────────────────────────────
/// ~2 years at 5 s/ledger — all persistent entries extend to this
const TTL_LEDGERS: u32 = 1_000_000;

// ─── ELO constants ───────────────────────────────────────────────
const ELO_INITIAL: i64 = 1200;
const ELO_K_WIN: i64 = 32;
const ELO_K_LOSS: i64 = 16;
const ELO_SILVER: i64 = 1500;
const ELO_GOLD: i64 = 2000;

// ─── Strategy marketplace constants ──────────────────────────────
const CREATOR_SHARE_BPS: i128 = 9500; // 95% to creator
const PROTOCOL_SHARE_BPS: i128 = 500;  // 5%  to protocol treasury (software marketplace fee)

// ─── Agent scoring constants ─────────────────────────────────────
const SCORE_INITIAL: i32 = 1000;
const SCORE_WIN: i32 = 10;
const SCORE_LOSS: i32 = 25;

// ═══════════════════════════════════════════════════════════════
// STORAGE KEYS — prefixed to avoid collisions
// ═══════════════════════════════════════════════════════════════

#[contracttype]
pub enum DataKey {
    // ── Config ─────────────────────────────────────────────
    Admin,
    Treasury,
    UsdcToken,

    // ── ELO (prefix E_) ────────────────────────────────────
    EAgent(Address),
    ETotalAgents,

    // ── Strategy marketplace (prefix S_) ───────────────────
    SStrategy(u64),
    SNextId,
    SCount,

    // ── Agent performance scoring (prefix P_) ───────────────
    PScore(Address),
    PTotalReports,

    // ── Skill gate (prefix K_) ─────────────────────────────
    KPrice(String),
}

// ═══════════════════════════════════════════════════════════════
// DATA STRUCTURES
// ═══════════════════════════════════════════════════════════════

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum Tier {
    Unranked,
    Silver,
    Gold,
    Elite,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct AgentProfile {
    pub address: Address,
    pub elo_score: i64,
    pub total_trades: u64,
    pub winning_trades: u64,
    pub total_volume_usdc: i128,
    pub tier: Tier,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct StrategyListing {
    pub id: u64,
    pub creator: Address,
    pub name: String,
    pub ipfs_cid: String,
    pub subscription_fee_usdc: i128,
    pub elo_score: i64,
    pub subscriber_count: u64,
    pub total_revenue_usdc: i128,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct ScoreRecord {
    pub address: Address,
    pub current_score: i32,
    pub last_update: u64,
    pub total_success: u64,
    pub total_failure: u64,
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

fn compute_tier(elo: i64) -> Tier {
    if elo >= ELO_GOLD {
        Tier::Elite
    } else if elo >= ELO_SILVER {
        Tier::Gold
    } else if elo >= 1000 {
        Tier::Silver
    } else {
        Tier::Unranked
    }
}

fn require_admin(env: &Env, caller: &Address) {
    let admin: Address = env.storage().instance().get(&DataKey::Admin).expect("not initialized");
    caller.require_auth();
    if *caller != admin {
        panic!("only admin");
    }
}

// ═══════════════════════════════════════════════════════════════
// CONTRACT
// ═══════════════════════════════════════════════════════════════

#[contract]
pub struct NiriumProtocolContract;

#[contractimpl]
impl NiriumProtocolContract {

    // ────────────────────────────────────────────────────────────
    // INIT
    // ────────────────────────────────────────────────────────────

    /// Initialize once. Admin must sign.
    pub fn initialize(env: Env, admin: Address, treasury: Address, usdc_token: Address) {
        admin.require_auth();
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Treasury, &treasury);
        env.storage().instance().set(&DataKey::UsdcToken, &usdc_token);
        env.storage().instance().set(&DataKey::SNextId, &1u64);
        env.storage().instance().set(&DataKey::SCount, &0u64);
        env.storage().instance().set(&DataKey::ETotalAgents, &0u64);
        env.storage().instance().set(&DataKey::PTotalReports, &0u64);
    }

    // ────────────────────────────────────────────────────────────
    // ELO REPUTATION
    // ────────────────────────────────────────────────────────────

    /// Register an agent. Anyone can register themselves.
    pub fn register_agent(env: Env, agent: Address) -> AgentProfile {
        agent.require_auth();
        let key = DataKey::EAgent(agent.clone());
        if env.storage().persistent().has(&key) {
            panic!("already registered");
        }
        let profile = AgentProfile {
            address: agent.clone(),
            elo_score: ELO_INITIAL,
            total_trades: 0,
            winning_trades: 0,
            total_volume_usdc: 0,
            tier: Tier::Silver,
        };
        env.storage().persistent().set(&key, &profile);
        env.storage().persistent().extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);

        let total: u64 = env.storage().instance().get(&DataKey::ETotalAgents).unwrap_or(0);
        env.storage().instance().set(&DataKey::ETotalAgents, &(total + 1));

        env.events().publish((symbol_short!("elo"), symbol_short!("register")), agent);
        profile
    }

    /// Record a trade. Admin only (called by vault or trusted backend).
    /// profit_usdc > 0 = win, < 0 = loss.
    pub fn record_trade(
        env: Env,
        caller: Address,
        agent: Address,
        profit_usdc: i128,
        volume_usdc: i128,
    ) -> AgentProfile {
        require_admin(&env, &caller);

        let key = DataKey::EAgent(agent.clone());
        let mut profile: AgentProfile = env.storage().persistent().get(&key)
            .unwrap_or(AgentProfile {
                address: agent.clone(),
                elo_score: ELO_INITIAL,
                total_trades: 0,
                winning_trades: 0,
                total_volume_usdc: 0,
                tier: Tier::Silver,
            });

        if profit_usdc > 0 {
            profile.elo_score += ELO_K_WIN;
            profile.winning_trades += 1;
        } else {
            profile.elo_score -= ELO_K_LOSS;
            if profile.elo_score < 0 {
                profile.elo_score = 0;
            }
        }
        profile.total_trades += 1;
        profile.total_volume_usdc += volume_usdc;
        profile.tier = compute_tier(profile.elo_score);

        env.storage().persistent().set(&key, &profile);
        env.storage().persistent().extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);

        env.events().publish((symbol_short!("elo"), symbol_short!("trade")), (agent, profit_usdc));
        profile
    }

    pub fn get_agent_profile(env: Env, agent: Address) -> Option<AgentProfile> {
        env.storage().persistent().get(&DataKey::EAgent(agent))
    }

    pub fn get_elo(env: Env, agent: Address) -> i64 {
        let p: Option<AgentProfile> = env.storage().persistent().get(&DataKey::EAgent(agent));
        p.map(|x| x.elo_score).unwrap_or(ELO_INITIAL)
    }

    pub fn get_total_agents(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::ETotalAgents).unwrap_or(0)
    }

    // ────────────────────────────────────────────────────────────
    // STRATEGY MARKETPLACE
    // ────────────────────────────────────────────────────────────

    /// Publish a strategy with an IPFS CID. Creator must sign.
    pub fn publish_strategy(
        env: Env,
        creator: Address,
        name: String,
        ipfs_cid: String,
        subscription_fee_usdc: i128,
    ) -> u64 {
        creator.require_auth();

        let id: u64 = env.storage().instance().get(&DataKey::SNextId).unwrap_or(1);
        let listing = StrategyListing {
            id,
            creator: creator.clone(),
            name,
            ipfs_cid,
            subscription_fee_usdc,
            elo_score: ELO_INITIAL,
            subscriber_count: 0,
            total_revenue_usdc: 0,
            is_active: true,
        };

        let key = DataKey::SStrategy(id);
        env.storage().persistent().set(&key, &listing);
        env.storage().persistent().extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);

        env.storage().instance().set(&DataKey::SNextId, &(id + 1));
        let count: u64 = env.storage().instance().get(&DataKey::SCount).unwrap_or(0);
        env.storage().instance().set(&DataKey::SCount, &(count + 1));

        env.events().publish((symbol_short!("strat"), symbol_short!("publish")), (creator, id));
        id
    }

    /// Subscribe to a strategy — pays fee, 95% to creator, 5% protocol (software marketplace fee).
    /// USDC token is read from storage (prevents token spoofing).
    pub fn subscribe(env: Env, subscriber: Address, strategy_id: u64) {
        subscriber.require_auth();

        let key = DataKey::SStrategy(strategy_id);
        let mut listing: StrategyListing = env.storage().persistent()
            .get(&key).expect("strategy not found");

        if !listing.is_active {
            panic!("strategy deactivated");
        }
        let fee = listing.subscription_fee_usdc;
        if fee <= 0 {
            panic!("invalid fee");
        }

        let usdc: Address = env.storage().instance().get(&DataKey::UsdcToken).expect("not initialized");
        let treasury: Address = env.storage().instance().get(&DataKey::Treasury).expect("not initialized");
        let protocol_fee = (fee * PROTOCOL_SHARE_BPS) / 10000;
        let creator_royalty = fee - protocol_fee;

        let tok = token::Client::new(&env, &usdc);
        tok.transfer(&subscriber, &listing.creator, &creator_royalty);
        tok.transfer(&subscriber, &treasury, &protocol_fee);

        listing.subscriber_count += 1;
        listing.total_revenue_usdc += fee;
        env.storage().persistent().set(&key, &listing);
        env.storage().persistent().extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);

        env.events().publish((symbol_short!("strat"), symbol_short!("subscrib")), (subscriber, strategy_id));
    }

    /// Deactivate a strategy. Creator or admin only.
    pub fn deactivate_strategy(env: Env, caller: Address, strategy_id: u64) {
        caller.require_auth();
        let admin: Address = env.storage().instance().get(&DataKey::Admin).expect("not initialized");
        let key = DataKey::SStrategy(strategy_id);
        let mut listing: StrategyListing = env.storage().persistent()
            .get(&key).expect("strategy not found");
        if caller != admin && caller != listing.creator {
            panic!("only creator or admin");
        }
        listing.is_active = false;
        env.storage().persistent().set(&key, &listing);
        env.storage().persistent().extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);
    }

    /// Update strategy ELO score. Admin only.
    pub fn update_strategy_elo(env: Env, caller: Address, strategy_id: u64, new_elo: i64) {
        require_admin(&env, &caller);
        let key = DataKey::SStrategy(strategy_id);
        let mut listing: StrategyListing = env.storage().persistent()
            .get(&key).expect("strategy not found");
        listing.elo_score = new_elo;
        env.storage().persistent().set(&key, &listing);
        env.storage().persistent().extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);
    }

    pub fn get_strategy(env: Env, strategy_id: u64) -> Option<StrategyListing> {
        env.storage().persistent().get(&DataKey::SStrategy(strategy_id))
    }

    pub fn get_strategy_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::SCount).unwrap_or(0)
    }

    // ────────────────────────────────────────────────────────────
    // AGENT PERFORMANCE SCORING
    // ────────────────────────────────────────────────────────────

    /// Report agent performance. Admin only.
    pub fn report_performance(env: Env, caller: Address, agent: Address, success: bool) {
        require_admin(&env, &caller);

        let key = DataKey::PScore(agent.clone());
        let mut record: ScoreRecord = env.storage().persistent()
            .get(&key)
            .unwrap_or(ScoreRecord {
                address: agent.clone(),
                current_score: SCORE_INITIAL,
                last_update: env.ledger().timestamp(),
                total_success: 0,
                total_failure: 0,
            });

        if success {
            record.current_score += SCORE_WIN;
            record.total_success += 1;
        } else {
            record.current_score -= SCORE_LOSS;
            if record.current_score < 0 {
                record.current_score = 0;
            }
            record.total_failure += 1;
        }
        record.last_update = env.ledger().timestamp();

        env.storage().persistent().set(&key, &record);
        env.storage().persistent().extend_ttl(&key, TTL_LEDGERS, TTL_LEDGERS);

        let total: u64 = env.storage().instance().get(&DataKey::PTotalReports).unwrap_or(0);
        env.storage().instance().set(&DataKey::PTotalReports, &(total + 1));

        env.events().publish((symbol_short!("score"), symbol_short!("report")), (agent, success));
    }

    pub fn get_score(env: Env, agent: Address) -> i32 {
        let r: Option<ScoreRecord> = env.storage().persistent().get(&DataKey::PScore(agent));
        r.map(|x| x.current_score).unwrap_or(SCORE_INITIAL)
    }

    pub fn get_score_record(env: Env, agent: Address) -> Option<ScoreRecord> {
        env.storage().persistent().get(&DataKey::PScore(agent))
    }

    // ────────────────────────────────────────────────────────────
    // SKILL GATE (x402 proof-of-payment)
    // ────────────────────────────────────────────────────────────

    /// Set price for a skill. Admin only.
    pub fn set_skill_price(env: Env, caller: Address, skill_id: String, price: i128) {
        require_admin(&env, &caller);
        env.storage().instance().set(&DataKey::KPrice(skill_id), &price);
    }

    /// Unlock a skill by paying USDC. Agent must sign.
    /// Atomically verifies identity, deducts fee, emits access event.
    pub fn unlock_skill(env: Env, agent: Address, skill_id: String) {
        agent.require_auth();

        let usdc: Address = env.storage().instance().get(&DataKey::UsdcToken).expect("not initialized");
        let treasury: Address = env.storage().instance().get(&DataKey::Treasury).expect("not initialized");
        // Default 5 USDC (5_000_000 stroops) if not set
        let price: i128 = env.storage().instance()
            .get(&DataKey::KPrice(skill_id.clone())).unwrap_or(5_000_000);

        let tok = token::Client::new(&env, &usdc);
        tok.transfer(&agent, &treasury, &price);

        env.events().publish(
            (symbol_short!("skill"), symbol_short!("unlock")),
            (agent, skill_id, price),
        );
    }

    pub fn get_skill_price(env: Env, skill_id: String) -> i128 {
        env.storage().instance().get(&DataKey::KPrice(skill_id)).unwrap_or(5_000_000)
    }

    // ────────────────────────────────────────────────────────────
    // ADMIN UTILS
    // ────────────────────────────────────────────────────────────

    /// Transfer admin to a new address. Current admin must sign.
    pub fn transfer_admin(env: Env, current_admin: Address, new_admin: Address) {
        require_admin(&env, &current_admin);
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        env.events().publish((symbol_short!("admin"), symbol_short!("transfer")), new_admin);
    }

    /// Update USDC token address. Admin only.
    pub fn set_usdc_token(env: Env, caller: Address, usdc_token: Address) {
        require_admin(&env, &caller);
        env.storage().instance().set(&DataKey::UsdcToken, &usdc_token);
    }
}
