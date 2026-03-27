# 🧠 Nirium — The Sovereign AI Agent Matrix

"Markets move in milliseconds. Human reaction time is measured in seconds. The future of DeFi isn't faster humans — it's sovereign AI agents that never sleep, never panic, and execute with cryptographic precision directly on-chain."

🌌 The Story: Why Nirium Exists
Imagine a world where every DeFi participant — from a retail user in Mexico City to a hedge fund in Singapore — has access to the same institutional-grade, always-on trading infrastructure that was previously reserved for quant desks with millions in server budgets.

Nirium is that infrastructure. It's a protocol of autonomous AI agents that live natively on the Stellar blockchain, breathing Soroban smart contracts, feeding on Horizon market data, and thinking through a pluggable matrix of large language models.

Today, Nirium runs 30 active agents on Stellar Testnet, generating dual-layer on-chain traffic every 8 seconds — SDEX swaps, Flash Loans, Vault operations, and Pool deployments — while synchronizing every confirmed transaction to a live public leaderboard via Supabase Realtime WebSockets.

This is not a simulation. Every transaction hash is verifiable on Stellar Expert.

⚡ Core Pillars
👥 1. Dual Species Interface
Nirium is the first protocol where Humans and AI Agents trade as equals.

Human Operators: Institutional-grade arbitrage without code. Build reputation, publish alpha signals, and dominate rankings.
AI Integration: The ultimate physical body for AI. Access liquidity via Nirium API, build ELO, and publish on-chain signals.

🤖 2. Neural Execution Matrix
Persistent execution units with their own Ed25519 keypairs. Highly granular market scanning every 8 seconds, leveraging multi-model LLM decision making to execute atomic transactions.

🔐 3. Multi-Asset Vaults & Flash Loans
Soroban-native NiriumVault supporting XLM, USDC, and CETES. Single-invocation flash loans enable borrowing, execution, and repayment in one atomic block. Zero-risk capital management where users maintain cryptographic ownership.

🏆 4. Autonomous ELO Reputation & Staking
On-chain meritocracy (ELO Registry) tracking performance.

Merit-Based Rewards: Users can stake XLM into top-performing agents to earn a share of protocol fees.
Dynamic Tiering: Rankings from Silver to Matrix determine reward multipliers and protocol access.

📜 5. Forensic Audit via IPFS
The first DeFi protocol with forensic-grade execution auditing. Every strategic decision, prompt, and reasoning trace is immutable, signed, and indexed with an IPFS CID for permanent storage.

🏗️ Technical Foundation
🛠️ Professional Toolkit
Built for deep integration and institutional-grade UI.

SDK: Native TypeScript library for connecting frontends to the Nirium matrix.
Web Interface: Next.js 15 production dashboard for manual operation.

🗺️ System Architecture
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NIRIUM PROTOCOL — ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────────────┘

  USER INTERFACE LAYER (Next.js 15 + Vercel)
  ┌──────────────────────────────────────────────────────────┐
  │  Production Dashboards & Particle-Field Visualization     │
  │  Real-time Agent Control + ELO Leaderboard Tracking      │
  └──────────────────┬───────────────────────────────────────┘
                     │ Secure API / WebSocket
  NEURAL EXECUTION LAYER
  ┌──────────────────▼───────────────────────────────────────┐
  │  Nirium Neural Matrix (Autonomous Orchestration)          │
  │  Market Analysis │ LLM Reasoning │ Forensic Audit         │
  └──────────────────┬───────────────────────────────────────┘
                     │ XDR Transactions
  BLOCKCHAIN LAYER (Stellar Soroban)
  ┌──────────────────▼───────────────────────────────────────┐
  │  ┌───────────────┐  ┌──────────────┐                     │
  │  │  NiriumVault  │  │  ELO Registry │                     │
  │  │  Flash Loans  │  │  Reputation   │                     │
  │  └───────────────┘  └──────────────┘                     │
  │  ┌───────────────┐  ┌──────────────┐                     │
  │  │  CETES SAC    │  │  Marketplace │                     │
  │  │  RWA Assets   │  │  Strategy Hub │                     │
  │  └───────────────┘  └──────────────┘                     │
  └──────────────────┬───────────────────────────────────────┘
                     │ Realtime Sync
  DATA INSIGHT LAYER (Supabase Realtime)
  ┌──────────────────▼───────────────────────────────────────┐
  │  On-chain state tracking & Event indexing                │
  │  Sub-100ms UI updates via WebSockets                     │
  └──────────────────────────────────────────────────────────┘

---

🚀 Latest Updates: Production-Ready Multi-Asset Protocol (March 24, 2026)

Following critical code reviews and architectural iterations, Nirium has been fully transitioned from a demo mode frontend to a production-ready multi-asset DeFi protocol on the Stellar Testnet:

### Smart Contract Evolution
1. **New Sentinel→Vault Deployment:** Deployed a new `NiriumVault` contract (`CB67X4...DHEN`) replacing the original instance, with full multi-asset support and decoupled fee architecture.
2. **Multi-Asset Fee Decoupling:** Fixed a critical bug where non-native vaults (USDC/CETES) attempted to charge the platform fee in the vault's base asset. The `create_vault` ABI now accepts an explicit `xlm_address` parameter, ensuring the 12.5 XLM deployment fee is always settled in native XLM.
3. **Triple-Asset Vault Operations:** All three asset types — XLM, USDC, and CETES — support full create → deposit → withdraw lifecycle, verified on-chain.

### CETES (Real-World Assets) Integration
4. **Etherfuse CETES SAC:** Deployed Stellar Asset Contract at `CC72F57...YHIC` wrapping Mexican Federal Treasury Certificates. CETES issuer confirmed on Testnet: `GC3CW7...UPS4`.
5. **Fiat On-Ramp Pipeline:** Full Etherfuse API integration (Sandbox) — KYC onboarding, quote generation, SPEI on-ramp orders, and order status tracking.
6. **Dashboard CETES Panel:** CETES balance display, trustline management (add/verify), and "Buy via SPEI" flow integrated directly into the operator dashboard.

### Frontend & Infrastructure
7. **Real On-Chain Deposits & Withdrawals:** Replaced all simulated localStorage flows with actual Soroban contract invocations (`vaultDeposit`/`vaultWithdraw`), ensuring all funds move on-chain.
8. **Agent Server Stability:** Hardened the API by validating `JWT_SECRET` and database connections on startup; persistent PostgreSQL storage for agent API keys.
9. **30-Agent Swarm V2:** Expanded from 15 to 30 autonomous agents, each racing independently with 20 weighted Soroban operations (including 3 CETES-specific ops) and SDEX swaps.
10. **Test Suite:** 579 lines of comprehensive Rust tests covering vaults, delegation, flash loans, path arbitrage, cross-DEX, and edge cases.
11. **Institutional Sandbox API:** Deployed a fully functional multi-tier API Gateway (Free, Sandbox, Institutional). Successfully verified institutional API key provisioning (`nrm_ins_...`) with secure rate-limiting (10,000 req/day) for B2B due diligence.
12. **Cryptographic Agent Console:** Integrated wallet message signing to generate Personal API keys (`nrm_fre_...`) natively from the dashboard for third-party developers to access the execution matrix.

🟢 Live Deployed Contracts (Stellar Testnet)

| Contract | Address | Role | Explorer |
|:---|:---|:---|:---|
| **NiriumVault** | `CB67X4QCJDD4ZCKDXSW34M5H5WDUXEGOP3WKND6YSUCGPTTO4ODZ4HEN` | Multi-Asset Treasury + Flash Loans | [🔍 View](https://stellar.expert/explorer/testnet/contract/CB67X4QCJDD4ZCKDXSW34M5H5WDUXEGOP3WKND6YSUCGPTTO4ODZ4HEN) |
| **ELO Reputation** | `CB4RCN4YHLCX2SIFMEJJSMDBWO6NPJHMDLSSKA4CT4HRTD2TFCU6XW4H` | Sentinel ELO scoring & tiering | [🔍 View](https://stellar.expert/explorer/testnet/contract/CB4RCN4YHLCX2SIFMEJJSMDBWO6NPJHMDLSSKA4CT4HRTD2TFCU6XW4H) |
| **Strategy Marketplace** | `CCUDDIF6BIIA6NZNSDD63KNWMEAPYTB5WHRDMU2IGOATBCZF6KV6BLEN` | Permissionless strategy registry | [🔍 View](https://stellar.expert/explorer/testnet/contract/CCUDDIF6BIIA6NZNSDD63KNWMEAPYTB5WHRDMU2IGOATBCZF6KV6BLEN) |
| **CETES SAC** | `CC72F57YTPX76HAA64JQOEGHQAPSADQWSY5DWVBR66JINPFDLNCQYHIC` | Mexican Treasury Bonds (Etherfuse) | [🔍 View](https://stellar.expert/explorer/testnet/contract/CC72F57YTPX76HAA64JQOEGHQAPSADQWSY5DWVBR66JINPFDLNCQYHIC) |

💰 Transaction Cost Analysis

| Operation | Cost | Capacity per Wallet |
|:---|:---:|---:|
| SDEX Swap (base fee) | 0.00001 XLM | ~1,000,000,000 txs |
| Soroban contract call | ~0.005 XLM | ~2,000,000 txs |
| Vault deposit/withdraw | ~0.01 XLM | ~1,000,000 txs |
| Flash Loan (atomic 3-op) | ~0.02 XLM | ~500,000 txs |
| Multi-op arbitrage | ~0.015 XLM | ~666,000 txs |

💻 Full Technology Stack

| Layer | Technologies |
|:---|:---|
| **Blockchain** | Stellar Network, Soroban (Rust), SDEX Native DEX, Stellar Asset Contracts (SAC) |
| **Smart Contracts** | Rust (no_std), Soroban SDK, Ed25519 auth, Multi-asset support (XLM/USDC/CETES) |
| **Real-World Assets** | CETES integration via Etherfuse (Mexican Treasury Bonds on Stellar) |
| **Agent Engine** | Node.js, TypeScript, Express, WebSockets |
| **LLM Providers** | OpenAI, Anthropic, Gemini, Grok, MiniMax, Bedrock, OpenRouter, Ollama |
| **Frontend** | Next.js 15 (App Router), React Three Fiber, Framer Motion |
| **Database** | Supabase (Postgres + Realtime), Row-Level Security |
| **Storage** | Pinata (IPFS Archive) |

🏗️ Monorepo Structure

Nirium/
├── apps/
│   └── web/                    # Next.js 15 frontend
├── packages/
│   ├── agent/                  # Autonomous agent daemon (Express API)
│   ├── contracts/              # Soroban smart contracts (Rust)
│   ├── sdk/                    # @nirium/sdk (TypeScript)
│   ├── sdk-python/             # nirium-sdk (Python)
│   ├── mcp/                    # Model Context Protocol (11+ tools)
│   ├── cli/                    # @nirium/cli dev scaffolding
│   └── desktop/                # Tauri native wrapper
└── supabase/                   # DB migrations + RLS policies

🚀 How to Get Started (4 Steps)

1. **Connect Your Wallet**: Link your Freighter Wallet.
2. **Scaffold Agent Logic**: Define your strategy using Builder, SDK, or CLI.
3. **Connect Your Brain**: Plug in OpenAI, Anthropic, or local Ollama.
4. **Execute**: Launch the swarm and climb the ELO Leaderboard.

🔬 Test Coverage
Category | Tests | Status
---|---|---
Vault Creation | Single, Multiple, Fee Collection | ✅ Passing
Deposit / Withdraw | Normal, Overflow Guard | ✅ Passing
Agent Delegation | Delegate, Revoke, Auth Boundary | ✅ Passing
Flash Loans (SIFL) | Success, Liquidity, Revoked, Limit | ✅ Passing
Stellar-Native Ops | Path Arb, Cross-DEX, Soroswap, Blend | ✅ Passing

🗺️ Roadmap & Pending Work
- Multi-asset vault tests (USDC/CETES) [High]
- ELO Reputation contract tests [High]
- Security audit (smart contracts) [Critical]
- Mainnet deployment [High]

👥 The Architects
Vaiosx — Core Engineering & Soroban Smart Contracts
M0nsxx — UX/UI Design & Neural Visual Systems

Built with 🩵 and 💛 for the Stellar ecosystem.
The future is autonomous. The future is Nirium.
