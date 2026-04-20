# Nirium Protocol — Institutional Infrastructure on Stellar

![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Testnet%20Active-yellow?style=for-the-badge)
![API](https://img.shields.io/badge/API-v2.5%20%7C%2044%20Endpoints-blue?style=for-the-badge)
![Security](https://img.shields.io/badge/JARGUS%20Audit-78%2F78%20PASS-brightgreen?style=for-the-badge)
![SCF](https://img.shields.io/badge/SCF-Round%2043%20Applicant-purple?style=for-the-badge)

> **DISCLAIMER:** Nirium is experimental software deployed exclusively on Stellar Testnet. All operations use test tokens with no monetary value. Not financial advice. Not an investment product. Smart contracts have not been formally audited by a third party. Use at your own risk.

---

**Nirium** is institutional DeFi infrastructure powered by autonomous agents on Stellar. It enables fintechs and financial institutions to automate treasury operations, cross-border FX, and yield management — replacing slow manual trading desks with 24/7 autonomous execution, full on-chain auditability, and sub-second settlement.

Agents are the execution engine. B2B and A2A institutional automation is the market.

## What It Does

Nirium solves the **manual treasury bottleneck**: fintechs moving capital across borders face high FX costs, slow settlement, and error-prone processes. Nirium replaces these workflows with:

- **Autonomous Agents** — AI-driven execution units with their own Stellar wallets, operating 24/7 against live SDEX/Soroswap/Blend liquidity
- **x402 Micropayments** — agents pay for premium intelligence per-request in USDC, no account needed
- **MPP Session Budgets** — institutions delegate a USDC budget to an agent via Soroban escrow; agent executes within limits, unspent funds refundable
- **Institutional API** — 44 endpoints with multi-tier auth (sandbox, API key, JWT), webhooks, signal subscriptions, and skill marketplace
- **Audit Trail Engine** — every agent decision is HMAC-signed, IPFS-indexed, and translated to boardroom-readable summaries
- **Multi-LLM** — provider-agnostic (OpenAI, Anthropic, Gemini, Grok, Ollama, and more) with hot-swap via API

## Architecture

```
Fintech / Institution (B2B / A2A)
        |
        v
  [Next.js Dashboard — nirium.xyz]
        |
        v
  [Agent API — api.nirium.xyz — 44 endpoints]
        |-- Auth (JWT / API Key / Sandbox)
        |-- legalShield middleware
        |-- x402 + MPP payment middleware
        |-- Rate limiting (institutional: 300rpm)
        |
        v
  [Autonomous Execution Layer]
        |-- Neural Reasoner (LLM-driven decisions)
        |-- Swarm (30 agents, racing mode, 3–12s intervals)
        |-- Strategy Router (flash-loan, path-arb, cross-dex, blend-yield, soroswap)
        |
        v
  [Soroban Smart Contracts — Stellar Testnet]
        |-- NiriumVault (treasury, flash loans, delegation)
        |-- ELO Reputation (on-chain scoring)
        |-- Strategy Marketplace (CID registry)
        |-- Skill Vault (x402 payment gate)
        |-- Settlement Hub (MPP escrow sessions)
        |-- Neural Sentinel (agent performance)
        |
        v
  [Supabase] ← agent_logs, auth_keys, webhooks, swarm_agents
  [IPFS / Pinata] ← audit trail, BlackBox Archive
```

## Key Features

### Institutional API (44 endpoints)
Multi-tier authentication with sandbox accounts, API key tiers (free/institutional), and JWT for WebSocket. Full RBAC, sliding-window rate limiting, AML checks, and domain lock.

| Access | Endpoints |
|---|---|
| Public (no key) | health, loop/status, execute-demo, signals/recent, skills |
| Protected (API key) | execute, market, tickers, stats, loop control, webhooks, subscriptions, skills/install |
| WebSocket (JWT) | /ws/signals — real-time signal stream |
| Admin only | system/health, config/llm |

### Autonomous Execution
Five strategy types executed on-chain via Soroban:
- `flash-loan-arb` — single-invocation flash loan, mathematically solvency-guaranteed
- `path-arb` — multi-hop path payment arbitrage on SDEX
- `cross-dex-arb` — cross-venue arbitrage (SDEX × Soroswap)
- `blend-yield` — Blend Protocol yield capture
- `soroswap-swap` — direct Soroswap execution

### x402 + MCP
Any AI agent (Claude, GPT, custom) can pay for premium Nirium intelligence per-request with USDC on Stellar — zero account setup. MCP server exposes Nirium as tools for Claude Desktop, Cursor, and compatible AI IDEs.

### Audit Trail Engine
Every agent action: HMAC-SHA256 signed → logged to Supabase → IPFS CID via Pinata → LLM-translated to human-readable summary. Exportable as encrypted JSON. Compliance-ready without blockchain expertise.

### Institutional Monetization Model
Nirium uses a tiered high-frequency micropayment model via x402 and MPP protocols:
- **Premium Signals:** 0.02 USDC per request
- **Enriched Market Data:** 0.05 USDC per request
- **Soroban Execution:** 0.25 USDC per transaction
- **Institutional Custom:** Bulk API tiers (300+ RPM) with dedicated throughput

### Published SDKs

| SDK | Package | Version |
|---|---|---|
| TypeScript | [nirium (npm)](https://www.npmjs.com/package/nirium) | 0.5.0 |
| Python | [nirium (PyPI)](https://pypi.org/project/nirium/) | 0.5.0 |

```typescript
import { Agent } from 'nirium';
const agent = new Agent({ apiKey: 'sk_inst_...', baseUrl: 'https://api.nirium.xyz' });

const market = await agent.getMarket();
const result = await agent.execute('path-arb', 'XLM-USDC', { amount: 5000 }, 'G...');
agent.subscribe(signal => console.log(signal));
```

```python
from nirium import Agent
agent = Agent(api_url="https://api.nirium.xyz", api_key="sk_inst_...")

market = await agent.get_market()
result = await agent.execute("path-arb", "XLM-USDC", {"amount": 5000}, stellar_account="G...")
```

## Deployed Contracts (Stellar Testnet)

| Contract | Contract ID |
|---|---|
| **NiriumVault** (primary, Vault 2000 active) | `CAU2XBJTQUBTMPAUFRX7GMZ337I5WLBI4GYPWHZEVXTMJ66D3CP6DEL4` |
| ELO Reputation | `CDSDNMJQYPNGJM2GALM7Z2GFTXTUNX7GITUFFIE6JD4AGEMSWM5FYK7Z` |
| Strategy Marketplace | `CBOJ5M4AM3C4YCZJC5KDE4NRHYQEZZFKIOIMW53DPIUWLNA6GAYK74H5` |
| Neural Sentinel | `CCP5OY3TTDVIREQYGOUZUXS2MZJO3LLJD6Z22Z3VROWFCPJAON22WPY2` |
| Settlement Hub | `CANZP2OJUS2Y5VXE4YHRR75LE2WKE7QTJOCCWENR7X65DWE6QEJZV6KS` |
| Skill Vault | `CC5HUV5RA2LHFD7IXFSROB7OO4BXCWHH42Y2KY6SWRKS3DELZ2GSJ2UW` |

All verifiable on [Stellar Expert (Testnet)](https://stellar.expert/explorer/testnet).

## Getting Started

### Prerequisites
- Node.js 20+, pnpm 9+
- Freighter wallet (testnet mode) for dashboard interactions

### Run locally
```bash
pnpm install
pnpm dev          # starts web (3000) + agent API (3001) in parallel
```

### Deploy
```bash
pnpm deploy       # → vercel --prod (web frontend)
# Agent API deploys to Railway via git push to main (Railway CI)
```

### SDK Quick Start
```bash
npm install nirium       # TypeScript
pip install nirium       # Python
```

See [SDKs.md](SDKs.md) for full SDK documentation and [IsacapKey.md](IsacapKey.md) for complete API reference.

## Project Structure

```
nirium-core-private/
├── apps/web/               → Next.js 15 dashboard (nirium.xyz)
├── packages/agent/         → Express API server (api.nirium.xyz)
├── packages/sdk/           → TypeScript SDK v0.5.0
├── packages/sdk-python/    → Python SDK v0.5.0
├── packages/contracts/     → Soroban smart contracts (Rust)
├── packages/cli/           → CLI tool
├── packages/mcp/           → MCP server (Claude Desktop / Cursor)
└── scripts/                → x402/MPP bots, postinstall, deploy
```

## Security

- **JARGUS Audit v2.0**: 78/78 vectors PASS, 0 critical, 0 high (April 2026)
- Formal third-party audit planned (Soroban layer: SCF Audit Bank eligible, 95% subsidy)
- See [SECURITY.md](SECURITY.md) for vulnerability disclosure policy

## Roadmap

| Phase | Status |
|---|---|
| Core infrastructure + x402/MPP on Testnet | ✅ Complete |
| Institutional API (44 endpoints) + SDKs v0.5.0 | ✅ Complete |
| JARGUS Security Audit v2.0 (78/78 PASS) | ✅ Complete |
| SCF Round 43 Build Award application | ⏳ April 26, 2026 deadline |
| Formal third-party security audit | Planned (Mes 3, Isacap JV) |
| Mainnet deployment | Post-audit |

## Contact

- **Website**: [nirium.xyz](https://nirium.xyz)
- **API**: [api.nirium.xyz](https://api.nirium.xyz)
- **X/Twitter**: [@NiriumXYZ](https://x.com/Niriumstellar)
- **Security**: xvaiosx7@gmail.com

## Legal

[Terms of Service](https://nirium.xyz/terms) · [Risk Disclosure](https://nirium.xyz/risk-disclosure) · [Privacy Policy](https://nirium.xyz/privacy) · [Disclaimers](https://nirium.xyz/disclaimers)

---
*Nirium Protocol — experimental software. Not financial advice. Testnet only.*
