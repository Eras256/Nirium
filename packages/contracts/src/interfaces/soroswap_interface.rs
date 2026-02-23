//! Soroswap DEX Interface — Automated Market Maker trait definitions.
//!
//! Defines the interface for interacting with Soroswap (or Phoenix) DEX
//! on the Stellar Network via Soroban.

use soroban_sdk::{Address, Env};

/// Trait defining the Soroswap DEX interface.
/// Implementations interact with live Soroswap/Phoenix contracts on mainnet
/// or mock contracts on testnet.
pub trait SoroswapDex {
    /// Swap an exact amount of input tokens for as many output tokens as possible.
    /// Returns the amount of output tokens received.
    fn swap_exact_in(
        env: &Env,
        user: &Address,
        token_in: &Address,
        token_out: &Address,
        amount_in: i128,
        min_amount_out: i128,
    ) -> i128;

    /// Swap as few input tokens as possible for an exact amount of output tokens.
    /// Returns the amount of input tokens spent.
    fn swap_exact_out(
        env: &Env,
        user: &Address,
        token_in: &Address,
        token_out: &Address,
        max_amount_in: i128,
        amount_out: i128,
    ) -> i128;

    /// Get the reserves for a given token pair.
    /// Returns (reserve_base, reserve_quote).
    fn get_reserves(
        env: &Env,
        token_a: &Address,
        token_b: &Address,
    ) -> (i128, i128);

    /// Get a price quote for swapping amount_in of token_in.
    /// Returns the expected output amount (before slippage).
    fn get_amount_out(
        env: &Env,
        token_in: &Address,
        token_out: &Address,
        amount_in: i128,
    ) -> i128;

    /// Get the required input amount to receive amount_out of token_out.
    /// Returns the required input amount.
    fn get_amount_in(
        env: &Env,
        token_in: &Address,
        token_out: &Address,
        amount_out: i128,
    ) -> i128;

    /// Add liquidity to a pair.
    /// Returns the amount of LP tokens minted.
    fn add_liquidity(
        env: &Env,
        user: &Address,
        token_a: &Address,
        token_b: &Address,
        amount_a: i128,
        amount_b: i128,
        min_lp_tokens: i128,
    ) -> i128;

    /// Remove liquidity from a pair.
    /// Returns (amount_a_received, amount_b_received).
    fn remove_liquidity(
        env: &Env,
        user: &Address,
        token_a: &Address,
        token_b: &Address,
        lp_token_amount: i128,
        min_amount_a: i128,
        min_amount_b: i128,
    ) -> (i128, i128);

    /// Get the current fee rate for the pair in basis points.
    fn get_fee_rate(
        env: &Env,
        token_a: &Address,
        token_b: &Address,
    ) -> u32;
}
