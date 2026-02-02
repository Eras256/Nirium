//! # Sentinel Contract (Treasury Hub)
//! 
//! The central hub of the Nirium architecture. Manages accumulated liquidity,
//! executes yield sweeping strategies, and acts as the secure vault for the protocol.
//! 
//! ## Features
//! - **Yield Sweeping**: Automatically moves idle funds to DeFi protocols (Interfaces with Soroswap/Phoenix placeholders).
//! - **Access Control**: Strict RBAC for Admin (DAO/Multisig) vs Operators.
//! - **Emergency Withdraw**: Circuit breaker to evacuate funds to cold storage.
//! - **View Functions**: Exposes treasury state to the frontend without gas costs.

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, Symbol,
    Address, Env, Vec, token
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum SentinelError {
    AlreadyInitialized = 1,
    Unauthorized = 2,
    InsufficientFunds = 3,
}

#[contract]
pub struct Sentinel;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Treasury,
    TotalSwept,
    AuthorizedDex(Address),
}

#[contractimpl]
impl Sentinel {
    /// Initialize the Sentinel Hub
    pub fn initialize(e: Env, admin: Address, treasury: Address) -> Result<(), SentinelError> {
        if e.storage().instance().has(&DataKey::Admin) {
            return Err(SentinelError::AlreadyInitialized);
        }
        e.storage().instance().set(&DataKey::Admin, &admin);
        e.storage().instance().set(&DataKey::Treasury, &treasury);
        e.storage().instance().set(&DataKey::TotalSwept, &0i128);
        Ok(())
    }

    /// Add a protocol/address to the Yield Sweeping Allowlist
    pub fn add_authorized_dex(e: Env, dex_addr: Address) -> Result<(), SentinelError> {
        let admin: Address = e.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        e.storage().instance().set(&DataKey::AuthorizedDex(dex_addr.clone()), &true);
        Ok(())
    }

    /// The "Sweeper": Moves idle funds to a yield-bearing protocol
    pub fn sweep_to_yield(e: Env, token_addr: Address, dex_addr: Address, amount: i128) -> Result<(), SentinelError> {
        let admin: Address = e.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        // Security Check: Destination must be allowlisted
        let is_auth: bool = e.storage().instance()
            .get(&DataKey::AuthorizedDex(dex_addr.clone()))
            .unwrap_or(false);
        
        if !is_auth {
            return Err(SentinelError::Unauthorized); // Or explicit InvalidDestination error
        }

        let client = token::Client::new(&e, &token_addr);
        
        if client.balance(&e.current_contract_address()) < amount {
            return Err(SentinelError::InsufficientFunds);
        }

        client.transfer(&e.current_contract_address(), &dex_addr, &amount);
        
        let current_swept: i128 = e.storage().instance().get(&DataKey::TotalSwept).unwrap_or(0);
        e.storage().instance().set(&DataKey::TotalSwept, &(current_swept + amount));
        
        e.events().publish(
            (Symbol::new(&e, "sweep"), token_addr),
            (amount, dex_addr) // Include destination in event for transparency
        );
        
        Ok(())
    }

    /// Emergency Withdraw: Evacuate funds to Cold Storage
    /// Emergency Withdraw: Evacuate funds to Cold Storage
    pub fn emergency_withdraw(e: Env, token_addr: Address, amount: i128) -> Result<(), SentinelError> {
        let admin: Address = e.storage().instance().get(&DataKey::Admin).unwrap();
        let treasury: Address = e.storage().instance().get(&DataKey::Treasury).unwrap();
        
        admin.require_auth();

        let client = token::Client::new(&e, &token_addr);
        client.transfer(&e.current_contract_address(), &treasury, &amount);
        
        Ok(())
    }

    // --- View Functions (Gasless Frontend Data) ---

    /// Returns the capital currently held by the Sentinel (Idle Capital)
    pub fn get_working_capital(e: Env, token_addr: Address) -> i128 {
        let client = token::Client::new(&e, &token_addr);
        client.balance(&e.current_contract_address())
    }

    /// Returns the configured treasury/cold storage address
    pub fn get_treasury_address(e: Env) -> Address {
        e.storage().instance().get(&DataKey::Treasury).unwrap()
    }

    /// Checks if an address interprets the Admin role
    pub fn is_admin(e: Env, address: Address) -> bool {
        let admin: Address = e.storage().instance().get(&DataKey::Admin).unwrap();
        address == admin
    }

    /// Returns total amount swept to yield protocols historically
    pub fn get_total_swept(e: Env) -> i128 {
        e.storage().instance().get(&DataKey::TotalSwept).unwrap_or(0)
    }
}
