# Security Strategy: Nirium Institutional (Veridise V5 Standard)

## 1. Core Philosophy: The "Circuit Breaker" Architecture

In an institutional environment, availability is secondary to solvency. The system must fail closed (halt operations) rather than fail open (leak funds) upon detecting an anomaly.

### 1.1 Emergency Shutdown (The Red Button)
All contracts (`Identity-Pool`, `Payment-Gate`, `Sentinel`) must inherit a `Pausable` trait.

- **Trigger Conditions**:
  - **Velocity Limit Breach**: If outflows > 10% of TVL in 1 hour.
  - **Oracle Deviation**: If price feed deviates > 5% from TWAP.
  - **Admin Override**: Manual key-turn by the `Admin` role.
- **Effect**: All `mut` functions (deposit, withdraw, sweep) revert. Only `view` functions remain active.

### 1.2 Rate Limiting (The Throttle)
Implemented in the `Sentinel` contract for "Operator" roles (AI Agents).
- **Per-Block Limit**: Max 1 transaction per ledger per agent.
- **Capital Allowance**: Max 1000 USDC withdrawal per 24h rolling window.

---

## 2. Role-Based Access Control (RBAC)

We define strict hierarchy using Soroban's authorization framework.

| Role | Permissions | Cardinality | Authentication |
|------|-------------|-------------|----------------|
| **Admin** | `pause()`, `upgrade()`, `set_roots()` | Multi-Sig (3/5) | Ledger Key (Cold) |
| **Sentinel** | `sweep_idle_funds()`, `rebalance()` | Single Contract | Contract Address |
| **Operator** | `pay_invoice()`, `access_api()` | Dynamic (Agents) | Ed25519 Key (Hot) |
| **User** | `deposit()`, `withdraw()`, `vote()` | Unlimited | Public Access |

**Implementation Rule**:
All privileged functions must start with:
```rust
admin.require_auth(); // Enforces cryptographic signature check
```

---

## 3. Validation Vectors

### 3.1 Fuzz Testing (`cargo-fuzz`)
We do not trust unit tests alone. We bombard the system with random inputs to find edge cases.

**Target Invariant: The Conservation of Funds**
```rust
// contracts/sentinel/fuzz/invariant.rs
#[fuzz]
fn invariant_solvency(deposits: u128, withdrawals: u128) {
    let contract = deploy_sentinel();
    contract.simulate_ops(deposits, withdrawals);
    
    assert_eq!(
        contract.total_assets(), 
        contract.initial_balance() + deposits - withdrawals,
        "Solvency invariant violated!"
    );
}
```

### 3.2 Formal Verification (Kani)
We use the Kani Model Checker to mathematically prove properties of the code.

**Proof Target: Merkle Integrity**
- **Objective**: Prove that `insert_leaf()` **never** overwrites an existing non-zero leaf.
- **Method**: Symbolic execution of the insertion path.

### 3.3 Panic Strategy
We distinguish between "User Errors" and "System Failures".
- **Use `panic_with_error!`**: For logic errors (e.g., "Insufficient Balance"). This allows error codes to propagate to the frontend.
- **Use `panic!`**: ONLY for impossible states (e.g., storage corruption). This traps the contract and alerts the monitoring system.

---

## 4. x402 Replay Protection

To prevent an attacker from replaying a valid payment transaction to access the API multiple times:
1.  **Strict Nonce Tracking**: The `Payment-Gate` contract stores `consumed_tx_hashes`.
2.  **Lookback Window**: The proxy checks if `TxHash` is within the last 5 ledgers (approx 25s).
3.  **One-Time Use**: Once a `TxHash` is exchanged for an API credential, it is burned in the cache.

---

**Status**: DRAFT  
**Reviewer**: Mission Control  
**Date**: Feb 2026
