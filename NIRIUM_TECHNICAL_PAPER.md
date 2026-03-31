# 🧠 Nirium Protocol: Technical Whitepaper (v1.1)
> **Autonomous Sovereign Agent Matrix on Stellar/Soroban**

---

## 1. Abstract
Nirium is a decentralized infrastructure protocol designed for the orchestration of **Sovereign AI Agents** on the Stellar network. By combining **Soroban Smart Contracts** with a high-fidelity **Neural Matrix (LLM)** layer, Nirium enables a new class of financial actors: autonomous, self-custodial AI entities that can navigate complex DeFi environments spanning both cryptocurrency and **Real-World Assets (RWAs)**. The protocol introduces four key innovations: **Multi-Asset Vault System** (XLM, USDC, CETES), **Single-Invocation Atomic Flash Loans**, an **On-Chain ELO Meritocracy**, and a **BlackBox Audit Immutable Archive**. As of March 2026, the protocol operates **30 autonomous agents** on Stellar Testnet with **4 deployed smart contracts** and **3 Stellar Asset Contracts** supporting triple-asset vault operations verified on-chain.

---

## 2. Theoretical Framework: Sovereign Agency
The transition from "Bots" to "Agents" in Nirium is defined by **Cryptographic Sovereignty**. Every execution unit (Agent) owns its private keys (Ed25519) and operates through a delegation model that preserves the user's primary custody while allowing the agent to act as a physical executor.

### 2.1 The "Sentinel" Persona
A Sentinel in Nirium can be either a Human or an AI Agent. Both are tracked by the same reputation ledger, creating a **Hybrid DeFi Species** environment where performance is the only measure of success.

---

## 3. On-Chain Protocol Architecture (Soroban-Native)

### 3.1 NiriumVault: Multi-Asset Orchestration Engine
The `NiriumVault` contract (`CDMNZIICSHWQMRLWOAVE5VACRY5LVTLGMB75PS3JB5KFMR6TUJXV3DHU`) is the primary entry point for capital, supporting three asset types through Stellar Asset Contracts (SAC):
- **XLM**: Native Stellar lumens (SAC: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`)
- **USDC**: Circle USD stablecoin (SAC: `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`)
- **CETES**: Mexican Federal Treasury Certificates via Etherfuse (SAC: `CC72F57YTPX76HAA64JQOEGHQAPSADQWSY5DWVBR66JINPFDLNCQYHIC`)

The vault implements a critical **fee decoupling** architecture: the `create_vault` ABI accepts an explicit `xlm_address` parameter, ensuring the 12.5 XLM platform fee is always settled in native XLM regardless of the vault's base asset. This prevents fatal errors when creating USDC or CETES vaults.

Three security boundaries are enforced:
- **Authorization Boundary**: Deposits and withdrawals are strictly restricted to the owner (`require_auth`).
- **Asset Isolation**: Each vault is tied to a specific asset type, preventing cross-contamination.
- **Execution Boundary**: Agents can only execute pre-authorized functions within defined `max_execution_amount` limits.

#### 3.1.1 Single-Invocation Flash Loan (SIFL) Pattern
Unlike traditional flash loans that require separate "borrow" and "repay" steps (often leading to "Hot Potato" vulnerabilities), Nirium implements an atomic pattern:
```rust
pub fn flash_loan_execute(env: Env, ...) -> i128 {
    // 1. Borrowing logic
    // 2. Execution logic within the same scope
    // 3. Verification of (Profit + Fee)
    // 4. Verification of Matrix Fee (1% of net-profit)
    // 5. Automatic Revert on fail via panic!()
}
```
This ensures that insolvency is mathematically impossible at the protocol level.

### 3.2 ELO Reputation Ledger
Reputation is calculated using an on-chain implementation of the ELO system.
- **Initial Score**: 1200.
- **K-Factor**: 32 (Standard institutional intensity).
- **Metric-Driven Weights**: ELO is affected by total profit, pools created, and flash loan success rate.
- **Tiering Thresholds**:
  - **Silver**: 1000 - 1500
  - **Gold**: 1500 - 2000
  - **Matrix**: > 2000 (Access to advanced Multi-Op execution flows).

### 3.3 Rewards & Staking: The Meritocratic Incentive Layer
Nirium introduces an economic bridge between passive users and active agents. 
- **Delegated Staking**: Users can stake XLM into high-performing agents. 
- **Profit Sharing**: Accrued protocol fees (1% of net profit) are partially redistributed to stakers based on their contribution and the agent's ELO score.
- **Reward Multipliers**: Top-tier agents (Matrix) provide higher reward multipliers to their stakers, incentivizing users to delegate to the most efficient units.

---

## 4. Off-Chain Intelligence: The Swarm Layer

### 4.1 The 8-Second Tick Cycle
The project maintains a "Swarm" of **30 agents** running on randomized 3–12 second intervals in a **Racing Mode** where agents compete independently. Each tick follows a synchronized four-phase pipeline:
1. **Telemetry**: Collection of sub-second market data from Horizon.
2. **Analysis**: Prompting the Neural Matrix for trade confirmation.
3. **Synthesis**: Construction of XDR transaction envelopes.
4. **Resolution**: Broadcast to the Stellar network and synchronization to the Supabase Realtime layer.

### 4.2 Neural Matrix Providers
Nirium abstracts LLM interaction through a provider-agnostic layer, supporting:
- **Cloud Tiers**: OpenAI (o1/gpt-4o), Anthropic (Claude 3.5), Gemini Pro.
- **Edge Tiers**: Grok (xAI), MiniMax (Ultra-low latency).
- **Private Tiers**: **Ollama** (Local Llama/Mistral) for private institutional execution.

---

## 5. Security and Auditability

### 5.1 The BlackBox Archive & IPFS Integration
To solve the "AI Hallucination" audit problem, Nirium implements the **BlackBox Archive**. Every decision made by an agent — including the raw prompt, the LLM reasoning, and the resulting TX hash — is:
1. Signed with HMAC-SHA256.
2. Written to the **Logs Data Layer** in real-time.
3. Indexed with an **IPFS CID** (Decentralized Forensic Hash) for long-term immutable storage verification via Pinata.
4. Exportable as encrypted JSON via the "Black Box Data" operator interface.

### 5.2 Circuit Breakers
The protocol implements `Pausable` states and `max_execution_amount` per delegation, allowing humans to immediately "kill" any agent that deviates from its expected risk profile.

---

## 6. Real-World Asset Integration: CETES on Stellar

### 6.1 Etherfuse Partnership
Nirium integrates **CETES** (Certificados de la Tesorería de la Federación - Mexican Federal Treasury Certificates) through a partnership with Etherfuse, enabling AI agents to manage real-world government bonds alongside cryptocurrency assets.

### 6.2 Stellar Asset Contract (SAC) Architecture
CETES tokens are wrapped as Stellar Asset Contracts, allowing seamless interaction with Soroban smart contracts:
- **Classic Asset**: `CETES:GC3CW7EDYRTWQ635VDIGY6S4ZUF5L6TQ7AA4MWS7LEQDBLUSZXV7UPS4`
- **SAC Address**: `CC72F57YTPX76HAA64JQOEGHQAPSADQWSY5DWVBR66JINPFDLNCQYHIC`
- **Decimals**: 7 (matching Stellar standard)

### 6.3 Mexican Market Access
The CETES integration enables:
- **Fiat On-Ramp**: Mexican users can convert MXN to CETES via Etherfuse's SPEI integration (Sandbox environment active: `https://api.sand.etherfuse.com`)
- **Autonomous Management**: AI agents can create vaults, deposit, and withdraw CETES programmatically
- **Cross-Border DeFi**: International users gain access to Mexican government bonds without traditional banking barriers
- **Dashboard Integration**: CETES balance display, trustline management, and "Buy via SPEI" flow built into the operator dashboard

### 6.4 Swarm Operations with CETES
The autonomous swarm executes three CETES-specific operations:
1. **Vault Creation** (5% probability): Creates CETES-denominated vaults
2. **Deposits** (10% probability): 100-1000 CETES deposits
3. **Withdrawals** (5% probability): 50-500 CETES withdrawals

This extends the total operation distribution from 17 to 20 weighted operations, with an estimated 90 CETES vaults and 8,640 total vault operations per hour.

---

## 7. Economic Model: Matrix Fee
Nirium avoids inflationary token models. Instead, it operates on a **Value-Capture model**:
- **Protocol Fee**: 1% of net realized profit from autonomous executions.
- **Vault Deployment**: 12.5 XLM (one-time) for anti-spam.
- **Revenue Split**: 99% to User, 1% to Protocol Treasury.

---

## 8. Performance Benchmarks (Stellar Testnet)
- **Active Agents**: 30 autonomous units (racing independently)
- **Supported Assets**: 3 (XLM, USDC, CETES) via Stellar Asset Contracts
- **Total Operations**: 20 weighted operations (9 SDEX + 8 Vault + 3 CETES)
- **Estimated Vault Creation**: 90 vaults (30 XLM + 30 USDC + 30 CETES)
- **Vault Operations Throughput**: ~8,640 ops/hour
- **Max Throughput per Wallet**: ~1.2M atomic operations/month
- **Average Interaction Latency**: ~3.5s (Data ingestion to TX Finality)
- **Data Sync Latency**: <100ms (On-chain to UI via Supabase Realtime)
- **Test Coverage**: 579 lines, 14 test cases (Vault, Delegation, Flash Loans, Stellar-Native Ops, Pools)

---

## 9. Data Sovereignty: Master Schema
The protocol infrastructure is centered around a consolidated **Supabase Master Schema**, enabling sub-100ms real-time synchronization of the Neural Feed, Leaderboard, and Marketplace logic. This schema ensures a unified source of truth for all protocol actors (Agents, Creators, and Stakers).

## 10. Recent Technical Refinements: From Demo to On-Chain Reality

During the final development phases, critical architectural adjustments were made to solidify the protocol's execution guarantees:

1. **Eradication of Simulated State:** Early UI prototypes relied on `localStorage` and simulated zero-value interactions. The Next.js client is now exclusively wired to raw Soroban contract calls, guaranteeing that every vault creation, deposit (XLM, USDC, CETES), and withdrawal is a cryptographically verifiable transaction on the Stellar Testnet.
2. **Sentinel→Vault Contract Migration:** A new `NiriumVault` contract (`CB67X4...DHEN`) was deployed to replace the original instance, consolidating the vault orchestration engine with full multi-asset support and the critical fee decoupling architecture.
3. **Multi-Asset Fee Decoupling:** A critical bug was resolved in the `NiriumVault` contract where non-native vaults (like USDC or CETES) attempted to charge the platform deployment fee in their base asset. We introduced a decoupled `xlm_address` parameter to the `create_vault` ABI, ensuring the 12.5 XLM platform fee is consistently settled in native XLM without compromising the vault's internal asset accounting.
4. **CETES Expansion Operations:** The Soroban smart contracts and Swarm agent pipelines were expanded to fully support the Mexican Treasury Bond (CETES) tokenization layer via Etherfuse. The AI swarm now seamlessly distributes its actions across XLM, USDC, and CETES operations (Vault Creation, Deposits, and Withdrawals).
5. **Etherfuse Fiat On-Ramp:** Full API integration with Etherfuse Sandbox for SPEI-based MXN→CETES conversion, including KYC onboarding, quote generation, and order lifecycle tracking.
6. **State Persistence & Server Hardening:** In-memory API key stores for the agent server were replaced with robust Supabase PostgreSQL persistence, ensuring that agent authentication remains robust across server redeployments and silent failures are forcefully rejected upon initialization.
7. **30-Agent Swarm V2:** The autonomous swarm was expanded from 15 to 30 agents, each racing independently with randomized 3-12 second intervals and 20 weighted Soroban operations.
8. **Comprehensive Test Suite:** 579 lines of Rust tests covering 14 test scenarios across vault lifecycle, agent delegation, flash loans, and Stellar-native operations.
9. **Institutional Sandbox API:** Engineered a robust multi-tier API gateway designed specifically for institutional due diligence. The system handles dynamic tiering (Free, Sandbox, Institutional) with aggressive rate-limiting (up to 10,000 req/day). Keys (`nrm_ins_...`) operate atop a hybrid persistence layer (PostgreSQL + In-memory fallback).
10. **Cryptographic Developer Console:** Deployed an Agent Console where external developers generate personal API keys (`nrm_fre_...`) by cryptographically signing payloads with their Ed25519 Stellar wallets, ensuring secure 3rd-party access to the Nirium execution engine.

---

## 11. Conclusion

Nirium represents a significant leap in DeFi autonomy. By treating AI as a first-class citizen with cryptographic rights and on-chain accountability, we are building the first protocol capable of true **Intelligent Capital Management** spanning both cryptocurrency and real-world assets. The integration of CETES (Mexican Treasury Bonds) demonstrates Nirium's ability to bridge traditional finance with decentralized autonomous systems, opening new frontiers for AI-managed portfolios that include government securities alongside digital assets.

The protocol's current deployment on Stellar Testnet — with 30 autonomous agents, 4 smart contracts, 3 supported asset types, and a comprehensive test suite — validates the architectural foundations for mainnet readiness.

---
**Authors**: Vaiosx, M0nsxx.  
**Version**: 1.1 (March 24, 2026).  
**Contact**: [Institutional@Nirium.Matrix](mailto:institutional@nirium.matrix)
