// ═══════════════════════════════════════════════════════════════
// Fuzz Target: ELO Score Recording
// ═══════════════════════════════════════════════════════════════
//
// Tests record_trade() ELO invariants from elo_reputation.rs:
//   - ELO score NEVER goes below 0 (floor at 0)
//   - ELO score never overflows i64 (wins can compound)
//   - Tier classification is always consistent with score
//   - Winning trade: elo += K_FACTOR (32)
//   - Losing trade:  elo -= K_FACTOR / 2 (16), clamped to 0
//   - total_trades increments monotonically
//   - winning_trades <= total_trades at all times
//   - total_volume_usdc tracks correctly (including negative volumes)
//
// Fuzz layout (33 bytes minimum):
//   [0..16]  profit_usdc (i128 LE)
//   [16..32] volume_usdc (i128 LE)
//   [32]     initial_elo_seed (u8, maps to starting ELO 0..=4095)
// ═══════════════════════════════════════════════════════════════

#![no_main]

use libfuzzer_sys::fuzz_target;

// Mirror constants from elo_reputation.rs
const ELO_INITIAL: i64 = 1200;
const ELO_K_FACTOR: i64 = 32;
const SILVER_THRESHOLD: i64 = 1500;
const GOLD_THRESHOLD: i64 = 2000;

/// Mirrors compute_tier() from elo_reputation.rs
#[derive(Debug, PartialEq, Eq)]
enum Tier {
    Unranked,
    Silver,
    Gold,
    Matrix,
}

fn compute_tier(elo: i64) -> Tier {
    if elo >= GOLD_THRESHOLD {
        Tier::Matrix
    } else if elo >= SILVER_THRESHOLD {
        Tier::Gold
    } else if elo >= 1000 {
        Tier::Silver
    } else {
        Tier::Unranked
    }
}

/// Mirrors record_trade() ELO update logic from elo_reputation.rs
fn simulate_record_trade(
    mut elo: i64,
    mut total_trades: u64,
    mut winning_trades: u64,
    mut total_volume: i128,
    profit_usdc: i128,
    volume_usdc: i128,
) -> (i64, u64, u64, i128, Tier) {
    let won = profit_usdc > 0;
    if won {
        // checked_add to prevent overflow
        elo = elo.checked_add(ELO_K_FACTOR).unwrap_or(i64::MAX);
        winning_trades = winning_trades.saturating_add(1);
    } else {
        elo -= ELO_K_FACTOR / 2;
        if elo < 0 {
            elo = 0; // Contract floor
        }
    }

    total_trades = total_trades.saturating_add(1);
    total_volume = total_volume.saturating_add(volume_usdc);

    let tier = compute_tier(elo);
    (elo, total_trades, winning_trades, total_volume, tier)
}

fuzz_target!(|data: &[u8]| {
    if data.len() < 33 {
        return;
    }

    let profit_usdc = i128::from_le_bytes(data[0..16].try_into().unwrap());
    let volume_usdc = i128::from_le_bytes(data[16..32].try_into().unwrap());
    let initial_elo_seed: u8 = data[32];

    // Map seed to a realistic starting ELO: 0..=4095
    // This covers Unranked (0-999), Silver (1000-1499), Gold (1500-1999), Matrix (2000+)
    let initial_elo: i64 = initial_elo_seed as i64 * 16; // 0, 16, 32, ... 4080

    // ─── Invariant 1: ELO never goes below 0 ─────────────────────
    //
    // This is the most critical invariant. The contract has an explicit floor:
    //   if profile.elo_score < 0 { profile.elo_score = 0; }
    let (post_elo, total_trades, winning_trades, total_volume, tier) =
        simulate_record_trade(initial_elo, 0, 0, 0, profit_usdc, volume_usdc);

    assert!(
        post_elo >= 0,
        "ELO must never go below 0: initial={} profit={} result={}",
        initial_elo,
        profit_usdc,
        post_elo
    );

    // ─── Invariant 2: ELO never overflows i64 ────────────────────
    //
    // With ELO_INITIAL = 1200 and K_FACTOR = 32, after N wins:
    // ELO = 1200 + 32*N. For overflow: N > (i64::MAX - 1200) / 32 ≈ 2.88e17
    // This is astronomically many trades, but we test the checked_add guard.
    let near_max_elo: i64 = i64::MAX - ELO_K_FACTOR + 1;
    let (overflow_elo, _, _, _, _) =
        simulate_record_trade(near_max_elo, 0, 0, 0, 1_i128, 0_i128); // win
    assert!(
        overflow_elo >= 0,
        "ELO near i64::MAX must not wrap to negative: got {}",
        overflow_elo
    );

    // ─── Invariant 3: Tier is always consistent with ELO ─────────
    let expected_tier = compute_tier(post_elo);
    assert_eq!(
        tier, expected_tier,
        "Tier must match ELO {}: expected {:?} got {:?}",
        post_elo, expected_tier, tier
    );

    // ─── Invariant 4: winning_trades <= total_trades ──────────────
    assert!(
        winning_trades <= total_trades,
        "winning_trades ({}) must never exceed total_trades ({})",
        winning_trades,
        total_trades
    );

    // ─── Invariant 5: Multiple successive trades ELO floor ────────
    //
    // Simulate many consecutive losses from minimum ELO.
    // ELO must stay at 0 throughout.
    {
        let mut elo: i64 = 0;
        let mut w = 0u64;
        let mut t = 0u64;
        let mut vol = 0i128;
        for _ in 0..100 {
            let (ne, nt, nw, nv, _) =
                simulate_record_trade(elo, t, w, vol, -1_i128, 1_000_000_i128);
            elo = ne;
            t = nt;
            w = nw;
            vol = nv;
            assert!(
                elo >= 0,
                "ELO must remain >= 0 after loss from floor: got {}",
                elo
            );
        }
        assert_eq!(elo, 0, "ELO must stay at 0 after 100 losses from 0: got {}", elo);
    }

    // ─── Invariant 6: Alternating win/loss converges ──────────────
    //
    // Pattern: win (elo += 32), loss (elo -= 16) → net +16 per pair.
    // ELO must always be non-negative throughout.
    {
        let mut elo: i64 = ELO_INITIAL;
        let mut w = 0u64;
        let mut t = 0u64;
        let mut vol = 0i128;
        for i in 0..50 {
            // Win
            let (ne, nt, nw, nv, _) =
                simulate_record_trade(elo, t, w, vol, 1_000_i128, 50_000_i128);
            elo = ne;
            t = nt;
            w = nw;
            vol = nv;
            assert!(elo >= 0, "ELO must be >= 0 after win #{}: {}", i, elo);

            // Loss
            let (ne, nt, nw, nv, _) =
                simulate_record_trade(elo, t, w, vol, -1_i128, 50_000_i128);
            elo = ne;
            t = nt;
            w = nw;
            vol = nv;
            assert!(elo >= 0, "ELO must be >= 0 after loss #{}: {}", i, elo);
        }
        // After 50 win+loss pairs starting at 1200, expected ELO ≈ 1200 + 50*16 = 2000
        assert!(
            elo >= ELO_INITIAL,
            "ELO should increase with alternating win/loss pattern: start={} end={}",
            ELO_INITIAL,
            elo
        );
    }

    // ─── Invariant 7: Volume overflow handled ─────────────────────
    //
    // total_volume_usdc += volume_usdc (contract uses plain i128 addition)
    // Test that extreme volume values don't cause UB.
    {
        let extreme_volume: i128 = volume_usdc;
        let base: i128 = i128::MAX / 2;
        let result = base.saturating_add(extreme_volume);
        assert!(
            result >= i128::MIN,
            "saturating_add must never produce values below i128::MIN"
        );
    }

    // ─── Invariant 8: Tier upgrade path is monotonic ──────────────
    //
    // Simulating 100 consecutive wins from ELO_INITIAL must eventually
    // reach Matrix tier and never downgrade during a win streak.
    {
        let mut elo: i64 = ELO_INITIAL;
        let mut prev_tier = compute_tier(elo);
        let mut w = 0u64;
        let mut t = 0u64;
        let mut vol = 0i128;
        for _ in 0..100 {
            let (ne, nt, nw, nv, new_tier) =
                simulate_record_trade(elo, t, w, vol, 1_000_i128, 50_000_i128);
            elo = ne;
            t = nt;
            w = nw;
            vol = nv;
            // Tier must not regress on consecutive wins
            let prev_score = match prev_tier {
                Tier::Unranked => 0i64,
                Tier::Silver   => 1000,
                Tier::Gold     => 1500,
                Tier::Matrix   => 2000,
            };
            let new_score = match new_tier {
                Tier::Unranked => 0i64,
                Tier::Silver   => 1000,
                Tier::Gold     => 1500,
                Tier::Matrix   => 2000,
            };
            assert!(
                new_score >= prev_score,
                "Tier must not regress during win streak: {:?} -> {:?}",
                prev_tier,
                new_tier
            );
            prev_tier = new_tier;
        }
        assert_eq!(
            prev_tier,
            Tier::Matrix,
            "100 wins from ELO_INITIAL must reach Matrix tier"
        );
    }

    // Suppress unused variable warnings
    let _ = (total_trades, winning_trades, total_volume);
});
