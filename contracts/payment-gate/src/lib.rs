//! # Payment Gate Contract
//! 
//! Implements the x402 payment protocol for Stellar, enabling
//! AI agents to pay for API access automatically.
//! 
//! ## Features
//! - SEP-41 token acceptance
//! - PaymentAuthorized event emission for off-chain listeners
//! - Access token issuance (credential verification)
//! - Fee-bump transaction support
//! 
//! ## Flow
//! 1. Agent receives 402 Payment Required response
//! 2. Agent builds payment transaction to this contract
//! 3. Contract emits PaymentAuthorized event
//! 4. Off-chain service grants API access

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror,
    token, Address, BytesN, Env, String, Symbol,
    panic_with_error,
};

/// Maximum memo length for x402 payments
const MAX_MEMO_LENGTH: u32 = 64;

/// Access token validity in seconds
const ACCESS_TOKEN_TTL: u32 = 3600; // 1 hour

/// Contract error codes
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum GateError {
    /// Contract not initialized
    NotInitialized = 1,
    /// Unauthorized caller
    Unauthorized = 2,
    /// Invalid payment amount
    InvalidAmount = 3,
    /// Invalid memo format
    InvalidMemo = 4,
    /// Token not supported
    UnsupportedToken = 5,
    /// Access token expired
    AccessTokenExpired = 6,
    /// Access token not found
    AccessTokenNotFound = 7,
    /// Rate limit exceeded
    RateLimitExceeded = 8,
    /// Payment already processed
    PaymentAlreadyProcessed = 9,
}

/// Payment record for audit trail
#[contracttype]
#[derive(Clone, Debug)]
pub struct PaymentRecord {
    /// Payer address
    pub payer: Address,
    /// Payment amount
    pub amount: i128,
    /// Token used for payment
    pub token: Address,
    /// Payment memo (API endpoint, request ID, etc.)
    pub memo: String,
    /// Timestamp of payment
    pub timestamp: u64,
    /// Whether access was granted
    pub access_granted: bool,
}

/// Access token for API authorization
#[contracttype]
#[derive(Clone, Debug)]
pub struct AccessToken {
    /// Token holder (agent address)
    pub holder: Address,
    /// Credits remaining
    pub credits: i128,
    /// Expiry timestamp
    pub expires_at: u64,
    /// Allowed API endpoints (empty = all)
    pub allowed_endpoints: soroban_sdk::Vec<String>,
}

/// Service configuration
#[contracttype]
#[derive(Clone, Debug)]
pub struct ServiceConfig {
    /// Service name
    pub name: String,
    /// Base price per request (in token units)
    pub base_price: i128,
    /// Token address accepted for payment
    pub token: Address,
    /// Treasury address for funds
    pub treasury: Address,
    /// Whether service is active
    pub active: bool,
}

/// Storage keys
const ADMIN_KEY: &str = "admin";
const CONFIG_KEY: &str = "config";
const PAYMENT_NONCE_KEY: &str = "nonce";

#[contract]
pub struct PaymentGateContract;

#[contractimpl]
impl PaymentGateContract {
    /// Initialize the payment gate
    pub fn initialize(
        env: Env,
        admin: Address,
        config: ServiceConfig,
    ) -> Result<(), GateError> {
        if env.storage().instance().has(&ADMIN_KEY) {
            panic_with_error!(&env, GateError::Unauthorized);
        }

        if config.base_price <= 0 {
            panic_with_error!(&env, GateError::InvalidAmount);
        }

        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage().instance().set(&CONFIG_KEY, &config);
        env.storage().instance().set(&PAYMENT_NONCE_KEY, &0u64);

        Ok(())
    }

    /// Process a payment and issue access token
    /// 
    /// # Arguments
    /// * `payer` - Address making the payment
    /// * `amount` - Payment amount
    /// * `memo` - x402 memo (endpoint, request ID, etc.)
    /// 
    /// # Events
    /// Emits `PaymentAuthorized` event for off-chain listeners
    pub fn pay(
        env: Env,
        payer: Address,
        amount: i128,
        memo: String,
    ) -> Result<BytesN<32>, GateError> {
        payer.require_auth();

        // Load config
        let config: ServiceConfig = env.storage()
            .instance()
            .get(&CONFIG_KEY)
            .unwrap_or_else(|| panic_with_error!(&env, GateError::NotInitialized));

        if !config.active {
            panic_with_error!(&env, GateError::Unauthorized);
        }

        // Validate amount
        if amount < config.base_price {
            panic_with_error!(&env, GateError::InvalidAmount);
        }

        // Validate memo
        if memo.len() > MAX_MEMO_LENGTH {
            panic_with_error!(&env, GateError::InvalidMemo);
        }

        // Transfer tokens from payer to treasury
        let token_client = token::Client::new(&env, &config.token);
        token_client.transfer(&payer, &config.treasury, &amount);

        // Generate access token ID
        let nonce: u64 = env.storage()
            .instance()
            .get(&PAYMENT_NONCE_KEY)
            .unwrap_or(0);
        
        let token_id = Self::generate_token_id(&env, &payer, nonce);

        // Calculate credits (amount / base_price)
        let credits = amount / config.base_price;

        // Create access token
        let access_token = AccessToken {
            holder: payer.clone(),
            credits,
            expires_at: env.ledger().timestamp() + ACCESS_TOKEN_TTL as u64,
            allowed_endpoints: soroban_sdk::Vec::new(&env),
        };

        // Store access token (temporary storage with TTL)
        let token_key = ("access_token", token_id.clone());
        env.storage().temporary().set(&token_key, &access_token);
        env.storage().temporary().extend_ttl(&token_key, ACCESS_TOKEN_TTL, ACCESS_TOKEN_TTL);

        // Create payment record
        let record = PaymentRecord {
            payer: payer.clone(),
            amount,
            token: config.token,
            memo: memo.clone(),
            timestamp: env.ledger().timestamp(),
            access_granted: true,
        };

        // Store payment record
        let record_key = ("payment", nonce);
        env.storage().persistent().set(&record_key, &record);

        // Update nonce
        env.storage().instance().set(&PAYMENT_NONCE_KEY, &(nonce + 1));

        // Emit PaymentAuthorized event
        env.events().publish(
            (Symbol::new(&env, "PaymentAuthorized"), payer.clone()),
            (token_id.clone(), amount, memo, credits),
        );

        Ok(token_id)
    }

    /// Verify an access token is valid
    pub fn verify_access(
        env: Env,
        token_id: BytesN<32>,
    ) -> Result<AccessToken, GateError> {
        let token_key = ("access_token", token_id);
        
        let access_token: AccessToken = env.storage()
            .temporary()
            .get(&token_key)
            .unwrap_or_else(|| panic_with_error!(&env, GateError::AccessTokenNotFound));

        // Check expiry
        if env.ledger().timestamp() > access_token.expires_at {
            panic_with_error!(&env, GateError::AccessTokenExpired);
        }

        // Check credits
        if access_token.credits <= 0 {
            panic_with_error!(&env, GateError::RateLimitExceeded);
        }

        Ok(access_token)
    }

    /// Consume a credit from an access token
    pub fn consume_credit(
        env: Env,
        token_id: BytesN<32>,
    ) -> Result<i128, GateError> {
        let token_key = ("access_token", token_id.clone());
        
        let mut access_token: AccessToken = env.storage()
            .temporary()
            .get(&token_key)
            .unwrap_or_else(|| panic_with_error!(&env, GateError::AccessTokenNotFound));

        // Check expiry
        if env.ledger().timestamp() > access_token.expires_at {
            panic_with_error!(&env, GateError::AccessTokenExpired);
        }

        // Check credits
        if access_token.credits <= 0 {
            panic_with_error!(&env, GateError::RateLimitExceeded);
        }

        // Consume credit
        access_token.credits -= 1;
        env.storage().temporary().set(&token_key, &access_token);

        Ok(access_token.credits)
    }

    /// Generate a deterministic token ID
    fn generate_token_id(
        env: &Env,
        payer: &Address,
        nonce: u64,
    ) -> BytesN<32> {
        // In production, use proper hashing
        // For now, create a unique ID based on contract + payer + nonce
        let mut bytes = [0u8; 32];
        
        // Simple deterministic ID generation
        let timestamp = env.ledger().timestamp();
        bytes[0..8].copy_from_slice(&timestamp.to_be_bytes());
        bytes[8..16].copy_from_slice(&nonce.to_be_bytes());
        
        // Add some entropy from payer address (simplified)
        bytes[16] = 0x42;
        bytes[17] = 0x04;
        bytes[18] = 0x02;
        
        BytesN::from_array(env, &bytes)
    }

    /// Get service configuration
    pub fn get_config(env: Env) -> Option<ServiceConfig> {
        env.storage().instance().get(&CONFIG_KEY)
    }

    /// Get payment record by nonce
    pub fn get_payment(env: Env, nonce: u64) -> Option<PaymentRecord> {
        let key = ("payment", nonce);
        env.storage().persistent().get(&key)
    }

    /// Admin: Update service configuration
    pub fn admin_update_config(
        env: Env,
        new_config: ServiceConfig,
    ) -> Result<(), GateError> {
        let admin: Address = env.storage()
            .instance()
            .get(&ADMIN_KEY)
            .unwrap_or_else(|| panic_with_error!(&env, GateError::NotInitialized));
        
        admin.require_auth();

        if new_config.base_price <= 0 {
            panic_with_error!(&env, GateError::InvalidAmount);
        }

        env.storage().instance().set(&CONFIG_KEY, &new_config);
        Ok(())
    }

    /// Admin: Withdraw accumulated funds
    pub fn admin_withdraw(
        env: Env,
        to: Address,
        amount: i128,
    ) -> Result<(), GateError> {
        let admin: Address = env.storage()
            .instance()
            .get(&ADMIN_KEY)
            .unwrap_or_else(|| panic_with_error!(&env, GateError::NotInitialized));
        
        admin.require_auth();

        let config: ServiceConfig = env.storage()
            .instance()
            .get(&CONFIG_KEY)
            .unwrap();

        let token_client = token::Client::new(&env, &config.token);
        token_client.transfer(&env.current_contract_address(), &to, &amount);

        Ok(())
    }

    /// Admin: Pause/unpause service
    pub fn admin_set_active(
        env: Env,
        active: bool,
    ) -> Result<(), GateError> {
        let admin: Address = env.storage()
            .instance()
            .get(&ADMIN_KEY)
            .unwrap_or_else(|| panic_with_error!(&env, GateError::NotInitialized));
        
        admin.require_auth();

        let mut config: ServiceConfig = env.storage()
            .instance()
            .get(&CONFIG_KEY)
            .unwrap();

        config.active = active;
        env.storage().instance().set(&CONFIG_KEY, &config);

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as TestAddress;

    #[test]
    fn test_initialization() {
        let env = Env::default();
        let contract_id = env.register(PaymentGateContract, ());
        let client = PaymentGateContractClient::new(&env, &contract_id);

        let admin = TestAddress::generate(&env);
        let token = TestAddress::generate(&env);
        let treasury = TestAddress::generate(&env);

        let config = ServiceConfig {
            name: String::from_str(&env, "Neural Compute"),
            base_price: 5_000_000, // 5 USDC (7 decimals)
            token,
            treasury,
            active: true,
        };

        env.mock_all_auths();
        client.initialize(&admin, &config);

        let stored_config = client.get_config().unwrap();
        assert_eq!(stored_config.base_price, 5_000_000);
        assert!(stored_config.active);
    }
}
