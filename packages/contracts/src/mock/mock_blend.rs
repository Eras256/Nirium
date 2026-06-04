// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Nirium Protocol Contributors

//! Mock Blend Lending Pool — Synthetic APYs for testnet.
//!
//! Returns deterministic lending rates for development and testing.
//! Simulates a Blend Protocol lending pool without actual on-chain state.

use soroban_sdk::contracttype;

/// Mock lending pool with synthetic APY rates.
#[contracttype]
#[derive(Clone, Debug)]
pub struct MockBlendPool {
    pub pool_id: u64,
    pub supply_apy_bps: u32,
    pub borrow_apy_bps: u32,
    pub total_supplied: i128,
    pub total_borrowed: i128,
    pub utilization_bps: u32,
    pub collateral_factor_bps: u32,
}

/// Default supply APY: 3.5%
const DEFAULT_SUPPLY_APY_BPS: u32 = 350;
/// Default borrow APY: 7.2%
const DEFAULT_BORROW_APY_BPS: u32 = 720;
/// Default total supplied: 5M tokens
const DEFAULT_TOTAL_SUPPLIED: i128 = 5_000_000_0_000_000;
/// Default total borrowed: 3M tokens
const DEFAULT_TOTAL_BORROWED: i128 = 3_000_000_0_000_000;
/// Default collateral factor: 75%
const DEFAULT_COLLATERAL_FACTOR_BPS: u32 = 7500;

impl MockBlendPool {
    /// Create a mock blend pool with default rates.
    pub fn new_default(pool_id: u64) -> Self {
        let utilization = ((DEFAULT_TOTAL_BORROWED * 10_000) / DEFAULT_TOTAL_SUPPLIED) as u32;
        Self {
            pool_id,
            supply_apy_bps: DEFAULT_SUPPLY_APY_BPS,
            borrow_apy_bps: DEFAULT_BORROW_APY_BPS,
            total_supplied: DEFAULT_TOTAL_SUPPLIED,
            total_borrowed: DEFAULT_TOTAL_BORROWED,
            utilization_bps: utilization,
            collateral_factor_bps: DEFAULT_COLLATERAL_FACTOR_BPS,
        }
    }

    /// Create a mock blend pool with custom APY parameters.
    pub fn new_custom(
        pool_id: u64,
        supply_apy_bps: u32,
        borrow_apy_bps: u32,
        total_supplied: i128,
        total_borrowed: i128,
        collateral_factor_bps: u32,
    ) -> Self {
        let utilization = if total_supplied > 0 {
            ((total_borrowed * 10_000) / total_supplied) as u32
        } else {
            0
        };
        Self {
            pool_id,
            supply_apy_bps,
            borrow_apy_bps,
            total_supplied,
            total_borrowed,
            utilization_bps: utilization,
            collateral_factor_bps,
        }
    }

    /// Get the current supply APY in basis points.
    pub fn get_supply_apy(&self) -> u32 {
        self.supply_apy_bps
    }

    /// Get the current borrow APY in basis points.
    pub fn get_borrow_apy(&self) -> u32 {
        self.borrow_apy_bps
    }

    /// Calculate interest earned on a supply amount over a given number of seconds.
    /// Returns interest amount in stroops.
    pub fn calculate_supply_interest(&self, amount: i128, duration_secs: u64) -> i128 {
        // Annual interest = amount * apy / 10000
        // Per-second interest = annual / (365.25 * 24 * 3600)
        let annual_interest = (amount * self.supply_apy_bps as i128) / 10_000;
        let seconds_per_year: i128 = 31_557_600; // 365.25 days
        (annual_interest * duration_secs as i128) / seconds_per_year
    }

    /// Calculate interest owed on a borrow amount over a given number of seconds.
    pub fn calculate_borrow_interest(&self, amount: i128, duration_secs: u64) -> i128 {
        let annual_interest = (amount * self.borrow_apy_bps as i128) / 10_000;
        let seconds_per_year: i128 = 31_557_600;
        (annual_interest * duration_secs as i128) / seconds_per_year
    }

    /// Get the maximum amount a user can borrow given their collateral.
    pub fn max_borrow(&self, collateral_value: i128) -> i128 {
        (collateral_value * self.collateral_factor_bps as i128) / 10_000
    }

    /// Check if a position is healthy (not under-collateralized).
    pub fn is_position_healthy(&self, collateral_value: i128, borrow_value: i128) -> bool {
        let max_borrow = self.max_borrow(collateral_value);
        borrow_value <= max_borrow
    }

    /// Get available liquidity (supplied - borrowed).
    pub fn available_liquidity(&self) -> i128 {
        self.total_supplied
            .checked_sub(self.total_borrowed)
            .unwrap_or(0)
    }

    /// Simulate a supply operation (returns updated pool state).
    pub fn simulate_supply(&self, amount: i128) -> Self {
        let mut pool = self.clone();
        pool.total_supplied = pool
            .total_supplied
            .checked_add(amount)
            .expect("supply overflow");
        if pool.total_supplied > 0 {
            pool.utilization_bps =
                ((pool.total_borrowed * 10_000) / pool.total_supplied) as u32;
        }
        pool
    }

    /// Simulate a borrow operation (returns updated pool state).
    pub fn simulate_borrow(&self, amount: i128) -> Self {
        let mut pool = self.clone();
        let available = pool.available_liquidity();
        if amount > available {
            panic!("insufficient liquidity for borrow");
        }
        pool.total_borrowed = pool
            .total_borrowed
            .checked_add(amount)
            .expect("borrow overflow");
        if pool.total_supplied > 0 {
            pool.utilization_bps =
                ((pool.total_borrowed * 10_000) / pool.total_supplied) as u32;
        }
        pool
    }
}
