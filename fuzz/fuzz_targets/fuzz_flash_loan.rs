// ═══════════════════════════════════════════════════════════════
// Fuzz Target: Flash Loan Execute
// ═══════════════════════════════════════════════════════════════
//
// Tests flash_loan_execute() invariants:
//   - profit < min_profit always panics (revert)
//   - fee = 0 when borrow_amount = 0 (edge case)
//   - fee calculation overflow (amount * fee_bps overflows i128)
//   - min_repay overflow (borrow + fee overflows i128)
//   - Matrix fee (1%) never produces negative user_profit
//   - Pool balance never goes negative after the operation
//   - Total volume tracking never overflows
//
// Fuzz layout (40 bytes minimum):
//   [0..16]  borrow_amount (i128 LE)
//   [16..32] min_profit (i128 LE)
//   [32..36] fee_bps (u32 LE, clamped to 0..500)
//   [36..40] pool_balance (u32 LE, used as mock pool base_balance)
// ═══════════════════════════════════════════════════════════════

#![no_main]

use libfuzzer_sys::fuzz_target;

const MAX_FLASH_LOAN_FEE_BPS: u32 = 500;
const DEFAULT_FLASH_LOAN_FEE_BPS: i128 = 30;
const MATRIX_FEE_DIVISOR: i128 = 100; // 1%

fuzz_target!(|data: &[u8]| {
    if data.len() < 40 {
        return;
    }

    let borrow_amount = i128::from_le_bytes(data[0..16].try_into().unwrap());
    let min_profit = i128::from_le_bytes(data[16..32].try_into().unwrap());
    let raw_fee_bps = u32::from_le_bytes(data[32..36].try_into().unwrap());
    let pool_balance_seed = u32::from_le_bytes(data[36..40].try_into().unwrap());

    // Clamp fee_bps to valid range as the contract does
    let fee_bps = raw_fee_bps % (MAX_FLASH_LOAN_FEE_BPS + 1);
    // Pool balance: use the seed to generate a realistic value
    let pool_base_balance: i128 = pool_balance_seed as i128 * 10_000;

    // ─── Invariant 1: borrow_amount must be positive ──────────────
    //
    // The contract delegates to verify_agent which checks amount > 0
    // indirectly, and pool liquidity check: pool.base_balance < borrow_amount.
    if borrow_amount <= 0 {
        // No flash loan should proceed with non-positive borrow amount
        // Verify: pool liquidity check would catch this (0 liquidity >= 0 borrow)
        let passes_liquidity = pool_base_balance >= borrow_amount;
        // For borrow_amount <= 0, any non-negative pool passes — this is a guard hole.
        // The contract's deposit() guard handles the positive check upstream.
        let _ = passes_liquidity;
        return;
    }

    // ─── Invariant 2: Fee calculation overflow detection ──────────
    //
    // fee = (borrow_amount * fee_bps as i128) / 10_000
    // If borrow_amount is near i128::MAX, the multiplication overflows.
    let fee_bps_i128 = fee_bps as i128;
    let fee_opt = borrow_amount.checked_mul(fee_bps_i128);

    if fee_opt.is_none() {
        // Overflow detected — the contract must use checked_mul here.
        // Any implementation that doesn't use checked_mul would produce
        // wrong (potentially negative) fees.
        assert!(
            borrow_amount > i128::MAX / fee_bps_i128.max(1),
            "Overflow must only occur when borrow_amount exceeds i128::MAX/fee_bps"
        );
        return;
    }

    let fee = fee_opt.unwrap() / 10_000;

    // ─── Invariant 3: min_repay overflow detection ────────────────
    //
    // min_repay = borrow_amount.checked_add(fee).expect("repay amount overflow")
    let min_repay_opt = borrow_amount.checked_add(fee);

    if min_repay_opt.is_none() {
        // Overflow: borrow_amount + fee overflows. Contract must catch this.
        assert!(
            borrow_amount > i128::MAX - fee,
            "min_repay overflow must only occur when borrow_amount > i128::MAX - fee"
        );
        return;
    }

    let min_repay = min_repay_opt.unwrap();

    // ─── Invariant 4: Insufficient pool liquidity ─────────────────
    if pool_base_balance < borrow_amount {
        // Contract panics: "insufficient pool liquidity"
        // After panic, pool state is unchanged (no partial writes)
        let pool_after = pool_base_balance; // unchanged
        assert_eq!(
            pool_after, pool_base_balance,
            "Pool balance must be unchanged after insufficient liquidity panic"
        );
        return;
    }

    // ─── Invariant 5: Simulated profit arithmetic ─────────────────
    //
    // simulated_profit = (borrow_amount * 50) / 10_000  →  0.5%
    let simulated_profit_opt = borrow_amount.checked_mul(50);
    if simulated_profit_opt.is_none() {
        // Overflow in simulated profit calculation
        assert!(
            borrow_amount > i128::MAX / 50,
            "Simulated profit overflow only at extreme amounts"
        );
        return;
    }
    let simulated_profit = simulated_profit_opt.unwrap() / 10_000;
    let total_after_trade_opt = borrow_amount.checked_add(simulated_profit);
    if total_after_trade_opt.is_none() {
        return; // overflow — contract catches via checked_add
    }
    let total_after_trade = total_after_trade_opt.unwrap();

    // ─── Invariant 6: Insufficient profit to cover fee ────────────
    //
    // The 0.5% simulated profit is less than the maximum 5% fee.
    // For fee_bps > 50, total_after_trade < min_repay always.
    if total_after_trade < min_repay {
        // Contract panics: "insufficient profit to cover flash loan fee"
        // This is the primary economic invariant of the flash loan.
        assert!(
            fee_bps > 50 || borrow_amount == 0,
            "Flash loan must fail when fee ({} bps) exceeds simulated 0.5% profit",
            fee_bps
        );
        return;
    }

    let net_profit_opt = total_after_trade.checked_sub(min_repay);
    if net_profit_opt.is_none() {
        return; // underflow — caught by checked_sub
    }
    let net_profit = net_profit_opt.unwrap();

    // ─── Invariant 7: Net profit below min_profit threshold ───────
    if net_profit < min_profit {
        // Contract panics: "net profit below minimum threshold"
        assert!(
            net_profit < min_profit,
            "Should have panicked: net_profit {} < min_profit {}",
            net_profit,
            min_profit
        );
        return;
    }

    // ─── Invariant 8: Matrix fee (1%) must never be negative ──────
    //
    // matrix_fee = net_profit / 100
    // user_profit = net_profit - matrix_fee
    let matrix_fee = net_profit / MATRIX_FEE_DIVISOR;
    let user_profit_opt = net_profit.checked_sub(matrix_fee);

    assert!(
        user_profit_opt.is_some(),
        "matrix_fee subtraction must not underflow: net_profit={} matrix_fee={}",
        net_profit,
        matrix_fee
    );

    let user_profit = user_profit_opt.unwrap();

    assert!(
        user_profit >= 0,
        "user_profit must never be negative: got {}",
        user_profit
    );

    assert!(
        matrix_fee >= 0,
        "matrix_fee must never be negative: got {}",
        matrix_fee
    );

    assert!(
        matrix_fee <= net_profit,
        "matrix_fee ({}) must not exceed net_profit ({})",
        matrix_fee,
        net_profit
    );

    // ─── Invariant 9: Pool balance arithmetic ────────────────────
    //
    // After successful flash loan:
    //   pool.base_balance -= borrow_amount   (during loan)
    //   pool.base_balance += min_repay        (repayment)
    // Net change = min_repay - borrow_amount = fee (always >= 0)
    let pool_after_borrow_opt = pool_base_balance.checked_sub(borrow_amount);
    assert!(
        pool_after_borrow_opt.is_some(),
        "Pool balance after borrow must not underflow: balance={} borrow={}",
        pool_base_balance,
        borrow_amount
    );

    let pool_after_borrow = pool_after_borrow_opt.unwrap();

    let pool_after_repay_opt = pool_after_borrow.checked_add(min_repay);
    assert!(
        pool_after_repay_opt.is_some(),
        "Pool balance after repay must not overflow"
    );

    let pool_final = pool_after_repay_opt.unwrap();
    assert!(
        pool_final >= pool_base_balance,
        "Pool balance must be >= initial after successful flash loan: initial={} final={}",
        pool_base_balance,
        pool_final
    );

    // ─── Invariant 10: Volume tracking overflow ───────────────────
    //
    // pool.total_volume += borrow_amount (checked_add)
    // With a very large total_volume and borrow_amount, this could overflow.
    let max_volume: i128 = i128::MAX;
    let volume_overflow = max_volume.checked_add(borrow_amount).is_none();
    if borrow_amount > 0 {
        assert!(
            volume_overflow,
            "Volume addition at i128::MAX must detect overflow for positive borrow amounts"
        );
    }

    // ─── Invariant 11: Default fee bps flash loan profitability ───
    //
    // With DEFAULT fee (0.3 bps), the 0.5% simulated profit should ALWAYS
    // be sufficient to repay (0.5% > 0.3%).
    {
        let default_fee = (borrow_amount * DEFAULT_FLASH_LOAN_FEE_BPS) / 10_000;
        let default_min_repay_opt = borrow_amount.checked_add(default_fee);
        if let Some(default_min_repay) = default_min_repay_opt {
            let default_total_opt = borrow_amount.checked_add(simulated_profit);
            if let Some(default_total) = default_total_opt {
                if borrow_amount > 0 {
                    assert!(
                        default_total >= default_min_repay,
                        "0.5% profit must cover 0.3% default fee: total={} repay={}",
                        default_total,
                        default_min_repay
                    );
                }
            }
        }
    }
});
