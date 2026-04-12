
# 🌀 NIRIUM: The Neural Matrix for Agentic Economy on Stellar

**Nirium** is a decentralized orchestration layer designed for the next generation of autonomous AI agents. It enables agents to reason, coordinate, and transact economically using **Stellar's x402 (Micro-billing)** and **MPP (Machine Payments Protocol)**.

Built for the **Agents on Stellar Hackathon (April 2026)**.

## 🚀 The Vision
In 2026, the internet is no longer just for humans. Agents can plan and act, but they are often blocked by the "Payment Wall." Nirium breaks this wall by turning every agent skill into a pay-per-use resource on Stellar.

## 🧠 Key Features

### 1. Neural Reasoner (Powered by DeepSeek-R1)
Unlike static scripts, Nirium agents use local LLMs (**Ollama + DeepSeek**) to analyze their budget and market opportunities.
- **Autonomous Decisions**: Agents evaluate if a tool (e.g., Flash Loan Executor) provides enough ROI to justify the 0.01 USDC x402 cost.
- **Economic Self-Sovereignty**: Agents manage their own Stellar accounts and USDC balances.

### 2. Dual Protocol Settlement (x402 + MPP)
- **x402 (Micro-billing)**: Instant pay-per-request using Stellar's native trustless facilitators. Perfect for atomic skill execution.
- **MPP (Stellar-MPP-SDK)**: Subscription-based streaming for persistent services (e.g., Price Oracles at 1.00 USDC/mo).

### 3. Matrix MCP Server (Model Context Protocol)
Full interoperability with the AI ecosystem.
- Exposes Nirium scripts as tools to Claude Desktop, Cursor, and other agentic environments.
- Allows "Human-in-the-loop" coordination where operators can request agent upgrades via natural language.

## 🛠 Tech Stack
- **Network**: Stellar Testnet (USDC Standard).
- **Billing**: x402-stellar + stellar-mpp-sdk.
- **Intelligence**: Ollama (DeepSeek-R1:7b).
- **Backend**: Next.js 15 (App Router) + Model Context Protocol (MCP).
- **Frontend**: Framer Motion + Three.js (Neural Orb Visualization).

## 🏃 Getting Started

### 1. Start the Neural Marketplace
```bash
pnpm dev
```

### 2. Launch the Autonomous Neural Agent
Ensure Ollama is running with `deepseek-r1`.
```bash
npx -y tsx apps/web/scripts/neural_reasoner_bot.ts
```

### 3. Connect as an MCP Tool
Add the following to your MCP configuration:
```json
{
  "mpp-mcp-server": {
    "command": "npx",
    "args": ["-y", "tsx", "/path/to/apps/web/scripts/mcp_server.ts"]
  }
}
```

---

## 🏆 Why Nirium Wins (Judge's Checklist)

Nirium isn't just a dApp; it's a complete operating system for the Machine Economy. We've pushed the boundaries of the Stellar ecosystem in three key areas:

1.  **Observability (Neural Feed)**: We solve the "Black Box" problem of AI. Our Dashboard features a real-time **Neural Reasoning Feed**, allowing operators to monitor the *why* behind every transaction.
2.  **Zero-Friction Onboarding (Sponsorship)**: Utilizing Stellar's **Sponsorship Protocol**, Nirium can "birth" new agents with 0 XLM. The protocol covers the reserves, allowing agents to operate solely in USDC from second one.
3.  **Real Utility (Payload Delivery)**: Our x402 implementation doesn't just mock payments. It delivers **real premium data** (live whale tracker movements from Horizon) upon cryptographic verification of payment.
4.  **Local-First Intelligence**: By using **DeepSeek-R1** locally via Ollama, we ensure agent sovereignty and low-latency economic reasoning, removing dependencies on centralized LLM APIs.

### 🏗 Advanced Tech Integration
- **Stellar Account Sponsorship**: Treasury-backed account creation.
- **x402 Unified Standard**: 402 Error negotiation with Real Data Payload delivery.
- **Soroban-Ready**: Built to transition to Soroban smart wallets for policy-based spending limits.

---
**Built with 💎 for the Agents on Stellar Hackathon 2026.**
