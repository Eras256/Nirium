// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Nirium Protocol Contributors

//! Blend Protocol Interface — Lending pool trait definitions.
//!
//! Defines the interface for interacting with Blend Protocol on Stellar,
//! a decentralized lending protocol built on Soroban.

use soroban_sdk::{Address, Env};

/// Trait defining the Blend Protocol lending pool interface.
/// Implementations interact with live Blend contracts on mainnet
/// or mock contracts on testnet.
pub trait BlendLendingPool {
    /// Supply assets to the lending pool.
    /// Returns the amount of pool tokens (receipt tokens) minted.
    fn supply(
        env: &Env,
        user: &Address,
        token_address: &Address,
        amount: i128,
    ) -> i128;

    /// Borrow assets from the lending pool.
    /// Requires sufficient collateral already deposited.
    /// Returns the amount actually borrowed.
    fn borrow(
        env: &Env,
        user: &Address,
        token_address: &Address,
        amount: i128,
    ) -> i128;

    /// Repay borrowed assets to the lending pool.
    /// Returns the remaining debt after repayment.
    fn repay(
        env: &Env,
        user: &Address,
        token_address: &Address,
        amount: i128,
    ) -> i128;

    /// Get the current supply APY for a given token.
    /// Returns APY in basis points (e.g., 500 = 5.00%).
    fn get_supply_apy(
        env: &Env,
        token_address: &Address,
    ) -> u32;

    /// Get the current borrow APY for a given token.
    /// Returns APY in basis points.
    fn get_borrow_apy(
        env: &Env,
        token_address: &Address,
    ) -> u32;

    /// Get the user's current supply balance (including accrued interest).
    fn get_supply_balance(
        env: &Env,
        user: &Address,
        token_address: &Address,
    ) -> i128;

    /// Get the user's current borrow balance (including accrued interest).
    fn get_borrow_balance(
        env: &Env,
        user: &Address,
        token_address: &Address,
    ) -> i128;

    /// Get the total liquidity available in the pool for a given token.
    fn get_available_liquidity(
        env: &Env,
        token_address: &Address,
    ) -> i128;

    /// Get the utilization rate of the pool for a given token.
    /// Returns utilization in basis points (e.g., 7500 = 75.00%).
    fn get_utilization_rate(
        env: &Env,
        token_address: &Address,
    ) -> u32;
}
