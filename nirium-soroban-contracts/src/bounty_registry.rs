// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Nirium Protocol Contributors

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec};

#[contracttype]
#[derive(Clone)]
pub struct Bounty {
    pub creator: Address,
    pub amount: i128,
    pub description: String,
    pub solver: Option<Address>,
    pub status: Symbol, // Symbol::new(&env, "OPEN"), "SOLVED", etc.
}

#[contract]
pub struct BountyRegistry;

#[contractimpl]
impl BountyRegistry {
    /// Create a new bounty. The creator must have deposited funds into the contract (or we use SAC transfer).
    pub fn create_bounty(env: Env, creator: Address, amount: i128, description: String) -> u32 {
        creator.require_auth();
        
        // In a real implementation, we would transfer USDC from creator to contract here.
        // For this hackathon pattern, we focus on the registry logic.
        
        let bounty_id = env.storage().instance().get(&Symbol::new(&env, "COUNT")).unwrap_or(0);
        let bounty = Bounty {
            creator,
            amount,
            description,
            solver: None,
            status: Symbol::new(&env, "OPEN"),
        };
        
        env.storage().instance().set(&bounty_id, &bounty);
        env.storage().instance().set(&Symbol::new(&env, "COUNT"), &(bounty_id + 1));
        
        bounty_id
    }

    /// Claim a bounty as solved. 
    pub fn claim_bounty(env: Env, solver: Address, bounty_id: u32) {
        solver.require_auth();
        
        let mut bounty: Bounty = env.storage().instance().get(&bounty_id).expect("Bounty not found");
        assert!(bounty.status == Symbol::new(&env, "OPEN"), "Bounty is not open");
        
        bounty.status = Symbol::new(&env, "SOLVED");
        bounty.solver = Some(solver);
        
        env.storage().instance().set(&bounty_id, &bounty);
    }
}
