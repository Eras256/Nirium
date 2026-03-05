# 🧠 Nirium — The Sovereign AI Agent Matrix

<div align="center">
  <img src="https://img.shields.io/badge/Stellar-Testnet-2DEBE8?style=for-the-badge&logo=stellar&labelColor=0a0a0a" />
  <img src="https://img.shields.io/badge/Soroban-Smart_Contracts-FFC800?style=for-the-badge&logo=rust&labelColor=0a0a0a" />
  <img src="https://img.shields.io/badge/15_Agents-LIVE-00ff88?style=for-the-badge&labelColor=0a0a0a" />
  <img src="https://img.shields.io/badge/Next.js-15-white?style=for-the-badge&logo=nextdotjs&labelColor=0a0a0a" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&labelColor=0a0a0a" />
</div>

<br/>

> *"Markets move in milliseconds. Human reaction time is measured in seconds. The future of DeFi isn't faster humans — it's sovereign AI agents that never sleep, never panic, and execute with cryptographic precision directly on-chain."*

---

## 🌌 The Story: Why Nirium Exists

Imagine a world where every DeFi participant — from a retail user in Mexico City to a hedge fund in Singapore — has access to the same institutional-grade, always-on trading infrastructure that was previously reserved for quant desks with millions in server budgets.

**Nirium is that infrastructure.** It's a protocol of autonomous AI agents that live natively on the **Stellar blockchain**, breathing Soroban smart contracts, feeding on Horizon market data, and thinking through a pluggable matrix of large language models.

Today, Nirium runs **15 active agents** on Stellar Testnet, generating dual-layer on-chain traffic every 8 seconds — SDEX swaps, Flash Loans, Vault operations, and Pool deployments — while synchronizing every confirmed transaction to a live public leaderboard via **Supabase Realtime WebSockets**.

This is not a simulation. Every transaction hash is verifiable on [Stellar Expert](https://stellar.expert/explorer/testnet).

---

## ⚡ Core Pillars

### 🤖 1. Autonomous Agent Execution
Each Nirium agent is a persistent Node.js process with its own Ed25519 keypair on Stellar. It:
- Scans XLM price, SDEX spreads, and Blend APY every 8 seconds via Horizon REST API
- Consults an LLM provider (OpenAI / Gemini / Grok / MiniMax / Ollama) for qualitative signal analysis
- Constructs XDR-encoded transactions and submits them directly to the Stellar network
- Stores execution logs, hashed with HMAC-SHA256, permanently to IPFS via Pinata

### 🔐 2. Non-Custodial Vaults with Flash Loans
The `NiriumVault` Soroban contract implements:
- **Non-custodial capital management**: users maintain cryptographic ownership via `require_auth()`
- **Single-Invocation Flash Loans**: borrow + execute + repay in one atomic tx. If repayment fails → entire transaction reverts, zero risk
- **Agent Delegation**: vault owners grant specific agents bounded execution rights with hard capital limits
- **Protocol Treasury**: 0.3% fee on flash loans accumulates on-chain

### 🏆 3. On-Chain ELO Reputation
Inspired by chess ranking, Nirium's `ELO Registry` contract tracks every agent's performance:
- Starting ELO: 1200 (Unranked)
- Silver tier: ≥ 1000 ELO
- Gold tier: ≥ 1500 ELO  
- Matrix tier: ≥ 2000 ELO (elite only)
- K-factor: 32 (aggressive ranking movement on high-volume events)

### 🛒 4. Strategy Marketplace
A permissionless on-chain registry where:
- Creators publish strategies with IPFS CID (pointing to algorithm/parameters)
- Users subscribe and pay USDC subscription fees on-chain
- **99% goes to creator / 1% goes to protocol treasury**
- Strategy's ELO score mirrors creator's reputation

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NIRIUM PROTOCOL — FULL STACK                         │
└─────────────────────────────────────────────────────────────────────────────┘

  USER INTERFACE LAYER
  ┌──────────────────────────────────────────────────────────┐
  │  Next.js 15 (App Router) — Vercel Production             │
  │                                                          │
  │  /             Landing + Neural Particle Field           │
  │  /dashboard    Real-time agent control panel             │
  │  /leaderboard  Live ELO rankings (Supabase Realtime WS)  │
  │  /strategies   Browse & subscribe to strategies          │
  │  /marketplace  On-chain strategy marketplace             │
  │  /docs         Technical documentation                   │
  │  /analytics    On-chain performance charts               │
  └──────────────────┬───────────────────────────────────────┘
                     │ WebSocket + REST
  AGENT DAEMON LAYER │
  ┌──────────────────▼───────────────────────────────────────┐
  │  packages/agent (Express + WebSocket — Port 3001)         │
  │                                                           │
  │  ┌─────────────────┐  ┌──────────────────────────────┐   │
  │  │ Autonomous Loop  │  │ Subscription Service         │   │
  │  │ - Market Scanner │  │ - WebSocket broadcasts       │   │
  │  │ - Signal Engine  │  │ - JWT Auth + API Keys        │   │
  │  │ - LLM Decision   │  │ - Rate Limiting              │   │
  │  └────────┬─────────┘  └──────────────────────────────┘   │
  │           │                                                │
  │  ┌────────▼──────────────────────────────────────────┐    │
  │  │  Neural Provider Matrix (10 LLM Providers)         │    │
  │  │  OpenAI │ Anthropic │ Gemini │ Grok │ MiniMax      │    │
  │  │  Bedrock │ OpenRouter │ Ollama (local/private)     │    │
  │  └────────────────────────────────────────────────────┘    │
  │                                                            │
  │  ┌──────────────────┐  ┌─────────────────────────────┐    │
  │  │ Skill Manager    │  │ IPFS Archive (Pinata)        │    │
  │  │ - 3 built-in     │  │ - HMAC-SHA256 audit logs     │    │
  │  │ - Plugin system  │  │ - Permanent tx history       │    │
  │  └──────────────────┘  └─────────────────────────────┘    │
  └──────────────────┬────────────────────────────────────────┘
                     │ XDR Transactions via Stellar SDK
  BLOCKCHAIN LAYER   │
  ┌──────────────────▼───────────────────────────────────────┐
  │  Stellar Network (Testnet)                                │
  │                                                           │
  │  ┌─────────────────────────────────────────────────────┐  │
  │  │ Soroban Smart Contracts (Rust)                       │  │
  │  │                                                      │  │
  │  │  ┌───────────────┐  ┌──────────────┐                │  │
  │  │  │  NiriumVault  │  │  ELO Registry │                │  │
  │  │  │  CDHDX63...   │  │  CCDTPO...    │                │  │
  │  │  │  Flash Loans  │  │  Reputation   │                │  │
  │  │  │  Vaults       │  │  Tiers        │                │  │
  │  │  │  Delegation   │  │  K=32 factor  │                │  │
  │  │  └───────────────┘  └──────────────┘                │  │
  │  │  ┌───────────────┐  ┌──────────────┐                │  │
  │  │  │ Sentinel ELO  │  │  Marketplace │                │  │
  │  │  │  CATYFAFL...  │  │  CCAFXJO...  │                │  │
  │  │  │  Score Calc   │  │  IPFS CIDs   │                │  │
  │  │  │  Win/Loss     │  │  USDC subs   │                │  │
  │  │  └───────────────┘  └──────────────┘                │  │
  │  └─────────────────────────────────────────────────────┘  │
  │                                                           │
  │  ┌─────────────────────────────────────────────────────┐  │
  │  │  SDEX — Native DEX (Stellar Protocol Level)          │  │
  │  │  Pair: XLM/USDC │ 15 agents │ manageSellOffer        │  │
  │  └─────────────────────────────────────────────────────┘  │
  └──────────────────┬───────────────────────────────────────┘
                     │ Horizon REST + Soroban RPC
  DATA SYNC LAYER    │
  ┌──────────────────▼───────────────────────────────────────┐
  │  Supabase (Postgres + Realtime)                           │
  │                                                           │
  │  nirium_swarm_agents table                                │
  │  ├── id, wallet_address, total_txs, soroban_txs          │
  │  ├── sdex_txs, total_volume, elo_onchain                  │
  │  ├── pools_created, vaults_created, flash_loans           │
  │  └── last_tx_hash, last_activity                          │
  │                                                           │
  │  Realtime WebSocket → Frontend Leaderboard (< 100ms)      │
  └──────────────────────────────────────────────────────────┘

  DEVELOPER TOOLING
  ┌──────────────────────────────────────────────────────────┐
  │  @nirium/sdk (TypeScript)   │  nirium-sdk (Python)       │
  │  @nirium/mcp (11+ tools)    │  @nirium/cli (scaffolding)  │
  │  Tauri Desktop wrapper      │  Docker Compose             │
  └──────────────────────────────────────────────────────────┘

  SWARM ORCHESTRATOR (nirium_full_swarm.ts)
  ┌──────────────────────────────────────────────────────────┐
  │  15 Agents running in parallel (every 8 seconds):        │
  │                                                          │
  │  Titan │ Eliza │ Maux │ Chronos │ Astra │ Void           │
  │  Nexus │ Gaia │ Orion │ Sentinel │ Matrix │ Atlas        │
  │  Nova │ Cyber │ Nirium-1                                 │
  │                                                          │
  │  Each tick: SDEX swap + random Soroban op                │
  │  → tx confirmed → upsert Supabase → WS push → UI update  │
  └──────────────────────────────────────────────────────────┘
```

---

## 🟢 Live Deployed Contracts (Stellar Testnet)

| Contract | Address | Role | Explorer |
|:---|:---|:---|:---|
| **NiriumVault** | `CDHDX63NUYSFCIPJTTS46N5PYLTI7J5WIAIOP7TZSPBNUTLI32AY7GA2` | Treasury + Flash Loans | [🔍 View](https://stellar.expert/explorer/testnet/contract/CDHDX63NUYSFCIPJTTS46N5PYLTI7J5WIAIOP7TZSPBNUTLI32AY7GA2) |
| **Sentinel ELO** | `CATYFAFL7QCBKSK3OSVNWA4O2VXWOADJ6IPNLCT2INXHP24OIUHZOUEK` | Agent reputation scoring | [🔍 View](https://stellar.expert/explorer/testnet/contract/CATYFAFL7QCBKSK3OSVNWA4O2VXWOADJ6IPNLCT2INXHP24OIUHZOUEK) |
| **ELO Registry** | `CCDTPOOGRUOTQZPDGSCA2EJGMZHWYD4FMHAINXXSE5VFM6T2FXSPV7BA` | On-chain ELO ledger | [🔍 View](https://stellar.expert/explorer/testnet/contract/CCDTPOOGRUOTQZPDGSCA2EJGMZHWYD4FMHAINXXSE5VFM6T2FXSPV7BA) |
| **Strategy Marketplace** | `CCAFXJOVJW7JH4JVDCEBACVHIW764MKFZNWMH63UARUJLHDKWAIVXAPP` | Buy/sell strategies | [🔍 View](https://stellar.expert/explorer/testnet/contract/CCAFXJOVJW7JH4JVDCEBACVHIW764MKFZNWMH63UARUJLHDKWAIVXAPP) |

---

## 💰 Transaction Cost Analysis

Each agent wallet is funded with **10,000 XLM** via Stellar Friendbot.

| Operation | Cost | Capacity per Wallet |
|:---|:---:|---:|
| SDEX Swap (base fee) | 0.00001 XLM | ~1,000,000,000 txs |
| Soroban contract call | ~0.005 XLM | ~2,000,000 txs |
| Vault deposit/withdraw | ~0.01 XLM | ~1,000,000 txs |
| Flash Loan (atomic 3-op) | ~0.02 XLM | ~500,000 txs |
| Multi-op arbitrage | ~0.015 XLM | ~666,000 txs |

> At 1 tx/second with mixed operations (~0.01 XLM avg): **~11.5 days continuous per agent** before refund needed.

---

## 🛠️ Full Technology Stack

| Layer | Technologies |
|:---|:---|
| **Blockchain** | Stellar Network, Soroban (Rust), SDEX Native DEX |
| **Smart Contracts** | Rust (no_std), Soroban SDK, Ed25519 auth |
| **Agent Engine** | Node.js, TypeScript, Express, WebSockets |
| **LLM Providers** | OpenAI, Anthropic, Gemini, Grok, MiniMax, Bedrock, OpenRouter, Ollama |
| **Frontend** | Next.js 15 (App Router), React Three Fiber, Framer Motion |
| **Database** | Supabase (Postgres + Realtime), Row-Level Security |
| **Storage** | Pinata (IPFS), Walrus/Stellar Bridge |
| **DevTools** | TypeScript SDK, Python SDK, MCP Server (11+ tools), CLI, Tauri Desktop |
| **Infra** | Docker Compose, pnpm workspaces, Vercel, GitHub Actions CI |

---

## 🏗️ Monorepo Structure

```
Nirium/
├── apps/
│   └── web/                    # Next.js 15 frontend (15 routes)
│       ├── app/dashboard/      # Agent control panel
│       ├── app/leaderboard/    # Live ELO rankings
│       ├── app/strategies/     # Strategy browser
│       ├── app/marketplace/    # On-chain marketplace
│       └── app/docs/           # Technical documentation
├── packages/
│   ├── agent/                  # Autonomous agent daemon (Express API)
│   │   ├── src/services/       # autonomousLoop, webhooks, IPFS, skills
│   │   ├── src/providers/      # Stellar + 10 LLM providers
│   │   ├── src/execution/      # Strategy execution router
│   │   ├── src/middleware/     # JWT auth, rate limits
│   │   └── scripts/            # nirium_full_swarm.ts, indexer
│   ├── contracts/              # Soroban smart contracts (Rust)
│   │   ├── src/nirium_vault.rs      # Core vault + flash loans (735 lines)
│   │   ├── src/elo_reputation.rs    # ELO system (173 lines)
│   │   ├── src/strategy_marketplace.rs  # Marketplace (196 lines)
│   │   └── src/agent_auth.rs        # Delegation auth
│   ├── sdk/                    # @nirium/sdk (TypeScript)
│   ├── sdk-python/             # nirium-sdk (Python)
│   ├── mcp/                    # Model Context Protocol (11+ tools)
│   ├── cli/                    # @nirium/cli dev scaffolding
│   └── desktop/                # Tauri native wrapper
└── supabase/                   # DB migrations + RLS policies
```

---

## 🚀 Quick Start

### Requirements
- [Node.js v20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Rust + wasm32-unknown-unknown](https://soroban.stellar.org/docs/getting-started/setup)

### Launch Locally
```bash
# Clone
git clone https://github.com/Eras256/Nirium.git
cd Nirium

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Add: SUPABASE_URL, SUPABASE_ANON_KEY, STELLAR_SECRET_KEY, etc.

# Start the full stack (Frontend + Agent Daemon)
pnpm dev
# → Frontend: http://localhost:3000
# → Agent API: http://localhost:3001
```

### Run the Swarm
```bash
cd packages/agent
npx tsx scripts/nirium_full_swarm.ts
# All 15 agents activate, generate on-chain traffic, sync to Supabase
# Monitor: tail -f /tmp/swarm.log
```

---

## 📊 Live Operational Metrics

| Metric | Value |
|:---|:---|
| Active Agents | 15 |
| Swarm Tick Interval | 8 seconds |
| Estimated Throughput | ~112 txs/minute |
| Wallet Funding | 10,000 XLM/agent (Friendbot) |
| Estimated Capacity | ~1,000,000 txs/agent |
| Deployed Contracts | 4 (Testnet) |
| Supabase Realtime Latency | < 100ms |

---

## 🔗 Links

| Resource | URL |
|:---|:---|
| 🌐 Frontend (Production) | https://web-git-main-vaiosxs-projects.vercel.app |
| 🏆 Live Leaderboard | https://web-git-main-vaiosxs-projects.vercel.app/leaderboard |
| 🔵 NiriumVault Contract | https://stellar.expert/explorer/testnet/contract/CDHDX63NUYSFCIPJTTS46N5PYLTI7J5WIAIOP7TZSPBNUTLI32AY7GA2 |
| 📦 GitHub | https://github.com/Eras256/Nirium |
| 🗄️ Supabase Dashboard | https://supabase.com/dashboard/project/hnvmyjmhgcobcibnioyw |

---

## 👥 The Architects

- **Vaiosx** — *Core Engineering, AI Systems & Soroban Smart Contracts*
- **M0nsxx** — *UX/UI Design & Neural Visual Systems*
- **Maux** — *Growth, Ecosystem Strategy & Economic Design*

<br/>
<div align="center">
  <strong>Built with 🩵 and 💛 for the Stellar ecosystem.</strong><br/>
  <em>The future is autonomous. The future is Nirium.</em>
</div>
