// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Nirium Protocol Contributors

//! Nirium Skill Vault — X402 Payment Gate for Autonomous Agents
//! 
//! This contract implements a "Proof of Payment" gateway.
//! Agents must pay a skill-specific fee to unlock specialized tools.

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, String,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Treasury,
    UsdcToken,
    SkillPrice(String),
}

#[contract]
pub struct SkillVaultContract;

#[contractimpl]
impl SkillVaultContract {
    /// Initialize the vault with treasury and token addresses
    pub fn initialize(env: Env, admin: Address, treasury: Address, usdc_token: Address) {
        admin.require_auth();
        if env.storage().instance().has(&DataKey::Treasury) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Treasury, &treasury);
        env.storage().instance().set(&DataKey::UsdcToken, &usdc_token);
    }

    /// Set a price for a specific skill (id)
    pub fn set_price(env: Env, admin: Address, skill_id: String, price: i128) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::SkillPrice(skill_id), &price);
    }

    /// UNLOCK SKILL (X402 Entry Point)
    /// This is the function the agent will call with X402 Soroban Auth.
    /// It atomically:
    /// 1. Verifies Agent identity (auth)
    /// 2. Deducts USDC fee
    /// 3. Emits the "Skill Key" for the agent to use
    pub fn unlock_skill(env: Env, agent: Address, skill_id: String) -> String {
        // IR-SECURITY-01: Identity verification (X402 Signed Auth Entry)
        agent.require_auth();

        let usdc_token: Address = env.storage().instance().get(&DataKey::UsdcToken).expect("not initialized");
        let treasury: Address = env.storage().instance().get(&DataKey::Treasury).expect("not initialized");
        let price: i128 = env.storage().instance().get(&DataKey::SkillPrice(skill_id.clone())).unwrap_or(5_000_000); // 5 USDC default

        let token_client = token::Client::new(&env, &usdc_token);

        // IR-PAYMENT-01: Atomic transfer to treasury
        // If the agent doesn't have the funds or hasn't signed the transfer, this fails.
        token_client.transfer(&agent, &treasury, &price);

        // IR-ACTION-01: Grant Access
        // Generate a pseudo-secret or instruction based on the skill
        let access_key = String::from_str(&env, "NIRIUM_ACCESS_GRANTED_SIG_0x402");

        // Emit high-value event for off-chain or dashboard tracking
        env.events().publish(
            (symbol_short!("skill"), symbol_short!("unlock")),
            (agent, skill_id, price),
        );

        access_key
    }

    pub fn get_price(env: Env, skill_id: String) -> i128 {
        env.storage().instance().get(&DataKey::SkillPrice(skill_id)).unwrap_or(5_000_000)
    }
}
