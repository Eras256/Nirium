# 🧠 Nirium Protocol: The Sovereign AI Matrix

<div align="center">
  <img src="https://img.shields.io/badge/Stellar-Network-7C3AED?style=for-the-badge&logo=stellar&color=black&labelColor=2DEBE8" alt="Stellar Network" />
  <img src="https://img.shields.io/badge/Soroban-Smart_Contracts-06B6D4?style=for-the-badge&logo=rust&color=black&labelColor=FFC800" alt="Soroban" />
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&color=black&labelColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/AI-Autonomous_Agents-blue?style=for-the-badge&logo=openai&color=black&labelColor=white" alt="AI Agents" />
</div>

> **"Finance is no longer a static ledger; it's a living, breathing field of data reacting in milliseconds."**

Nirium is an institutional-grade, fully functional autonomous AI liquidity agent protocol built natively on the **Stellar Network** using **Soroban** smart contracts and real-time Horizon indexing.

---

## 🌌 The Vision: 100% On-Chain, 100% Real
Nirium bridges the gap between AI-driven intelligence and decentralized finance. Unlike traditional dashboards or simulated bots, Nirium operates a continuous, live node.js agent loop that directly parses Horizon REST APIs, constructs valid XDR transactions, and executes dry-runs or live submits through a dynamically configured Neural Provider (OpenAI, Anthropic, Gemini, Grok, MiniMax, Bedrock, or local Ollama).

---

## ⚡ Core Pillars

### 1. 🤖 The Autonomous Agent Execution Layer
Forget manual trading. Nirium deploys persistent background workers tracking dynamic market shifts.
- **Continuous Logic Loop**: Connects directly to Stellar Horizon. Fetches live XLM prices, SDEX spreads, Base Fees, and Soroswap pool depths.
- **Neural Sovereignty**: 9 unique AI Providers supported. Bring Your Own Key (BYOK) architecture or connect to a local `Ollama` node for total privacy.
- **Live Strategy Routing**: The agent maps signals (like `path-arbitrage`, `cross-dex`, or `blend-yield`) directly to actual deployed Soroban smart contract operations and polls for decentralized confirmation.

### 2. 🔐 Immutable Vaults & Decentralized Audits
Capital execution requires cryptographic truth.
- **Soroban Smart Contracts**: Rust contracts deployed on Stellar Testnet manage treasury yields and routing. 
- **IPFS Audit Trail (Walrus/Pinata)**: Every autonomous execution, whether it reverts or profits, is meticulously logged, hashed with HMAC-SHA256, and permanently pinned to IPFS.
- **RLS Row-Level Security**: The entire UI infrastructure leverages a unified `nirium_protocol_records` table on Supabase secured down to the row level.

### 3. 🧩 The Full-Stack Ecosystem
Nirium goes far beyond a web application. It includes a complete suite of developer tooling.
- **TypeScript SDK (`@nirium/sdk`)**: A 100% typed wrapper that streams real-time WebSocket signals from the agent logic right to your frontend.
- **Python SDK (`nirium-sdk`)**: A quantitative client built for algo-traders, fully synced with the API. 
- **MCP Server (`@nirium/mcp`)**: Model Context Protocol integration. Control the entire autonomous loop, audit skills, or dry-run transactions straight from your IDE or local LLM.
- **CLI Bootstrapper (`@nirium/cli`)**: Scaffold your own customized autonomous bots instantly.
- **Tauri Desktop Engine**: Wrap the entire matrix into a lightweight native desktop container.

---

## 🟢 Live on Testnet (Deployed Infrastructure)

The core infrastructure of Nirium is fully functional and deployed on the **Stellar Testnet** with 15 autonomous agents generating continuous dual-layer traffic:

| Contract | Role | Address | Explorer |
|:---|:---|:---|:---|
| **NiriumVault** | Treasury core + Flash Loans | `CDHDX63NUYSFCIPJTTS46N5PYLTI7J5WIAIOP7TZSPBNUTLI32AY7GA2` | [View](https://stellar.expert/explorer/testnet/contract/CDHDX63NUYSFCIPJTTS46N5PYLTI7J5WIAIOP7TZSPBNUTLI32AY7GA2) |
| **Sentinel (ELO)** | Agent reputation scoring | `CATYFAFL7QCBKSK3OSVNWA4O2VXWOADJ6IPNLCT2INXHP24OIUHZOUEK` | [View](https://stellar.expert/explorer/testnet/contract/CATYFAFL7QCBKSK3OSVNWA4O2VXWOADJ6IPNLCT2INXHP24OIUHZOUEK) |
| **ELO Registry** | On-chain ELO ledger | `CCDTPOOGRUOTQZPDGSCA2EJGMZHWYD4FMHAINXXSE5VFM6T2FXSPV7BA` | [View](https://stellar.expert/explorer/testnet/contract/CCDTPOOGRUOTQZPDGSCA2EJGMZHWYD4FMHAINXXSE5VFM6T2FXSPV7BA) |
| **Strategy Marketplace** | Buy/sell trading strategies | `CCAFXJOVJW7JH4JVDCEBACVHIW764MKFZNWMH63UARUJLHDKWAIVXAPP` | [View](https://stellar.expert/explorer/testnet/contract/CCAFXJOVJW7JH4JVDCEBACVHIW764MKFZNWMH63UARUJLHDKWAIVXAPP) |

*(Requirement: Freighter wallet correctly connected to Stellar Testnet).*

---

## 💰 Transaction Cost Analysis (10,000 XLM per Agent)

Each agent wallet is funded with **10,000 XLM** via Stellar Friendbot. Here's the cost breakdown by operation type:

| Operation Type | Cost per Tx | Capacity (10k XLM) |
|:---|:---:|---:|
| SDEX Swap (base fee) | ~0.00001 XLM | ~1,000,000,000 txs |
| Soroban contract call | ~0.005 XLM | ~2,000,000 txs |
| Vault deposit/withdraw | ~0.01 XLM | ~1,000,000 txs |
| Flash Loan (atomic) | ~0.02 XLM | ~500,000 txs |
| Arbitrage (multi-op) | ~0.015 XLM | ~666,000 txs |

> **At 1 tx/second with mixed Soroban+SDEX ops (~0.01 XLM avg): ~11.5 days continuous operation per agent before refund needed.**

---

## 🛠️ Technology Stack

| Infrastructure | Execution & Control | Interface & Audits |
|:---:|:---:|:---:|
| <img src="https://img.shields.io/badge/Stellar-Network-white?logo=stellar" height="25" title="Stellar"/> **Stellar Horizon API** <br> Real-time chain data indexing. | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/rust/rust-original.svg" width="30" title="Rust"/> **Rust / Soroban** <br> Fast, deterministic smart contracts. | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original-wordmark.svg" width="40" title="Next.js"/> **Next.js 15 (App Router)** <br> The Neural Matrix Dashboard. |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" width="30" title="Node.js"/> **Node.js (Agent Engine)** <br> Deep market scanner & WebSocket host. | <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" width="30" title="LLM"/> **Multi-LLM Matrix** <br> OpenAI, Gemini, Grok, MiniMax, Local. | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" width="30" title="Tailwind"/> **Tailwind CSS** <br> Glassmorphism & Neon UI. |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" width="30" title="PostgreSQL"/> **Supabase SQL** <br> Monolithic unified `protocol_records`. | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" width="30" title="Python"/> **Python & TS SDKs** <br> Official quantitative wrappers. | <img src="https://upload.wikimedia.org/wikipedia/commons/1/18/Ipfs-logo-1024-ice-text.png" height="25" title="IPFS"/> **Pinata / IPFS** <br> Immutable agent trade logging. |

---

## 🏗️ Monorepo Architecture

Nirium's matrix is strictly typed and built to scale using `pnpm` workspaces:

```text
Nirium
├── apps/
│   └── web/            # Next.js 15 frontend, i18n, & GUI
├── packages/
│   ├── agent/          # The Autonomous Express API, WebSockets, Loop, and executor
│   ├── cli/            # Developer CLI to bootstrap standalone bots (`npx @nirium/cli new`)
│   ├── contracts/      # Verified Rust/Soroban Smart Contracts 
│   ├── sdk/            # Official TypeScript SDK
│   ├── sdk-python/     # Official Python Quantitative SDK
│   ├── desktop/        # Tauri native application wrapper
│   └── mcp/            # Model Context Protocol integration (11+ tools)
```

---

## 🚀 Experience the Matrix

### 1. Requirements
Ensure you have the latest stable versions of:
- [Node.js (v20+)](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Rust & target wasm32-unknown-unknown](https://soroban.stellar.org/docs/getting-started/setup)

### 2. Ignite Locally
```bash
# Clone the repository
git clone https://github.com/Eras256/Nirium.git
cd Nirium

# Install Workspace Dependencies
pnpm install

# Initialize your .env.local variables
# You can define OPENAI_API_KEY, PINATA_API_KEY, SUPABASE_URL, etc.
cp .env.example .env.local

# Launch the Application (Spins up both the Agent Backend and the Next.js Frontend)
pnpm dev
```

Visit `http://localhost:3000` to boot up the **Neural Console** and monitor the Agent operations simultaneously on `http://localhost:3001`.

---

## 👥 The Architects

- **Vaiosx** — *Core Engineering, AI Systems & Smart Contracts*
- **M0nsxx** — *UX/UI Design & Neural Visuals*
- **Maux** — *Growth & Ecosystem Strategy*

<br>
<div align="center">
  <strong>Built with 🩵 and 💛 for the Stellar ecosystem. The future is autonomous. The future is Nirium.</strong>
</div>
