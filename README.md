# Nirium

> 🧠 **Sovereign Decentralized Infrastructure** where Neural UI meets Zero-Knowledge Privacy on Stellar Protocol 25

[![Stellar Protocol 25](https://img.shields.io/badge/Stellar-Protocol%2025-7C3AED?style=flat-square)](https://stellar.org)
[![Built with Soroban](https://img.shields.io/badge/Built%20with-Soroban-06B6D4?style=flat-square)](https://soroban.stellar.org)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?style=flat-square)](https://nextjs.org)

## 🌟 Overview

Nirium is a next-generation decentralized application that merges an immersive **Neural UI** (50,000 WebGL particles with cursor-attractor physics) with **institutional-grade ZK-SNARK privacy** on the Stellar blockchain.

### Key Features

- **Neural Interface**: GPU-accelerated particle system with simplex noise for organic movement and F=k/r² cursor attractor physics
- **ZK-SNARK Privacy**: Groth16 verification using BN254 curve with Protocol 25's native precompiles  
- **x402 Payments**: AI agents pay for compute autonomously via HTTP 402 payment protocol
- **Glassmorphism UI**: Physically accurate glass materials (transmission: 1.0, thickness: 3.5, chromatic aberration: 0.06)

## 🏗️ Architecture

```
Nirium
├── apps/web/                 # Next.js 16 Frontend
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/
│   │   │   ├── 3d/           # React Three Fiber components
│   │   │   ├── charts/       # Visualization components
│   │   │   └── ui/           # Glass UI component library
│   │   ├── lib/
│   │   │   ├── stellar/      # Stellar SDK integration
│   │   │   └── x402/         # x402 payment protocol
│   │   └── stores/           # Zustand state management
│   └── package.json
│
├── contracts/                # Soroban Rust Contracts
│   ├── verifier/             # ZK-SNARK Groth16 verifier
│   ├── identity-pool/        # Merkle tree identity management
│   └── payment-gate/         # x402 payment processing
│
├── tests/                    # E2E & Integration tests
├── docs/                     # Documentation
└── ARCHITECTURE.md           # Master architecture document
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (LTS)
- Rust 1.74+ with `wasm32-unknown-unknown` target
- Stellar CLI (optional for contract deployment)

### Frontend Development

```bash
# Install dependencies
cd apps/web
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Contract Development

```bash
# Build all contracts
cd contracts
cargo build --release --target wasm32-unknown-unknown

# Run contract tests
cargo test
```

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with Neural Canvas and hero section |
| `/dashboard` | Control panel with TVL charts, wallet balances, x402 channel status |
| `/markets` | 3D volumetric order book, swap interface for XLM/USDC/AQUA |
| `/governance` | Quadratic voting with 3D proposal orbs, ZK identity verification |
| `/lab` | x402 development console with Monaco editor and transaction debugging |

## 🎨 Design System

### Colors

- **Primary**: `#00f3ff` (Electric Cyan)
- **Secondary**: `#9d4edd` (Deep Violet)
- **Background**: `#0b0c15` (Neural Dark)
- **Accent**: `#1a0a2e` (Neural Purple)

### Glass Materials (React Three Fiber)

```tsx
<MeshTransmissionMaterial
  transmission={1.0}
  thickness={3.5}
  roughness={0.15}
  chromaticAberration={0.06}
  anisotropy={0.5}
  distortion={0.2}
/>
```

## 🔐 Security

- **ZK-SNARKs**: Identity verification without revealing personal data
- **Poseidon Hash**: ZK-friendly hashing for Merkle trees
- **Nullifier Registry**: Prevents double-spending with TTL storage
- **Formal Verification**: Kani annotations for critical contract functions

## 🪐 Deployed Contracts (Testnet)

| Contract | Function | Contract ID | Explorer |
|----------|----------|-------------|----------|
| **Verifier** | Zero-Knowledge (Groth16) Proof Verification | `CATHHUZHDRULWMYSOA7OCDQWBB7DDGJ6AWNMIWKR6FIUQZMIISUJ54ZA` | [View](https://stellar.expert/explorer/testnet/contract/CATHHUZHDRULWMYSOA7OCDQWBB7DDGJ6AWNMIWKR6FIUQZMIISUJ54ZA) |
| **Identity Pool** | Merkle Tree & Privacy Mixer | `CCUCUIT6S4ZK3WL7Q5UYBI4KDMYDSGMQOTAC4K5AHUQI4HTCSLVJTYZY` | [View](https://stellar.expert/explorer/testnet/contract/CCUCUIT6S4ZK3WL7Q5UYBI4KDMYDSGMQOTAC4K5AHUQI4HTCSLVJTYZY) |
| **Payment Gate** | x402 Machine-to-Machine Payments | `CDYZGBO7GEDCGQ7TZ3TCQ3PKXKCSNYTJK4CZFALT5I5YU6XNNDLOY2LC` | [View](https://stellar.expert/explorer/testnet/contract/CDYZGBO7GEDCGQ7TZ3TCQ3PKXKCSNYTJK4CZFALT5I5YU6XNNDLOY2LC) |

## 📄 Smart Contracts

### Verifier Contract

Verifies Groth16 ZK-SNARK proofs using Protocol 25's BN254 curve precompiles.

```rust
pub fn verify(
    env: Env,
    proof: Groth16Proof,
    public_inputs: Vec<BytesN<32>>,
) -> Result<bool, VerifierError>
```

### Identity Pool Contract

Manages user commitments in a Merkle tree with Poseidon hashing.

```rust
pub fn deposit(env: Env, from: Address, commitment: Hash) -> Result<u32, PoolError>
pub fn withdraw(env: Env, proof: BytesN<256>, root: Hash, nullifier_hash: Hash, recipient: Address) -> Result<(), PoolError>
```

### Payment Gate Contract

Processes x402 payments and issues access tokens for API authorization.

```rust
pub fn pay(env: Env, payer: Address, amount: i128, memo: String) -> Result<BytesN<32>, GateError>
pub fn verify_access(env: Env, token_id: BytesN<32>) -> Result<AccessToken, GateError>
```

## 🤝 x402 Payment Protocol

AI agents can autonomously pay for API access:

```typescript
// Agent receives 402 response
if (response.status === 402) {
  const headers = parseX402Headers(response);
  const txHash = await stellarAdapter.pay({
    destination: headers.destination,
    amount: headers.amount,
    asset: headers.token,
  });
  
  // Retry with payment proof
  const retryResponse = await fetch(url, {
    headers: { 'Authorization': `x402 ${txHash}` }
  });
}
```

## 📈 Performance

- **25,000 particles** rendered at 60fps with GPU instancing
- **<2.5s finality** on Stellar testnet
- **Sub-100ms** glass material rendering with LOD system
- **Zero server-side 3D** - all visualization client-side only

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [Stellar Development Foundation](https://stellar.org) for Protocol 25
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) for the WebGL abstraction
- [Drei](https://github.com/pmndrs/drei) for the transmission materials

---

**Built with 💜 for the Stellar ecosystem**
