//! Mock Liquidity Pool — Deterministic testnet pool with 1M XLM depth.
//!
//! This mock always has sufficient liquidity and uses a constant-product
//! formula for deterministic pricing. Used for testnet development only.

use soroban_sdk::{contracttype, Env};

/// Mock pool configuration with deterministic behavior.
#[contracttype]
#[derive(Clone, Debug)]
pub struct MockLiquidityPool {
    pub pool_id: u64,
    pub base_reserve: i128,
    pub quote_reserve: i128,
    pub fee_bps: u32,
    pub total_swaps: u64,
    pub total_volume_base: i128,
    pub total_volume_quote: i128,
}

/// Default pool depth: 1,000,000 XLM (in stroops)
const DEFAULT_BASE_RESERVE: i128 = 1_000_000_0_000_000; // 1M XLM
/// Default quote: $100,000 USDC equivalent
const DEFAULT_QUOTE_RESERVE: i128 = 100_000_0_000_000; // 100K USDC
/// Default fee: 30 bps (0.3%)
const DEFAULT_FEE_BPS: u32 = 30;

impl MockLiquidityPool {
    /// Create a new mock pool with default 1M XLM depth.
    pub fn new_default(pool_id: u64) -> Self {
        Self {
            pool_id,
            base_reserve: DEFAULT_BASE_RESERVE,
            quote_reserve: DEFAULT_QUOTE_RESERVE,
            fee_bps: DEFAULT_FEE_BPS,
            total_swaps: 0,
            total_volume_base: 0,
            total_volume_quote: 0,
        }
    }

    /// Create a mock pool with custom parameters.
    pub fn new_custom(
        pool_id: u64,
        base_reserve: i128,
        quote_reserve: i128,
        fee_bps: u32,
    ) -> Self {
        Self {
            pool_id,
            base_reserve,
            quote_reserve,
            fee_bps,
            total_swaps: 0,
            total_volume_base: 0,
            total_volume_quote: 0,
        }
    }

    /// Calculate output amount using constant-product formula (x * y = k).
    /// Returns the output amount after fees.
    pub fn get_swap_output(&self, amount_in: i128, is_base_to_quote: bool) -> i128 {
        let (reserve_in, reserve_out) = if is_base_to_quote {
            (self.base_reserve, self.quote_reserve)
        } else {
            (self.quote_reserve, self.base_reserve)
        };

        // Apply fee: amount_in_after_fee = amount_in * (10000 - fee_bps) / 10000
        let amount_in_after_fee = (amount_in * (10_000 - self.fee_bps as i128)) / 10_000;

        // Constant product: (reserve_in + amount_in_after_fee) * (reserve_out - amount_out) = k
        // amount_out = reserve_out - (k / (reserve_in + amount_in_after_fee))
        // amount_out = (reserve_out * amount_in_after_fee) / (reserve_in + amount_in_after_fee)
        let numerator = reserve_out
            .checked_mul(amount_in_after_fee)
            .expect("swap numerator overflow");
        let denominator = reserve_in
            .checked_add(amount_in_after_fee)
            .expect("swap denominator overflow");

        numerator / denominator
    }

    /// Get the current price ratio (quote_reserve / base_reserve).
    /// Returns price in stroops per unit.
    pub fn get_price(&self) -> i128 {
        if self.base_reserve == 0 {
            return 0;
        }
        (self.quote_reserve * 10_000_000) / self.base_reserve
    }

    /// Simulate a flash loan borrow with fee calculation.
    /// Returns (borrowed_amount, required_repayment).
    pub fn simulate_flash_loan(&self, amount: i128) -> (i128, i128) {
        let fee = (amount * self.fee_bps as i128) / 10_000;
        let min_fee = 1i128; // Minimum 1 stroop fee
        let actual_fee = if fee < min_fee { min_fee } else { fee };
        (amount, amount + actual_fee)
    }

    /// Check if pool has sufficient liquidity for a given amount.
    pub fn has_liquidity(&self, amount: i128, is_base: bool) -> bool {
        if is_base {
            self.base_reserve >= amount
        } else {
            self.quote_reserve >= amount
        }
    }
}
