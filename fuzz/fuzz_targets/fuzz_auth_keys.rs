// ═══════════════════════════════════════════════════════════════
// Fuzz Target: Auth Key Validation
// ═══════════════════════════════════════════════════════════════
//
// Tests the API key validation logic against:
//   - Random key strings of all lengths (0 to 65535 bytes)
//   - SQL injection patterns embedded in keys
//   - Unicode edge cases (BOM, surrogates, zero-width chars)
//   - Null bytes (C string termination attacks)
//   - Keys that exactly match prefix format but have wrong body
//   - Keys with valid prefix but extreme lengths
//   - Timing side-channel: comparison must be constant-time
//   - Base64-invalid characters in key body
//
// Expected invariants:
//   - validate_api_key_format() returns bool deterministically
//   - No panic for any input
//   - No allocation failure for any input length up to 65535 bytes
//   - Timing-safe comparison never panics on length mismatch
// ═══════════════════════════════════════════════════════════════

#![no_main]

use libfuzzer_sys::fuzz_target;
use std::time::{Duration, Instant};

// ─── Mirror of the key validation logic from auth.ts (Rust equivalent) ───
//
// The TypeScript auth.ts generates keys as:
//   `sk_${tierPrefix}_${crypto.randomBytes(32).toString('hex')}`
// Resulting format: sk_inst_<64 hex chars> (total: 72 chars)
//                   sk_sbox_<64 hex chars> (total: 72 chars)
//                   sk_ent_<64 hex chars>  (total: 71 chars)
//                   sk_free_<64 hex chars> (total: 72 chars)

const VALID_PREFIXES: &[&str] = &["sk_inst_", "sk_sbox_", "sk_ent_", "sk_free_"];
const HEX_BODY_LEN: usize = 64; // 32 bytes as hex
const MIN_KEY_LEN: usize = 8;   // shortest prefix (sk_ent_) + at least 1 char
const MAX_KEY_LEN: usize = 256; // hard limit to prevent DoS

/// Validates the format of an API key.
/// Returns true if the key matches the expected format.
/// Must NEVER panic for any input.
fn validate_api_key_format(key: &str) -> bool {
    // Enforce length bounds first (constant-time length check is fine)
    let len = key.len();
    if len < MIN_KEY_LEN || len > MAX_KEY_LEN {
        return false;
    }

    // Check for null bytes (C string injection)
    if key.contains('\0') {
        return false;
    }

    // Check for non-ASCII characters (API keys must be ASCII)
    if !key.is_ascii() {
        return false;
    }

    // Find matching prefix
    let mut matched_prefix: Option<&str> = None;
    for &prefix in VALID_PREFIXES {
        if key.starts_with(prefix) {
            matched_prefix = Some(prefix);
            break;
        }
    }

    let prefix = match matched_prefix {
        Some(p) => p,
        None => return false,
    };

    // Check body length (hex-encoded random bytes)
    let body = &key[prefix.len()..];
    if body.len() != HEX_BODY_LEN {
        return false;
    }

    // Validate hex encoding: only [0-9a-f]
    body.bytes().all(|b| matches!(b, b'0'..=b'9' | b'a'..=b'f'))
}

/// SQL injection pattern detector (mirrors sqlInjectionGuard from security.ts).
/// Returns true if the string contains SQL injection patterns.
fn contains_sql_injection(input: &str) -> bool {
    // Common patterns — case-insensitive check
    let lower = input.to_ascii_lowercase();
    let patterns = [
        "union select",
        "drop table",
        "insert into",
        "delete from",
        "exec(",
        "execute(",
        "xp_cmdshell",
        "' or ",
        "' and ",
        "; drop",
        "sleep(",
        "waitfor delay",
        "benchmark(",
        "/*",
        "-- ",
    ];
    patterns.iter().any(|p| lower.contains(p))
}

/// Timing-safe string comparison (mirrors crypto.timingSafeEqual).
/// Must not panic even when buffers have different lengths.
fn timing_safe_eq(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    let mut result = 0u8;
    for (x, y) in a.iter().zip(b.iter()) {
        result |= x ^ y;
    }
    result == 0
}

fuzz_target!(|data: &[u8]| {
    // Convert to string — handle invalid UTF-8 gracefully
    let key_str = match std::str::from_utf8(data) {
        Ok(s) => s,
        Err(e) => {
            // Partially valid UTF-8: use the valid prefix
            let valid_up_to = e.valid_up_to();
            match std::str::from_utf8(&data[..valid_up_to]) {
                Ok(s) => s,
                Err(_) => "", // degenerate: treat as empty
            }
        }
    };

    // ─── Invariant 1: validate_api_key_format never panics ───────
    let is_valid = validate_api_key_format(key_str);

    // ─── Invariant 2: SQL injection in API key field ──────────────
    //
    // If the key looks like a SQL injection, it must be rejected by
    // the format validator (SQL chars are not valid hex).
    if contains_sql_injection(key_str) {
        assert!(
            !is_valid,
            "SQL injection pattern must fail format validation: {:?}",
            &key_str[..key_str.len().min(80)]
        );
    }

    // ─── Invariant 3: Keys with null bytes must be rejected ───────
    if data.contains(&0u8) {
        assert!(
            !is_valid,
            "Key with null byte must fail validation"
        );
    }

    // ─── Invariant 4: Non-ASCII keys must be rejected ────────────
    if data.iter().any(|&b| b > 127) {
        assert!(
            !is_valid,
            "Non-ASCII key must fail validation"
        );
    }

    // ─── Invariant 5: Keys longer than MAX_KEY_LEN must be rejected
    if key_str.len() > MAX_KEY_LEN {
        assert!(
            !is_valid,
            "Oversized key (len={}) must fail validation",
            key_str.len()
        );
    }

    // ─── Invariant 6: Only valid hex body passes ──────────────────
    //
    // A key of the correct length but with non-hex chars must fail.
    for prefix in VALID_PREFIXES {
        let body_len = HEX_BODY_LEN;
        let total = prefix.len() + body_len;
        let non_hex_key = format!("{}{}", prefix, "g".repeat(body_len));
        assert_eq!(
            validate_api_key_format(&non_hex_key),
            false,
            "Key with non-hex body '{}...' must fail",
            &non_hex_key[..prefix.len().min(non_hex_key.len())]
        );
        let _ = total; // suppress warning
    }

    // ─── Invariant 7: Timing-safe comparison is correct ──────────
    //
    // Test that timing_safe_eq returns true iff bytes are equal.
    if data.len() >= 2 {
        let mid = data.len() / 2;
        let a = &data[..mid];
        let b = &data[mid..];

        // Different lengths must return false
        if a.len() != b.len() {
            assert!(
                !timing_safe_eq(a, b),
                "timing_safe_eq must return false for different-length slices"
            );
        }

        // Same slice compared to itself must return true
        assert!(
            timing_safe_eq(a, a),
            "timing_safe_eq must return true for identical slices"
        );
    }

    // ─── Invariant 8: Empty key is always rejected ────────────────
    assert!(
        !validate_api_key_format(""),
        "Empty string must fail key validation"
    );

    // ─── Invariant 9: Exact-format valid key passes ───────────────
    //
    // A syntactically valid key must pass. This ensures we haven't
    // accidentally over-restricted the validator.
    let valid_key = "sk_inst_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    assert!(
        validate_api_key_format(valid_key),
        "A well-formed key must pass validation: {}",
        valid_key
    );

    // ─── Invariant 10: Unicode zero-width characters are rejected ─
    //
    // Zero-width chars are valid UTF-8 but not ASCII.
    // They must not pass key validation (keys are hex ASCII only).
    let zw_key = "sk_inst_\u{200B}123456789abcdef0123456789abcdef0123456789abcdef0123456789ab";
    assert!(
        !validate_api_key_format(zw_key),
        "Key with zero-width chars must fail validation"
    );

    // ─── Invariant 11: Prefix enumeration is exhaustive ──────────
    //
    // Any key NOT starting with a known prefix must fail, regardless
    // of how valid the body looks.
    let unknown_prefix_key = format!("sk_admin_{}", "a".repeat(HEX_BODY_LEN));
    assert!(
        !validate_api_key_format(&unknown_prefix_key),
        "Unknown prefix sk_admin_ must fail validation"
    );

    // ─── Invariant 12: Uppercase hex is rejected ─────────────────
    //
    // The key generator in auth.ts uses .toString('hex') which produces
    // lowercase hex. Uppercase must be rejected to prevent canonicalization issues.
    let upper_key = "sk_inst_0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCD";
    assert!(
        !validate_api_key_format(upper_key),
        "Uppercase hex in key body must fail validation (use lowercase only)"
    );
});
