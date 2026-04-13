#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, Map,
};

// ═══════════════════════════════════════════════════════════════
// DATA STRUCTURES
// ═══════════════════════════════════════════════════════════════

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    TrustedOracle,
    AgentScore(Address),
    TotalReports,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ScoreRecord {
    pub current_score: i32,
    pub last_update: u64,
    pub total_success: u64,
    pub total_failure: u64,
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const TTL_LEDGERS: u32 = 1_000_000;
const INITIAL_SCORE: i32 = 1000;

#[contract]
pub struct NeuralSentinelContract;

#[contractimpl]
impl NeuralSentinelContract {
    pub fn initialize(env: Env, admin: Address, oracle: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TrustedOracle, &oracle);
        env.storage().instance().set(&DataKey::TotalReports, &0u64);
    }

    /// Report agent performance. Delta can be positive or negative.
    /// IR-SECURITY-01: Only the Trusted Oracle (e.g. Settlement Hub) can call this.
    pub fn report_performance(env: Env, agent: Address, success: bool) {
        let oracle: Address = env.storage().instance().get(&DataKey::TrustedOracle).expect("not initialized");
        oracle.require_auth();

        let mut record: ScoreRecord = env
            .storage()
            .persistent()
            .get(&DataKey::AgentScore(agent.clone()))
            .unwrap_or(ScoreRecord {
                current_score: INITIAL_SCORE,
                last_update: env.ledger().timestamp(),
                total_success: 0,
                total_failure: 0,
            });

        if success {
            record.current_score += 10;
            record.total_success += 1;
        } else {
            record.current_score -= 25; // Harsher penalty for failure
            record.total_failure += 1;
        }

        record.last_update = env.ledger().timestamp();
        
        env.storage().persistent().set(&DataKey::AgentScore(agent.clone()), &record);
        
        // TTL Extension (SC-TTL-001)
        env.storage().persistent().extend_ttl(&DataKey::AgentScore(agent.clone()), TTL_LEDGERS, TTL_LEDGERS);

        let total: u64 = env.storage().instance().get(&DataKey::TotalReports).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalReports, &(total + 1));

        env.events().publish(
            (symbol_short!("sentinel"), symbol_short!("report")),
            (agent, record.current_score),
        );
    }

    pub fn get_score(env: Env, agent: Address) -> i32 {
        let record: ScoreRecord = env
            .storage()
            .persistent()
            .get(&DataKey::AgentScore(agent))
            .unwrap_or(ScoreRecord {
                current_score: INITIAL_SCORE,
                last_update: 0,
                total_success: 0,
                total_failure: 0,
            });
        record.current_score
    }

    pub fn get_record(env: Env, agent: Address) -> ScoreRecord {
        env.storage()
            .persistent()
            .get(&DataKey::AgentScore(agent))
            .expect("record not found")
    }
}
