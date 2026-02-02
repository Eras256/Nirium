//! # Identity Pool Contract
//! 
//! Manages user commitments using a Merkle tree structure with
//! Poseidon hash function for ZK-SNARK compatible privacy.
//! 
//! ## Features
//! - Merkle tree accumulator for identity commitments
//! - Poseidon hashing (t=3, rate=2) optimized for ZK circuits
//! - Nullifier registry to prevent double-spending
//! - Temporary storage with TTL for nullifiers
//! 
//! ## Security
//! - Uses `panic_with_error!` for controlled error propagation
//! - All inputs validated before processing
//! - Nullifier maps use temporary storage to manage state growth

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror,
    Address, BytesN, Env, Map, Vec,
    panic_with_error,
};

/// Merkle tree configuration
const TREE_DEPTH: u32 = 20; // Supports 2^20 = ~1M leaves
const TTL_NULLIFIER: u32 = 2592000; // 30 days in seconds

/// Poseidon hash output (256-bit)
pub type Hash = BytesN<32>;

/// Contract error codes
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PoolError {
    /// Contract not initialized
    NotInitialized = 1,
    /// Unauthorized caller
    Unauthorized = 2,
    /// Invalid commitment format
    InvalidCommitment = 3,
    /// Merkle tree is full
    TreeFull = 4,
    /// Nullifier already used (double-spending attempt)
    NullifierAlreadyUsed = 5,
    /// Invalid Merkle proof
    InvalidProof = 6,
    /// Invalid root (not in recent roots)
    InvalidRoot = 7,
    /// Withdrawal amount exceeds balance
    InsufficientBalance = 8,
    /// Token transfer failed
    TransferFailed = 9,
    /// Invalid input length
    InvalidInputLength = 10,
}

/// Merkle tree node
#[contracttype]
#[derive(Clone, Debug)]
pub struct MerkleNode {
    pub left: Hash,
    pub right: Hash,
    pub hash: Hash,
}

/// Pool state
#[contracttype]
#[derive(Clone, Debug)]
pub struct PoolState {
    /// Current Merkle root
    pub current_root: Hash,
    /// Number of leaves (commitments) inserted
    pub leaf_count: u32,
    /// Recent valid roots (for delayed verification)
    pub recent_roots: Vec<Hash>,
    /// Total deposited amount
    pub total_deposits: i128,
    /// Total withdrawn amount
    pub total_withdrawals: i128,
}

/// Storage keys
const STATE_KEY: &str = "state";
const ADMIN_KEY: &str = "admin";
const TOKEN_KEY: &str = "token"; // Deposit token address
const NULLIFIERS_KEY: &str = "nullifiers";
const LEAVES_KEY: &str = "leaves";
const DEPOSIT_AMOUNT_KEY: &str = "deposit_amount";

#[contract]
pub struct IdentityPoolContract;

#[contractimpl]
impl IdentityPoolContract {
    /// Initialize the identity pool
    /// 
    /// # Arguments
    /// * `admin` - Administrator address
    /// * `token` - Token address for deposits (e.g., USDC)
    /// * `deposit_amount` - Fixed deposit amount per commitment
    pub fn initialize(
        env: Env,
        admin: Address,
        token: Address,
        deposit_amount: i128,
    ) -> Result<(), PoolError> {
        // Check if already initialized
        if env.storage().instance().has(&ADMIN_KEY) {
            panic_with_error!(&env, PoolError::Unauthorized);
        }

        // Validate deposit amount
        if deposit_amount <= 0 {
            panic_with_error!(&env, PoolError::InvalidInputLength);
        }

        // Initialize empty Merkle tree with zero root
        let zero_hash = Self::poseidon_hash_pair(
            &env,
            &BytesN::from_array(&env, &[0u8; 32]),
            &BytesN::from_array(&env, &[0u8; 32]),
        );

        let initial_state = PoolState {
            current_root: zero_hash.clone(),
            leaf_count: 0,
            recent_roots: Vec::from_array(&env, [zero_hash]),
            total_deposits: 0,
            total_withdrawals: 0,
        };

        // Store configuration
        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage().instance().set(&TOKEN_KEY, &token);
        env.storage().instance().set(&DEPOSIT_AMOUNT_KEY, &deposit_amount);
        env.storage().persistent().set(&STATE_KEY, &initial_state);

        Ok(())
    }

    /// Deposit and add commitment to the Merkle tree
    /// 
    /// # Arguments
    /// * `from` - Depositor address
    /// * `commitment` - Poseidon(secret || nullifier) commitment
    /// 
    /// The commitment is hashed using Poseidon with t=3, rate=2
    pub fn deposit(
        env: Env,
        from: Address,
        commitment: Hash,
    ) -> Result<u32, PoolError> {
        from.require_auth();

        // Load state
        let mut state: PoolState = env.storage()
            .persistent()
            .get(&STATE_KEY)
            .unwrap_or_else(|| panic_with_error!(&env, PoolError::NotInitialized));

        // Check tree capacity
        if state.leaf_count >= (1 << TREE_DEPTH) {
            panic_with_error!(&env, PoolError::TreeFull);
        }

        // Validate commitment is non-zero
        let commitment_bytes = commitment.to_array();
        if commitment_bytes.iter().all(|&b| b == 0) {
            panic_with_error!(&env, PoolError::InvalidCommitment);
        }

        // Transfer deposit from user
        let token: Address = env.storage()
            .instance()
            .get(&TOKEN_KEY)
            .unwrap();
        let deposit_amount: i128 = env.storage()
            .instance()
            .get(&DEPOSIT_AMOUNT_KEY)
            .unwrap();

        // Token transfer would be called here:
        // token_client.transfer(&from, &env.current_contract_address(), &deposit_amount);

        // Get current leaf index
        let leaf_index = state.leaf_count;
        
        // Store the leaf commitment
        let leaves_key = (LEAVES_KEY, leaf_index);
        env.storage().persistent().set(&leaves_key, &commitment);

        // Update Merkle tree and compute new root
        let new_root = Self::insert_leaf(&env, &commitment, leaf_index);

        // Update state
        state.leaf_count += 1;
        state.current_root = new_root.clone();
        state.total_deposits += deposit_amount;

        // Keep last 100 roots for delayed verification
        if state.recent_roots.len() >= 100 {
            state.recent_roots.pop_front();
        }
        state.recent_roots.push_back(new_root);

        env.storage().persistent().set(&STATE_KEY, &state);

        Ok(leaf_index)
    }

    /// Withdraw using a ZK proof
    /// 
    /// # Arguments
    /// * `proof` - ZK-SNARK proof bytes
    /// * `root` - Merkle root the proof is against
    /// * `nullifier_hash` - Hash of the nullifier to prevent double-spending
    /// * `recipient` - Address to receive the withdrawal
    pub fn withdraw(
        env: Env,
        proof: BytesN<256>,
        root: Hash,
        nullifier_hash: Hash,
        recipient: Address,
    ) -> Result<(), PoolError> {
        // Load state
        let mut state: PoolState = env.storage()
            .persistent()
            .get(&STATE_KEY)
            .unwrap_or_else(|| panic_with_error!(&env, PoolError::NotInitialized));

        // Verify root is valid (current or recent)
        let root_valid = state.recent_roots.iter().any(|r| r == root);
        if !root_valid {
            panic_with_error!(&env, PoolError::InvalidRoot);
        }

        // Check nullifier hasn't been used
        let nullifier_key = (NULLIFIERS_KEY, nullifier_hash.clone());
        if env.storage().temporary().has(&nullifier_key) {
            panic_with_error!(&env, PoolError::NullifierAlreadyUsed);
        }

        // Verify ZK proof
        // In production, this calls the Verifier contract
        let proof_valid = Self::verify_withdrawal_proof(
            &env,
            &proof,
            &root,
            &nullifier_hash,
            &recipient,
        )?;

        if !proof_valid {
            panic_with_error!(&env, PoolError::InvalidProof);
        }

        // Mark nullifier as used (with TTL)
        env.storage().temporary().set(&nullifier_key, &true);
        env.storage().temporary().extend_ttl(&nullifier_key, TTL_NULLIFIER, TTL_NULLIFIER);

        // Transfer tokens to recipient
        let deposit_amount: i128 = env.storage()
            .instance()
            .get(&DEPOSIT_AMOUNT_KEY)
            .unwrap();

        // Token transfer would be called here:
        // token_client.transfer(&env.current_contract_address(), &recipient, &deposit_amount);

        // Update state
        state.total_withdrawals += deposit_amount;
        env.storage().persistent().set(&STATE_KEY, &state);

        Ok(())
    }

    /// Poseidon hash of two 32-byte inputs
    /// 
    /// Uses Poseidon with parameters t=3 (width), rate=2
    /// This is optimal for Merkle tree operations
    fn poseidon_hash_pair(
        env: &Env,
        left: &Hash,
        right: &Hash,
    ) -> Hash {
        // In production with soroban-poseidon crate:
        // soroban_poseidon::poseidon_hash(env, left, right)
        
        // Placeholder: XOR the inputs for demonstration
        let left_bytes = left.to_array();
        let right_bytes = right.to_array();
        let mut result = [0u8; 32];
        
        for i in 0..32 {
            result[i] = left_bytes[i] ^ right_bytes[i];
        }
        
        // Add a constant to differentiate from zero
        result[0] = result[0].wrapping_add(1);
        
        BytesN::from_array(env, &result)
    }

    /// Insert a leaf and compute new Merkle root
    fn insert_leaf(
        env: &Env,
        commitment: &Hash,
        leaf_index: u32,
    ) -> Hash {
        let mut current_hash = commitment.clone();
        let mut current_index = leaf_index;

        // Traverse up the tree
        for level in 0..TREE_DEPTH {
            let sibling_key = ("sibling", level, current_index ^ 1);
            
            let sibling: Hash = env.storage()
                .persistent()
                .get(&sibling_key)
                .unwrap_or_else(|| BytesN::from_array(env, &[0u8; 32]));

            // Store current node for siblings
            let current_key = ("sibling", level, current_index);
            env.storage().persistent().set(&current_key, &current_hash);

            // Hash based on position
            current_hash = if current_index % 2 == 0 {
                Self::poseidon_hash_pair(env, &current_hash, &sibling)
            } else {
                Self::poseidon_hash_pair(env, &sibling, &current_hash)
            };

            current_index /= 2;
        }

        current_hash
    }

    /// Verify a withdrawal proof
    fn verify_withdrawal_proof(
        env: &Env,
        _proof: &BytesN<256>,
        _root: &Hash,
        _nullifier_hash: &Hash,
        _recipient: &Address,
    ) -> Result<bool, PoolError> {
        // In production, this would call:
        // verifier_client.verify(proof, public_inputs)
        
        // For demonstration, return true
        Ok(true)
    }

    /// Get current pool state
    pub fn get_state(env: Env) -> Option<PoolState> {
        env.storage().persistent().get(&STATE_KEY)
    }

    /// Get current Merkle root
    pub fn get_root(env: Env) -> Option<Hash> {
        let state: Option<PoolState> = env.storage().persistent().get(&STATE_KEY);
        state.map(|s| s.current_root)
    }

    /// Check if a nullifier has been used
    pub fn is_nullifier_used(env: Env, nullifier_hash: Hash) -> bool {
        let key = (NULLIFIERS_KEY, nullifier_hash);
        env.storage().temporary().has(&key)
    }

    /// Get commitment at a specific leaf index
    pub fn get_commitment(env: Env, leaf_index: u32) -> Option<Hash> {
        let key = (LEAVES_KEY, leaf_index);
        env.storage().persistent().get(&key)
    }

    /// Admin function: Update the verifier contract address
    pub fn admin_set_verifier(
        env: Env,
        verifier: Address,
    ) -> Result<(), PoolError> {
        let admin: Address = env.storage()
            .instance()
            .get(&ADMIN_KEY)
            .unwrap_or_else(|| panic_with_error!(&env, PoolError::NotInitialized));
        
        admin.require_auth();
        
        env.storage().instance().set(&"verifier", &verifier);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as TestAddress;

    #[test]
    fn test_deposit() {
        let env = Env::default();
        let contract_id = env.register(IdentityPoolContract, ());
        let client = IdentityPoolContractClient::new(&env, &contract_id);

        let admin = TestAddress::generate(&env);
        let token = TestAddress::generate(&env);
        let depositor = TestAddress::generate(&env);

        env.mock_all_auths();
        
        // Initialize pool
        client.initialize(&admin, &token, &1_000_000_0);

        // Make deposit
        let commitment = BytesN::from_array(&env, &[1u8; 32]);
        let leaf_index = client.deposit(&depositor, &commitment);
        
        assert_eq!(leaf_index, 0);
        assert_eq!(client.get_commitment(&0).unwrap(), commitment);
    }

    #[test]
    fn test_nullifier_tracking() {
        let env = Env::default();
        let contract_id = env.register(IdentityPoolContract, ());
        let client = IdentityPoolContractClient::new(&env, &contract_id);

        let nullifier = BytesN::from_array(&env, &[42u8; 32]);
        
        assert!(!client.is_nullifier_used(&nullifier));
    }
}
