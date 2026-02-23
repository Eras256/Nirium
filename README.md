# 🧠 Nirium: Autonomous Institutional Intelligence Protocol

<div align="center">
  <img src="https://img.shields.io/badge/Stellar-Network-7C3AED?style=for-the-badge&logo=stellar&color=black&labelColor=2DEBE8" alt="Stellar Network" />
  <img src="https://img.shields.io/badge/Soroban-Smart_Contracts-06B6D4?style=for-the-badge&logo=rust&color=black&labelColor=FFC800" alt="Soroban" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&color=black&labelColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/AI-Autonomous_Agents-blue?style=for-the-badge&logo=openai&color=black&labelColor=white" alt="AI Agents" />
</div>

> **"Finance is no longer a static ledger; it's a living, breathing field of data reacting in milliseconds."**
> Nirium is the premier gateway for deploying autonomous AI liquidity agents on the **Stellar Network**.

---

## 🌌 The Story: The Dawn of Sovereign AI
In the landscape of modern DeFi, capital is fast, autonomous, and increasingly driven by artificial intelligence. Traditional human-in-the-loop interfaces fail to capture the complexity and speed required for multi-hop arbitrage, flash loans, and high-frequency portfolio management. **Nirium** was built to bridge this gap.

We didn't just build a dashboard; we built an **Institutional Neural Matrix**. Nirium allows users to deploy advanced LLM-powered agents that read market conditions, execute Soroban smart contracts, and leverage Stellar's native atomic multi-operation transactions automatically. From harvesting funding rates on perpetuals to cross-chain spread capture—Nirium puts institutional-grade algorithmic trading in your hands.

---

## ⚡ Core Pillars

### 1. 🤖 Autonomous Agent Execution Layer
Forget manual trading. Nirium deploys persistent background workers (Loop Executors) that track dynamic market shifts.
- **Continuous Logic Loop**: Agents evaluate market ticks every 5 seconds.
- **AI Decision Engine**: Powered by deep neural networks evaluating sentiment, liquidity depth, and spreads.
- **Atomic Reliability**: Every trade request is grouped into Stellar's native multi-operation structures, guaranteeing that either the entire strategy executes, or everything reverts safely.

### 2. 🔐 Vaults & Secure Enclaves
Nirium incorporates security at the protocol level. Users deploy logic into isolated "Vaults".
- **Asset Separation**: Your XLM and USDC remain in your control within audited Soroban Vaults.
- **Failover Safequards**: The protocol implements Stop-Loss Guardians and Emergency Liquidators to protect collateral under extreme volatility.

### 3. 🧩 Strategy Builder & Action Marketplace
Built for the machine-to-machine era. Nirium supports a visual Matrix Builder.
- **Drag-and-Drop Architecture**: Connect triggers, deep analytics, and execution nodes without coding.
- **Community Skills**: Inject new abilities into your agent (like Telegram alerts, Discord Webhooks, or Pyth Oracle Snipers) via our one-click Skill Marketplace.

## 🟢 Live on Testnet (Deployed Contracts)

The core infrastructure of Nirium is fully functional and deployed on the **Stellar Testnet**:

- **[Sentinel (Treasury Hub)](https://stellar.expert/explorer/testnet/contract/CBMI6CTXJUEGBDCCPHZVH7VJPEBDWEOBUJDB2VJ3RVF4AHO2THKDQRB4)**: `CBMI6CTXJUEGBDCCPHZVH7VJPEBDWEOBUJDB2VJ3RVF4AHO2THKDQRB4` (The central liquidity manager and secure vault).
- **[Payment Gate (x402)](https://stellar.expert/explorer/testnet/contract/CCRZKETZFQA2UWNJMSXKOPS7QXRRBRW2J5Q32QQRQ6JHHEOLZWB5SWIH)**: `CCRZKETZFQA2UWNJMSXKOPS7QXRRBRW2J5Q32QQRQ6JHHEOLZWB5SWIH` (Manages subscriptions and monetizes API access).

*(Note: Ensure your Freighter wallet is connected to the Stellar Testnet to interact with these contracts).*

---

## 🛠️ Technology Stack

| Logic & Chains | AI & Backend Architecture | Frontend & Visuals |
|:---:|:---:|:---:|
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/rust/rust-original.svg" width="30" title="Rust"/> **Rust / Soroban** <br> For low-latency smart contracts and yield vaults. | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" width="30" title="Node.js"/> **Node.js (Agent Engine)** <br> Powers the continuous evaluation loop. | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original-wordmark.svg" width="40" title="Next.js"/> **Next.js 16** <br> The Neural Matrix Dashboard. |
| <img src="https://img.shields.io/badge/Stellar-Network-white?logo=stellar" height="25" title="Stellar"/> **Stellar Horizon** <br> Real-time blockchain indexing. | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" width="30" title="TypeScript"/> **TypeScript** <br> End-to-end type safety. | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" width="30" title="Tailwind"/> **Tailwind CSS** <br> Glassmorphism & Neon UI. |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" width="30" title="PostgreSQL"/> **Supabase** <br> High-availability metrics and persistence. | <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" width="30" title="LLM"/> **LLM Intelligence** <br> Natural language strategy compilation. | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/framermotion/framermotion-original.svg" width="30" title="Framer Motion"/> **Framer Motion** <br> Fluid UX micro-animations. |

---

## 🏗️ Project Architecture (Monorepo)

Nirium is structured as a scalable Turborepo workspace:

```
Nirium
├── 🎨 apps/
│   └── web/            # Main Next.js Dashboard (The Neural Matrix)
├── 🤖 packages/
│   ├── agent/          # Autonomous AI Executor Loop & Service Workers
│   ├── cli/            # Developer CLI for testing and terminal deployment
│   ├── contracts/      # Soroban Rust Contracts (Vaults, Routing, Enclaves)
│   └── sdk/            # TypeScript SDK interacting with Stellar & Soroban
└── 📜 docs/            # Protocol documentation and technical specs
```

---

## 🚀 Experience the Matrix

### 1. Prerequisites
Ensure you have the latest stable versions of:
- [Node.js (v20+)](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Rust & Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup)

### 2. Launching Locally
```bash
# Clone the repository
git clone https://github.com/Eras256/Nirium.git
cd Nirium

# Install Workspace Dependencies
pnpm install

# Build the SDK and Agent packages
pnpm build

# Launch the Application
pnpm dev
```

Visit `http://localhost:3000` to access the **Neural Console**. 
> *Tip: Ensure you have the [Freighter Wallet](https://www.freighter.app/) installed and set to Stellar Testnet to interact with deployments.*

---

## 👥 Meet the Architects

- **Vaiosx** — *Core Engineering, AI Systems & Smart Contracts*
- **M0nsxx** — *UX/UI Design & Neural Visuals*
- **Maux** — *Growth & Ecosystem Strategy*

---

<div align="center">
  <strong>Built with 🩵 and 💛 for the Stellar ecosystem. The future is autonomous. The future is Nirium.</strong>
</div>
