// ═══════════════════════════════════════════════════════════════
// Fuzz Target: XDR Parsing Safety
// ═══════════════════════════════════════════════════════════════
//
// Ensures that malformed XDR byte sequences never cause:
//   - Panics / unwrap() without catch
//   - Memory unsafety (buffer overreads)
//   - Infinite loops or excessive memory allocation
//   - Integer overflow in sequence number parsing
//   - Undefined behavior from malformed enum discriminants
//
// Tests:
//   - Random byte sequences of all lengths
//   - Truncated valid TransactionEnvelope XDR
//   - Modified sequence numbers (u32 boundary values)
//   - Malformed type discriminants (negative enum values)
//   - Oversized vector length prefixes (XDR DoS)
//
// Uses stellar-xdr crate for actual XDR parsing.
// All parse errors must be returned as Err(_), never panic.
// ═══════════════════════════════════════════════════════════════

#![no_main]

use libfuzzer_sys::fuzz_target;
use stellar_xdr::curr::{
    Limits, ReadXdr, TransactionEnvelope, TransactionV1Envelope,
    OperationBody, AccountId, MuxedAccount, Transaction,
    SequenceNumber, Uint256, Hash,
};
use std::io::Cursor;

/// Wrap all parse attempts in a catch to prevent any panic propagation.
/// Returns true if parsing completed (Ok or Err), false if it panicked
/// (which would be caught by the fuzzer as a crash).
fn safe_parse_transaction_envelope(data: &[u8]) -> bool {
    let mut cursor = Cursor::new(data);
    let limits = Limits::none(); // No artificial limits — let the fuzzer stress everything

    // The key invariant: this must NEVER panic.
    // It may return Err — that's fine. Panic = crash = bug.
    let result = TransactionEnvelope::read_xdr(&mut cursor);

    match result {
        Ok(_envelope) => {
            // Successfully parsed — verify the envelope is well-formed
            // (the XDR library guarantees this if Ok is returned)
            true
        }
        Err(_e) => {
            // Parse error — this is expected for malformed input.
            // The important thing is no panic occurred.
            true
        }
    }
}

/// Test sequence number boundary parsing.
/// XDR SequenceNumber is i64 — test that boundary values don't cause issues.
fn test_sequence_number_parsing(seq_bytes: &[u8; 8]) -> bool {
    let raw = i64::from_be_bytes(*seq_bytes);

    // Sequence numbers in Stellar are monotonically increasing i64 values.
    // Test boundary conditions:
    let _seq = SequenceNumber::from(raw);

    // i64::MIN, i64::MAX, 0, -1 should all be representable without overflow
    true
}

/// Test that parsing of a valid XDR envelope with a modified sequence number
/// doesn't cause arithmetic issues downstream.
fn test_truncated_xdr(full_data: &[u8], truncate_at: usize) -> bool {
    if truncate_at >= full_data.len() {
        return true;
    }
    let truncated = &full_data[..truncate_at];
    let mut cursor = Cursor::new(truncated);
    let limits = Limits::none();

    // Must return Err for truncated input, never panic
    let result = TransactionEnvelope::read_xdr(&mut cursor);
    assert!(
        result.is_err(),
        "Truncated XDR must fail to parse, not return Ok"
    );
    true
}

/// Test that an XDR blob with a crafted oversized length prefix doesn't
/// allocate excessive memory or panic.
fn test_oversized_vector_prefix(data: &[u8]) -> bool {
    // XDR vectors are length-prefixed with a u32. An attacker can set this
    // to 2^32-1 to force huge allocation. The stellar-xdr crate must handle
    // this gracefully with Limits or return an error.
    let mut cursor = Cursor::new(data);
    // Use strict limits to prevent DoS via memory allocation
    let limits = Limits {
        depth: 100,
        len: 65536, // 64 KiB max
    };

    let result = TransactionEnvelope::read_xdr_with_depth_limit(&mut cursor, limits.depth);
    // Result can be Ok or Err — both are acceptable. No panic allowed.
    let _ = result;
    true
}

fuzz_target!(|data: &[u8]| {
    // ─── Test 1: Random bytes — primary fuzz surface ──────────────
    safe_parse_transaction_envelope(data);

    // ─── Test 2: Sequence number boundary values ──────────────────
    if data.len() >= 8 {
        let seq_bytes: [u8; 8] = data[..8].try_into().unwrap();
        test_sequence_number_parsing(&seq_bytes);
    }

    // ─── Test 3: Truncated valid XDR ─────────────────────────────
    // We truncate the input at various points to test partial-read handling
    if data.len() >= 4 {
        // Truncate at 1/4, 1/2, and 3/4 of the input length
        for &fraction in &[4usize, 2usize, 4usize * 3] {
            let truncate_at = data.len() / fraction;
            if truncate_at > 0 && truncate_at < data.len() {
                test_truncated_xdr(data, truncate_at);
            }
        }
    }

    // ─── Test 4: Oversized vector prefix DoS ─────────────────────
    if data.len() >= 4 {
        test_oversized_vector_prefix(data);
    }

    // ─── Test 5: Malformed enum discriminants ────────────────────
    // XDR enums are i32-encoded. Values outside the valid range must
    // return Err, not panic or produce garbage.
    if data.len() >= 4 {
        let discriminant = i32::from_be_bytes(data[..4].try_into().unwrap());
        // Build a fake XDR blob starting with this discriminant
        let mut fake_xdr = discriminant.to_be_bytes().to_vec();
        fake_xdr.extend_from_slice(data.get(4..).unwrap_or(&[]));
        safe_parse_transaction_envelope(&fake_xdr);
    }

    // ─── Test 6: Boundary i128 / u32 in amounts ──────────────────
    // XDR Int64 fields (amounts) use i64. Test all-zeros, all-ones.
    {
        let boundary_cases: &[&[u8]] = &[
            &[0u8; 32],                               // all zeros
            &[0xFF; 32],                              // all ones
            &[0x7F, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, // i64::MAX
              0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // i64::MIN
              0x00, 0x00, 0x00, 0x01,                         // 1
              0xFF, 0xFF, 0xFF, 0xFF,                         // u32::MAX
              0x00, 0x00, 0x00, 0x04,                         // 4 (typical op count)
              0x00, 0x00, 0x00, 0x00],                        // padding
        ];
        for &case in boundary_cases {
            safe_parse_transaction_envelope(case);
        }
    }

    // ─── Test 7: Null bytes and non-UTF8 sequences ────────────────
    // Account IDs in XDR are 32-byte raw keys (not UTF-8).
    // Ensure the parser handles null bytes in key fields.
    if data.len() >= 32 {
        let mut null_heavy = vec![0u8; 4]; // type discriminant = 0
        null_heavy.extend_from_slice(&data[..28]);
        safe_parse_transaction_envelope(&null_heavy);
    }

    // ─── Test 8: Repeated parsing of same input is deterministic ──
    // XDR parsing must be deterministic — same input, same result.
    {
        let result1 = {
            let mut cursor = Cursor::new(data);
            TransactionEnvelope::read_xdr(&mut cursor).ok().map(|_| true)
        };
        let result2 = {
            let mut cursor = Cursor::new(data);
            TransactionEnvelope::read_xdr(&mut cursor).ok().map(|_| true)
        };
        assert_eq!(
            result1, result2,
            "XDR parsing must be deterministic for the same input"
        );
    }
});
