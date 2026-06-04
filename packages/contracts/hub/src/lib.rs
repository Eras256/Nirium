// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Nirium Protocol Contributors

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, String,
};

// ═══════════════════════════════════════════════════════════════
// DATA STRUCTURES
// ═══════════════════════════════════════════════════════════════

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    Treasury,
    Sentinel,
    Asset,
    Session(Address), // User -> Session
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SettlementSession {
    pub user: Address,
    pub agent: Address,
    pub budget: i128,
    pub spent: i128,
    pub expiry: u64,
    pub is_active: bool,
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const TTL_LEDGERS: u32 = 1_000_000;

#[contract]
pub struct SettlementHubContract;

#[contractimpl]
impl SettlementHubContract {
    pub fn initialize(env: Env, admin: Address, treasury: Address, sentinel: Address, asset: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Treasury, &treasury);
        env.storage().instance().set(&DataKey::Sentinel, &sentinel);
        env.storage().instance().set(&DataKey::Asset, &asset);
    }

    /// Open a high-frequency settlement session (MPP).
    /// IR-SECURITY-01: Requires USER auth to lock capital for the agent.
    pub fn open_session(env: Env, user: Address, agent: Address, budget: i128, duration: u64) {
        user.require_auth();
        
        let asset: Address = env.storage().instance().get(&DataKey::Asset).expect("not initialized");
        let client = token::Client::new(&env, &asset);
        
        // Transfer budget to the contract's escrow
        client.transfer(&user, &env.current_contract_address(), &budget);

        let session = SettlementSession {
            user: user.clone(),
            agent: agent.clone(),
            budget,
            spent: 0,
            expiry: env.ledger().timestamp() + duration,
            is_active: true,
        };

        env.storage().persistent().set(&DataKey::Session(user.clone()), &session);
        env.storage().persistent().extend_ttl(&DataKey::Session(user.clone()), TTL_LEDGERS, TTL_LEDGERS);

        env.events().publish(
            (symbol_short!("hub"), symbol_short!("session")),
            (user, agent, budget),
        );
    }

    /// Execute an x402 settlement intent.
    /// IR-SECURITY-02: Requires AGENT auth. Checks session budget and expiry.
    pub fn settle_intent(env: Env, user: Address, amount: i128, memo: String) {
        let mut session: SettlementSession = env
            .storage()
            .persistent()
            .get(&DataKey::Session(user.clone()))
            .expect("no active session found for this user");

        session.agent.require_auth();

        if !session.is_active || env.ledger().timestamp() > session.expiry {
            panic!("session expired or inactive");
        }

        if session.spent + amount > session.budget {
            panic!("insufficient session budget");
        }

        let asset: Address = env.storage().instance().get(&DataKey::Asset).expect("not initialized");
        let treasury: Address = env.storage().instance().get(&DataKey::Treasury).expect("not initialized");
        let client = token::Client::new(&env, &asset);

        // Disburse to treasury (Nirium protocol fee) or intended receiver
        // For x402, typically goes to the provider/treasury
        client.transfer(&env.current_contract_address(), &treasury, &amount);

        session.spent += amount;
        env.storage().persistent().set(&DataKey::Session(user.clone()), &session);

        // Report success to Sentinel (IR-SENTINEL-01)
        let sentinel_addr: Address = env.storage().instance().get(&DataKey::Sentinel).expect("no sentinel");
        // We'll need a cross-contract call here in a real scenario
        // For now, we emit an event that triggers the scoring off-chain or via a pre-compiled client
        
        env.events().publish(
            (symbol_short!("hub"), symbol_short!("x402")),
            (user, session.agent, amount, memo),
        );
    }

    pub fn close_session(env: Env, user: Address) {
        user.require_auth();
        let mut session: SettlementSession = env.storage().persistent().get(&DataKey::Session(user.clone())).expect("not found");
        
        if session.budget > session.spent {
            let asset: Address = env.storage().instance().get(&DataKey::Asset).expect("not initialized");
            let client = token::Client::new(&env, &asset);
            client.transfer(&env.current_contract_address(), &user, &(session.budget - session.spent));
        }

        session.is_active = false;
        env.storage().persistent().set(&DataKey::Session(user.clone()), &session);
    }
}
