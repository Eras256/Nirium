# Nirium: Master Architecture Document v1.0
> **Institutional Edition 2026** | Stellar Protocol 25 (X-Ray) + Neural UI

---

## 1. System Overview

Nirium is a **sovereign decentralized infrastructure** that fuses immersive visual experiences with absolute mathematical security. It operates on three fundamental pillars:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  NIRIUM                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────────┐ │
│  │   NEURAL UI       │   │   ZK-PRIVACY      │   │   x402 ECONOMY        │ │
│  │   (Frontend)      │◄─►│   (Backend)       │◄─►│   (Integration)       │ │
│  └───────────────────┘   └───────────────────┘   └───────────────────────┘ │
│         │                        │                        │                 │
│         ▼                        ▼                        ▼                 │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────────────┐   │
│  │ Next.js 16  │         │ Soroban     │         │ HTTP 402 Protocol   │   │
│  │ R3F/WebGL   │         │ Rust SDK    │         │ Stellar Payments    │   │
│  │ GPGPU       │         │ ZK-SNARKs   │         │ Agent Subscriptions │   │
│  └─────────────┘         └─────────────┘         └─────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture: Neural UI

### 2.1 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js | 16.x | App Router, RSC, Streaming |
| Language | TypeScript | 5.7+ | Type safety |
| 3D Engine | React Three Fiber | 9.x | WebGL abstraction |
| 3D Utils | @react-three/drei | latest | Materials, helpers |
| Post-processing | @react-three/postprocessing | latest | Bloom, effects |
| Styling | Tailwind CSS | 4.0 | Utility-first CSS |
| Charts | Recharts | latest | Data visualization |
| State | Zustand | latest | Global state |

### 2.2 Visual System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RENDERING PIPELINE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Scene     │───►│   GPGPU     │───►│   Glass     │───►│   Post      │  │
│  │   Setup     │    │   Compute   │    │   Material  │    │   Process   │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│        │                  │                  │                  │          │
│        ▼                  ▼                  ▼                  ▼          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │ Camera      │    │ 50K Neural  │    │ Transmission│    │ Bloom       │  │
│  │ Controls    │    │ Particles   │    │ Refraction  │    │ Chromatic   │  │
│  │ Lighting    │    │ Synapses    │    │ Aberration  │    │ Vignette    │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Neural Particle System (GPGPU)

The neural network simulation uses GPU-accelerated computing:

| Parameter | Value | Description |
|-----------|-------|-------------|
| Particle Count | 50,000 | Neural nodes |
| Synapse Threshold (ε) | 0.1 | Distance for connection |
| Cursor Force (k) | 15.0 | Attractor strength |
| Force Falloff | 1/r² | Inverse square law |
| Frame Rate Target | 60fps | Smooth animation |

**GLSL Shader Mathematics:**
```glsl
// Cursor attractor force
vec3 cursorForce = normalize(cursorPos - particlePos) * (k / (distance * distance));

// Synapse opacity calculation
float opacity = 1.0 - (distance / epsilon);
```

### 2.4 MeshTransmissionMaterial Configuration

| Property | Value | Effect |
|----------|-------|--------|
| transmission | 1.0 | Full transparency |
| thickness | 3.5 | Substantial glass depth |
| roughness | 0.15 | Frosted polish |
| chromaticAberration | 0.06 | RGB edge separation |
| anisotropy | 0.5 | Directional blur |
| distortion | 0.2 | Liquid deformation |

### 2.5 Navigation Architecture

```
NAVBAR (Floating Glass Container)
├── 📊 Dashboard (Panel de Control Nirium)
│   ├── TVL Charts (Recharts + R3F wrapper)
│   ├── Wallet Balance Display
│   ├── x402 Channel Status
│   └── Validator Health Metrics
│
├── 📈 Markets (Mercados Cuánticos)
│   ├── Swap Interface (XLM, USDC, AQUA)
│   ├── 3D Volumetric Order Book
│   │   └── Crystalline pillars for liquidity depth
│   └── Trade Execution Shockwaves
│
├── 🗳️ Governance (Salón de Gobernanza)
│   ├── Quadratic Voting System
│   ├── ZK-Proof Identity Verification
│   ├── Floating Proposal Orbs (Metaballs)
│   └── Real-time Approval Gradients
│
└── 🔬 Neural Lab (Laboratorio x402)
    ├── API Key Management Console
    ├── Monaco Editor Integration
    ├── Transaction Debugger
    └── Agent Subscription Manager
```

---

## 3. Backend Architecture: Stellar Protocol 25 (X-Ray)

### 3.1 Soroban Contract Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SOROBAN CONTRACT SYSTEM                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                          Verifier.rs                                  │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐   │ │
│  │  │bn254_g1_add │  │bn254_g1_mul │  │bn254_multi_pairing_check    │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘   │ │
│  │                    ↓ Groth16 Proof Verification ↓                     │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                       IdentityPool.rs                                 │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐   │ │
│  │  │ Merkle Tree     │  │ Poseidon Hash   │  │ Nullifier Registry  │   │ │
│  │  │ (Persistent)    │  │ (t=3, rate=2)   │  │ (Temporary/TTL)     │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘   │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                       PaymentGate.rs                                  │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐   │ │
│  │  │ SEP-41 Token    │  │ PaymentAuthorized│  │ Access Token        │   │ │
│  │  │ Acceptance      │  │ Event Emission   │  │ Issuance (NFT/VC)   │   │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘   │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Cryptographic Primitives

#### BN254 Curve Operations (CAP-0074)
```rust
// Host functions from Stellar Protocol 25
env.bn254_g1_add(point_a, point_b)?;
env.bn254_g1_mul(point, scalar)?;
env.bn254_multi_pairing_check(pairs)?; // e(A,B)·e(C,D)... = 1_GT
```

#### Poseidon Hash Configuration
| Parameter | Value | Purpose |
|-----------|-------|---------|
| Width (t) | 3 | State size |
| Rate | 2 | Elements per round |
| Inputs | secret + nullifier | Identity commitment |

### 3.3 Storage Strategy

| Storage Type | Use Case | TTL |
|--------------|----------|-----|
| Persistent | Merkle roots, contract state | Permanent |
| Temporary | Nullifier maps | 30 days |
| Instance | Configuration, admin keys | Contract lifetime |

---

## 4. x402 Protocol Integration

### 4.1 Payment Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           x402 PAYMENT FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │  Agent  │───►│ Proxy   │───►│  402    │───►│ Stellar │───►│  API    │  │
│  │ Request │    │ Check   │    │Response │    │ Payment │    │ Access  │  │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘  │
│       │              │              │              │              │        │
│       │         Authorization      │              │              │        │
│       │         Header Check       │              │              │        │
│       │              │              │              │              │        │
│       │         ┌────▼────┐        │              │              │        │
│       │         │ Missing │        │              │              │        │
│       │         │ x402    │────────┘              │              │        │
│       │         │ Token   │                       │              │        │
│       │         └─────────┘                       │              │        │
│       │                                           │              │        │
│       │    ◄──────────── 402 Response ────────────┘              │        │
│       │         x402-chain: stellar                              │        │
│       │         x402-amount: 5.0                                 │        │
│       │         x402-destination: G-VAULT                        │        │
│       │                                                          │        │
│       ▼                                                          │        │
│  ┌─────────┐                                                     │        │
│  │ Build   │────────────────────────────────────────────────────►│        │
│  │ Tx +    │                                                     │        │
│  │ Sign    │                                                     │        │
│  └─────────┘                                                     │        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 HTTP Headers Specification

| Header | Value | Description |
|--------|-------|-------------|
| x402-chain | stellar | Target blockchain |
| x402-token | USDC_CONTRACT_ID | Payment token |
| x402-amount | 5.0 | Required payment |
| x402-destination | G-NIRIUM-VAULT... | Recipient address |
| x402-memo | tx_hash | Transaction reference |

---

## 5. Security Architecture

### 5.1 Defense Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Layer 1: Input Validation                                                  │
│  ├── Vec<T> and Map<K,V> explicit validation                               │
│  ├── Host value injection prevention                                        │
│  └── Type boundary checks                                                   │
│                                                                             │
│  Layer 2: Fuzzing (cargo-fuzz)                                             │
│  ├── Random transaction bombardment                                         │
│  ├── Invariant: deposits >= withdrawals + balance                          │
│  ├── Invariant: nullifier uniqueness                                       │
│  └── Admin function access control                                          │
│                                                                             │
│  Layer 3: Formal Verification (Kani)                                        │
│  ├── Integer overflow/underflow proofs                                      │
│  ├── Elliptic curve arithmetic safety                                       │
│  └── State machine correctness                                              │
│                                                                             │
│  Layer 4: Panic Handling                                                    │
│  ├── panic_with_error! macro usage                                          │
│  ├── Controlled error propagation                                           │
│  └── Distinguishable logic vs crash errors                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Trust Assumptions

| Role | Permissions | Trust Level |
|------|-------------|-------------|
| Admin | Update verifier, pause contracts | HIGH |
| Facilitator | Submit fee-bump transactions | MEDIUM |
| User | Deposit, withdraw, vote | LOW |
| Agent | x402 payments, API access | LOW |

---

## 6. Directory Structure

```
nirium/
├── apps/
│   └── web/                          # Next.js 16 Application
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── dashboard/
│       │   ├── markets/
│       │   ├── governance/
│       │   └── lab/
│       ├── components/
│       │   ├── 3d/
│       │   │   ├── NeuralCanvas.tsx
│       │   │   ├── NeuralParticles.tsx
│       │   │   ├── GlassMaterial.tsx
│       │   │   └── shaders/
│       │   ├── ui/
│       │   │   ├── GlassNavbar.tsx
│       │   │   ├── GlassCard.tsx
│       │   │   └── ...
│       │   └── charts/
│       ├── lib/
│       │   ├── stellar/
│       │   │   └── StellarPaymentAdapter.ts
│       │   └── x402/
│       │       └── paymentClient.ts
│       └── proxy.ts
│
├── contracts/                         # Soroban Rust Contracts
│   ├── verifier/
│   │   ├── src/
│   │   │   └── lib.rs
│   │   └── Cargo.toml
│   ├── identity-pool/
│   │   ├── src/
│   │   │   └── lib.rs
│   │   └── Cargo.toml
│   ├── payment-gate/
│   │   ├── src/
│   │   │   └── lib.rs
│   │   └── Cargo.toml
│   └── Cargo.toml                    # Workspace manifest
│
├── tests/
│   ├── e2e/                          # Playwright tests
│   └── fuzz/                         # Cargo fuzz harnesses
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── SECURITY.md
│   └── API.md
│
├── Makefile
├── docker-compose.yml
└── README.md
```

---

## 7. Deployment Targets

| Environment | Network | Purpose |
|-------------|---------|---------|
| Development | Stellar Testnet | Local testing |
| Staging | Stellar Testnet | Integration testing |
| Production | Stellar Mainnet | Live deployment |

---

## 8. Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| WebGL Frame Rate | 60fps | Chrome DevTools |
| Contract Execution | < 100ms | Soroban Profiler |
| ZK Verification | < 200ms | Host function timing |

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-01  
**Author:** Nirium Team
