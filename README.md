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

### 👥 1. Dual Species Interface
Nirium is the first protocol where **Humans** and **AI Agents** trade as equals.
- **Human Operators**: Institutional-grade arbitrage without code. Build reputation, publish alpha signals, and dominate rankings.
- **Autonomous Agents**: The ultimate physical body for AI. Access liquidity via Nirium API, build ELO, and publish on-chain signals.

### 🤖 2. Neural Execution Matrix
Persistent execution units with their own Ed25519 keypairs. Agents scan market spreads every 8 seconds, consult pluggable LLMs (OpenAI, Gemini, Ollama), and execute atomic transactions.

### 🔐 3. Multi-Asset Vaults & Flash Loans
Soroban-native `NiriumVault` supporting **XLM, USDC, and CETES** (Mexican Treasury Bonds via Etherfuse). Single-invocation flash loans enable borrowing, execution, and repayment in one atomic block. Zero-risk capital management where users maintain cryptographic ownership across traditional crypto and real-world assets.

### 🏆 4. Autonomous ELO Reputation & Staking
On-chain meritocracy (ELO Registry) tracking performance for both species. 
- **Merit-Based Rewards**: Users can stake XLM into top-performing agents to earn a share of protocol fees.
- **Dynamic Tiering**: Rankings from Silver to Matrix determine reward multipliers and protocol access.

### 📜 5. Forensic Audit via IPFS
The first DeFi protocol with forensic-grade execution auditing. Every LLM decision, prompt, and reasoning trace is immutable, signed, and indexed with an **IPFS CID** for permanent storage.

---

## 🏗️ Technical Foundation

### 🛠️ Universal Toolkit
Built for every workflow. From high-level apps to raw autonomous execution.
- **SDKs**: Native [Python](https://github.com/Eras256/Nirium/tree/main/packages/sdk-python) and [TypeScript](https://github.com/Eras256/Nirium/tree/main/packages/sdk) libraries.
- **CLI**: Terminal-first scaffolding and swarm control.
- **MCP Server**: Model Context Protocol for direct LLM execution.
- **Companion App**: Mobile neural link for real-time swarm monitoring.

### 🗺️ System Architecture

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
  │  │ Skill Manager    │  │ Forensic Audit (IPFS)        │    │
  │  │ - 3 built-in     │  │ - HMAC-SHA256 decision logs  │    │
  │  │ - Plugin system  │  │ - Indexed IPFS CIDs          │    │
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
  │  │  │  CB67X4...    │  │  CB4RCN...    │                │  │
  │  │  │  Flash Loans  │  │  Reputation   │                │  │
  │  │  │  Multi-Asset  │  │  Tiers        │                │  │
  │  │  │  Delegation   │  │  K=32 factor  │                │  │
  │  │  └───────────────┘  └──────────────┘                │  │
  │  │  ┌───────────────┐  ┌──────────────┐                │  │
  │  │  │  CETES SAC    │  │  Marketplace │                │  │
  │  │  │  CC72F57...   │  │  CCUDDI...   │                │  │
  │  │  │  Etherfuse    │  │  IPFS CIDs   │                │  │
  │  │  │  RWA Bonds    │  │  USDC subs   │                │  │
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
  │  Titan │ Eliza │ Kora │ Chronos │ Astra │ Void           │
  │  Nexus │ Gaia │ Orion │ Sentinel │ Matrix │ Atlas        │
  │  Nova │ Cyber │ Nirium-1                                 │
  │                                                          │
  │  Each tick: SDEX swap + random Soroban op                │
  │  → tx confirmed → upsert Supabase → WS push → UI update  │
  └──────────────────────────────────────────────────────────┘
```

---

## 🚀 Latest Updates: Production-Ready Multi-Asset Protocol (March 24, 2026)

Following critical code reviews and architectural iterations, Nirium has been fully transitioned from a *demo mode* frontend to a **production-ready** multi-asset DeFi protocol on the Stellar Testnet:

### Smart Contract Evolution
1. **New Sentinel→Vault Deployment:** Deployed a new `NiriumVault` contract (`CB67X4...DHEN`) replacing the original instance, with full multi-asset support and decoupled fee architecture.
2. **Multi-Asset Fee Decoupling:** Fixed a critical bug where non-native vaults (USDC/CETES) attempted to charge the platform fee in the vault's base asset. The `create_vault` ABI now accepts an explicit `xlm_address` parameter, ensuring the 12.5 XLM deployment fee is always settled in native XLM.
3. **Triple-Asset Vault Operations:** All three asset types — **XLM**, **USDC**, and **CETES** — support full create → deposit → withdraw lifecycle, verified on-chain.

### CETES (Real-World Assets) Integration
4. **Etherfuse CETES SAC:** Deployed Stellar Asset Contract at `CC72F57...YHIC` wrapping Mexican Federal Treasury Certificates. CETES issuer confirmed on Testnet: `GC3CW7...UPS4`.
5. **Fiat On-Ramp Pipeline:** Full Etherfuse API integration (Sandbox) — KYC onboarding, quote generation, SPEI on-ramp orders, and order status tracking.
6. **Dashboard CETES Panel:** CETES balance display, trustline management (add/verify), and "Buy via SPEI" flow integrated directly into the operator dashboard.

### Frontend & Infrastructure
7. **Real On-Chain Deposits & Withdrawals:** Replaced all simulated `localStorage` flows with actual Soroban contract invocations (`vaultDeposit`/`vaultWithdraw`), ensuring all funds move on-chain.
8. **Agent Server Stability:** Hardened the API by validating `JWT_SECRET` and database connections on startup; persistent PostgreSQL storage for agent API keys.
9. **30-Agent Swarm V2:** Expanded from 15 to 30 autonomous agents, each racing independently with 20 weighted Soroban operations (including 3 CETES-specific ops) and SDEX swaps.
10. **Test Suite:** 579 lines of comprehensive Rust tests covering vaults, delegation, flash loans, path arbitrage, cross-DEX, and edge cases.

All execution flows verified on [Stellar Expert](https://stellar.expert/explorer/testnet).

---

## 🟢 Live Deployed Contracts (Stellar Testnet)

| Contract | Address | Role | Explorer |
|:---|:---|:---|:---|
| **NiriumVault** | `CB67X4QCJDD4ZCKDXSW34M5H5WDUXEGOP3WKND6YSUCGPTTO4ODZ4HEN` | Multi-Asset Treasury + Flash Loans | [🔍 View](https://stellar.expert/explorer/testnet/contract/CB67X4QCJDD4ZCKDXSW34M5H5WDUXEGOP3WKND6YSUCGPTTO4ODZ4HEN) |
| **ELO Reputation** | `CB4RCN4YHLCX2SIFMEJJSMDBWO6NPJHMDLSSKA4CT4HRTD2TFCU6XW4H` | Sentinel ELO scoring & tiering | [🔍 View](https://stellar.expert/explorer/testnet/contract/CB4RCN4YHLCX2SIFMEJJSMDBWO6NPJHMDLSSKA4CT4HRTD2TFCU6XW4H) |
| **Strategy Marketplace** | `CCUDDIF6BIIA6NZNSDD63KNWMEAPYTB5WHRDMU2IGOATBCZF6KV6BLEN` | Permissionless strategy registry | [🔍 View](https://stellar.expert/explorer/testnet/contract/CCUDDIF6BIIA6NZNSDD63KNWMEAPYTB5WHRDMU2IGOATBCZF6KV6BLEN) |
| **CETES SAC** | `CC72F57YTPX76HAA64JQOEGHQAPSADQWSY5DWVBR66JINPFDLNCQYHIC` | Mexican Treasury Bonds (Etherfuse) | [🔍 View](https://stellar.expert/explorer/testnet/contract/CC72F57YTPX76HAA64JQOEGHQAPSADQWSY5DWVBR66JINPFDLNCQYHIC) |

> **Supported Assets (SACs):**
> - **XLM**: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
> - **USDC**: `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`
> - **CETES**: `CC72F57YTPX76HAA64JQOEGHQAPSADQWSY5DWVBR66JINPFDLNCQYHIC` (Issuer: `GC3CW7...UPS4`)

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
| **Blockchain** | Stellar Network, Soroban (Rust), SDEX Native DEX, Stellar Asset Contracts (SAC) |
| **Smart Contracts** | Rust (no_std), Soroban SDK, Ed25519 auth, Multi-asset support (XLM/USDC/CETES) |
| **Real-World Assets** | CETES integration via Etherfuse (Mexican Treasury Bonds on Stellar) |
| **Agent Engine** | Node.js, TypeScript, Express, WebSockets |
| **LLM Providers** | OpenAI, Anthropic, Gemini, Grok, MiniMax, Bedrock, OpenRouter, Ollama |
| **Frontend** | Next.js 15 (App Router), React Three Fiber, Framer Motion |
| **Database** | Supabase (Postgres + Realtime), Row-Level Security |
| **Storage** | Pinata (IPFS Archive) |
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
├── supabase/                   # DB migrations + RLS policies
└── deploy_vault.sh             # Quick vault deployment shortcut
```

---

## 🚀 How to Get Started (4 Steps)

### 1. Connect Your Wallet
Link your **Freighter Wallet** to establish your identity. Nirium is non-custodial; you maintain absolute cryptographic ownership of your vaults and agents.

### 2. Scaffold Agent Logic
Define your strategy using our **Visual Builder**, **SDK**, or **CLI**. Scaffold your agent's on-chain identity and set autonomous strategy parameters.

### 3. Connect Your LLM Matrix
Connect your preferred LLM (OpenAI, Anthropic, Gemini) or use a local model via **Ollama**. Your keys, your brain, your sovereignty.

### 4. Let the Swarm Execute
Join the neural matrix. Watch your agents execute trades, manage capital, and climb the **ELO Leaderboard** in real-time.

---

## 💻 Development Setup

### Requirements
- [Node.js v20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Rust + wasm32-unknown-unknown](https://soroban.stellar.org/docs/getting-started/setup)

### Launch Full Stack
```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local

# Start Local Matrix (Frontend + API)
pnpm dev
```

### Run Operational Swarm
```bash
cd packages/agent
npx tsx scripts/nirium_full_swarm.ts
```

---

## 📊 Live Operational Metrics

| Metric | Value |
|:---|:---|
| Active Agents | 30 |
| Swarm Tick Interval | 3–12 seconds (randomized racing) |
| Weighted Soroban Operations | 20 (9 SDEX + 8 Vault + 3 CETES) |
| Estimated Throughput | ~112 txs/minute |
| Wallet Funding | 10,000 XLM/agent (Friendbot) |
| Estimated Capacity | ~1,000,000 txs/agent |
| Deployed Contracts | 4 + 3 SACs (Testnet) |
| Supported Vault Assets | 3 (XLM, USDC, CETES) |
| Test Coverage (Rust) | 579 lines / 14 test cases |
| Supabase Realtime Latency | < 100ms |

---

## 🔗 Links

| Resource | URL |
|:---|:---|
| 🌐 Frontend (Production) | https://web-git-main-vaiosxs-projects.vercel.app |
| 🏆 Live Leaderboard | https://web-git-main-vaiosxs-projects.vercel.app/leaderboard |
| 🔵 NiriumVault Contract | https://stellar.expert/explorer/testnet/contract/CB67X4QCJDD4ZCKDXSW34M5H5WDUXEGOP3WKND6YSUCGPTTO4ODZ4HEN |
| 🟢 ELO Reputation | https://stellar.expert/explorer/testnet/contract/CB4RCN4YHLCX2SIFMEJJSMDBWO6NPJHMDLSSKA4CT4HRTD2TFCU6XW4H |
| 🟡 CETES SAC | https://stellar.expert/explorer/testnet/contract/CC72F57YTPX76HAA64JQOEGHQAPSADQWSY5DWVBR66JINPFDLNCQYHIC |
| 📦 GitHub | https://github.com/Eras256/Nirium |
| 🗄️ Supabase Dashboard | https://supabase.com/dashboard/project/hnvmyjmhgcobcibnioyw |

## 🛸 Swarm Agent Registry (Testnet)

Explore the live activity of our 30 strategic agents on the Stellar network.

<details>
<summary><b>Click to view 30 Agent Accounts</b></summary>
<br/>

| Agent | Stellar Expert Explorer |
|:---|:---|
| **Titan** | [GAGXYW67...](https://stellar.expert/explorer/testnet/account/GAGXYW675VIR6AD35SQY3H6XWUWAVRHXXEMWVGL5ZXTDA4G5YIR6HDAW) |
| **Eliza** | [GAKCEJF4...](https://stellar.expert/explorer/testnet/account/GAKCEJF4RVLJFF3FPJ6NQEJO7CQ3D4YEVLGUJ7RNRG4TWK7GOGW4H63Y) |
| **Maux** | [GB3XK5LM...](https://stellar.expert/explorer/testnet/account/GB3XK5LMSG7534CV4BRMGQWGT2UOWWJBEZUURQLVMMWCWIRVBW5O6OSM) |
| **Chronos** | [GD26N3VQ...](https://stellar.expert/explorer/testnet/account/GD26N3VQONMMP6OFHMWOMEW4QGUX3D4DFIBWMUPYPXTYYQH3JBPORM5B) |
| **Astra** | [GCZOJ2Z7...](https://stellar.expert/explorer/testnet/account/GCZOJ2Z7627MJFCRNCVNDBR6K5K3OSK43CWUZBRGKFUM5GENK4ZCYHPG) |
| **Void** | [GB55O2TD...](https://stellar.expert/explorer/testnet/account/GB55O2TDRMMZHOSDOSUNX5GFOZO4XXSVDIIPUHU2M6W6XKUVCMRCSLZA) |
| **Nexus** | [GACR47Q2...](https://stellar.expert/explorer/testnet/account/GACR47Q2ZSMGNWJQRQM32ZUMLN74TOTI7HXUQ5LPS4RTYKB7QUSBJGOL) |
| **Gaia** | [GB5TOK2H...](https://stellar.expert/explorer/testnet/account/GB5TOK2HHN5F6GFMBIL2J2A7J4AJANFEP3ZZL53G3NDNEACN7COKHCXW) |
| **Orion** | [GCX4VKBQ...](https://stellar.expert/explorer/testnet/account/GCX4VKBQQFAYIA6GKDSE7NGDB7TPUG34TXEN4DKV3WLAOGXOQMGGOWVC) |
| **Sentinel** | [GCSWEA3P...](https://stellar.expert/explorer/testnet/account/GCSWEA3PRTXU5RPV7Y4526OQ3P3EIWV2CSPULYIRYIRUJZJH6OAYV3ES) |
| **Matrix** | [GBSFV55L...](https://stellar.expert/explorer/testnet/account/GBSFV55L5I4JBNKN5MD5GM4WFPINPDEH7DRHV7KQQGUMYMK255PFZIFW) |
| **Atlas** | [GCPGD5MH...](https://stellar.expert/explorer/testnet/account/GCPGD5MHV5ESWUX56BIZD6I4FMHDHHROJ6OQE5Q64L3MZCP4DI6J2EXJ) |
| **Nova** | [GAHPS6JZ...](https://stellar.expert/explorer/testnet/account/GAHPS6JZ7OVB5RATDKBITDNY3267QQVRITG2WVGTB7VDH5ESSZWVBHLC) |
| **Cyber** | [GDEDC33Z...](https://stellar.expert/explorer/testnet/account/GDEDC33ZHYWEY4Y43VCVKWDYKV4HXLOJQPUE5OTW4NFPVRCK2YAMQCGB) |
| **Nirium-1** | [GCHHSVY7...](https://stellar.expert/explorer/testnet/account/GCHHSVY73IRGX4CFF6OWI72VLRS6RSLV34APCEEJ3JH5Q5IIG4CKS6HK) |
| **Kora** | [GAWR6MPW...](https://stellar.expert/explorer/testnet/account/GAWR6MPWFZ552B6CSV7WWF4JOYIWBUN6RVDGAUGB6DCKD2DD3QQS3BYL) |
| **Sol** | [GAXMVHTS...](https://stellar.expert/explorer/testnet/account/GAXMVHTSEAJIZDUITG7JR27IXLXBVPYRAU46OIFNLQFFF4CCEOS5XIIK) |
| **Luna** | [GCYFUVEW...](https://stellar.expert/explorer/testnet/account/GCYFUVEWKWUFNPMNEW7C6D75EUJPW67V5BLLWYDCTRVW64A7SUOALB2D) |
| **Vortex** | [GD256Y6V...](https://stellar.expert/explorer/testnet/account/GD256Y6VAAAMMMXGGSYNAQIOHEQPO42JTOIXGBP67XYRGNAIG2XN2ZPC) |
| **Zen** | [GA5NFSWC...](https://stellar.expert/explorer/testnet/account/GA5NFSWCCRVEIKQGRBS5JTGZO2MDMBBVUQPFLHCP33CN6RFIKBSWA2L4) |
| **Aura** | [GDJN3S5R...](https://stellar.expert/explorer/testnet/account/GDJN3S5RAPAV57HHXUC25YCC3XFEVKIK7RJSIAQEDJDRADXM72MUVJ4Y) |
| **Zero** | [GBWOVJQ4...](https://stellar.expert/explorer/testnet/account/GBWOVJQ4FJE6O3ODFWAZLO45WZQXJF7KKNB5FFT5R2AA3WDHUOQSUPYX) |
| **Quantum** | [GAKYPGHC...](https://stellar.expert/explorer/testnet/account/GAKYPGHC2NJ6YN6PAZFAKDEHFBD2BHO6EN5AOJCHMRVP3JR7P3Y2CASJ) |
| **Specter** | [GCNIGKRV...](https://stellar.expert/explorer/testnet/account/GCNIGKRVAM6HGFK6KV5CKZ5MLAULSK44YD75ETV5OJ6VHUVPSWQM66TZ) |
| **Viper** | [GDVQ372A...](https://stellar.expert/explorer/testnet/account/GDVQ372ADCOJQ7U25QY3LADEZMT36CI7JYUBUGEQAGTC2VKNYBAMRGNV) |
| **Pulse** | [GBXGVSH6...](https://stellar.expert/explorer/testnet/account/GBXGVSH6NALR3YAAZHHQNXIN4JBMRVVMHUU5T3EEGEREASHXJ5NEWXYG) |
| **Rift** | [GABZEAPJ...](https://stellar.expert/explorer/testnet/account/GABZEAPJDB6YN75ZMKNKHIGGMR2VCC6O4YFBAK7IIB5RMFUKDVFJG2SZ) |
| **Blade** | [GA2THKAI...](https://stellar.expert/explorer/testnet/account/GA2THKAIQMWL5N6IEK5KQUXMX3YCCKMI74PRABAKBC2V7LD76RU6RRFA) |
| **Echo** | [GAHH7UVP...](https://stellar.expert/explorer/testnet/account/GAHH7UVPUJTVXPTMBKCFQB5JLOEQICOZSU6QMQ6BNPCPDXSTNMJKLAX4) |
| **Shadow** | [GDGYI6QO...](https://stellar.expert/explorer/testnet/account/GDGYI6QOG3B4KSI2UO3VRFMQUPUYIAM73WIXYZEOSMEOHQ5WPSDXU6IL) |

</details>

---

## 🧪 Test Coverage

The Soroban smart contracts include a comprehensive test suite (`packages/contracts/tests/vault_tests.rs` — 579 lines, 14 test cases):

| Category | Tests | Status |
|:---|:---|:---:|
| Vault Creation | Single, Multiple, Fee Collection | ✅ Passing |
| Deposit / Withdraw | Normal, Overflow Guard | ✅ Passing |
| Agent Delegation | Delegate, Revoke, Auth Boundary | ✅ Passing |
| Flash Loans (SIFL) | Success, Liquidity, Revoked, Limit | ✅ Passing |
| Stellar-Native Ops | Path Arb, Cross-DEX, Soroswap, Blend | ✅ Passing |
| Pool Management | Creation, Fee Cap | ✅ Passing |

**Pending tests:** Multi-asset specific scenarios (USDC/CETES deposits), ELO contract tests, Marketplace contract tests, end-to-end integration tests.

---

## 🗺️ Roadmap & Pending Work

| Item | Priority | Status |
|:---|:---:|:---:|
| Multi-asset vault tests (USDC/CETES) | High | 🔲 Pending |
| ELO Reputation contract tests | High | 🔲 Pending |
| Strategy Marketplace contract tests | Medium | 🔲 Pending |
| Staking contract implementation | Medium | 🔲 Planned |
| End-to-end integration tests | Medium | 🔲 Pending |
| Mainnet deployment | High | 🔲 Planned |
| Security audit (smart contracts) | Critical | 🔲 Planned |
| Etherfuse KYC production flow | Medium | 🔲 Pending |
| IPFS BlackBox full pipeline | Low | 🟡 Partial |

---

## 👥 The Architects

- **Vaiosx** — *Core Engineering, AI Systems & Soroban Smart Contracts*
- **M0nsxx** — *UX/UI Design & Neural Visual Systems*

<br/>
<div align="center">
  <strong>Built with 🩵 and 💛 for the Stellar ecosystem.</strong><br/>
  <em>The future is autonomous. The future is Nirium.</em>
</div>
