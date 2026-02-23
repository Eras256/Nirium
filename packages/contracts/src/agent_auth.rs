//! Agent Authorization — Delegation-based access control.
//!
//! Uses Soroban's native `require_auth()` and persistent storage delegation
//! records instead of capability tokens. Provides utility functions for
//! validating agent permissions within the Nirium vault system.

use soroban_sdk::{Address, Env};

use crate::nirium_vault::{AgentDelegation, DataKey, Vault};

/// Validates that an agent has an active delegation for a given vault
/// and returns the delegation details.
pub fn validate_agent_delegation(
    env: &Env,
    vault_id: u64,
    agent: &Address,
) -> AgentDelegation {
    agent.require_auth();

    let delegation: AgentDelegation = env
        .storage()
        .persistent()
        .get(&DataKey::AgentDelegation(vault_id, agent.clone()))
        .expect("agent not delegated for this vault");

    if !delegation.is_active {
        panic!("agent delegation has been revoked");
    }

    delegation
}

/// Validates that the caller is the vault owner.
pub fn validate_vault_owner(env: &Env, vault_id: u64, caller: &Address) -> Vault {
    let vault: Vault = env
        .storage()
        .persistent()
        .get(&DataKey::Vault(vault_id))
        .expect("vault not found");

    if vault.owner != *caller {
        panic!("caller is not the vault owner");
    }

    vault
}

/// Check if an agent can execute a given amount against its delegation limits.
pub fn check_execution_limit(delegation: &AgentDelegation, amount: i128) -> bool {
    if amount <= 0 {
        return false;
    }
    amount <= delegation.max_execution_amount
}

/// Calculate the execution fee for a given amount and fee basis points.
pub fn calculate_fee(amount: i128, fee_bps: u32) -> i128 {
    let fee = (amount * fee_bps as i128) / 10_000;
    if fee < 1 && amount > 0 {
        1 // Minimum fee of 1 stroop
    } else {
        fee
    }
}

/// Permission levels for different operations.
#[derive(Clone, Debug, PartialEq)]
pub enum Permission {
    /// Full control: deposit, withdraw, delegate, revoke
    Owner,
    /// Execution only: can run strategies but cannot withdraw
    Agent,
    /// Read-only: can query vault state
    ReadOnly,
}

/// Determine the permission level of an address for a given vault.
pub fn get_permission_level(env: &Env, vault_id: u64, address: &Address) -> Permission {
    let vault_result: Option<Vault> = env.storage().persistent().get(&DataKey::Vault(vault_id));

    match vault_result {
        Some(vault) => {
            if vault.owner == *address {
                return Permission::Owner;
            }
            // Check if address has an active delegation for this vault
            let delegation: Option<AgentDelegation> = env
                .storage()
                .persistent()
                .get(&DataKey::AgentDelegation(vault_id, address.clone()));
            match delegation {
                Some(d) if d.is_active => Permission::Agent,
                _ => Permission::ReadOnly,
            }
        }
        None => Permission::ReadOnly,
    }
}
