# Nirium Protocol — Institutional Infrastructure on Stellar

![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Testnet%20Active-yellow?style=for-the-badge)
![API](https://img.shields.io/badge/API-v2.5%20%7C%2044%20Endpoints-blue?style=for-the-badge)
![Security](https://img.shields.io/badge/JARGUS%20Audit-83%2F83%20PASS-brightgreen?style=for-the-badge)
![SCF](https://img.shields.io/badge/SCF%2043-Panel%20Review-blueviolet?style=for-the-badge)
![SCF7](https://img.shields.io/badge/SCF%207.0-Aligned-purple?style=for-the-badge)
![x402](https://img.shields.io/badge/x402-In%20Production-teal?style=for-the-badge)
![MPP](https://img.shields.io/badge/MPP-In%20Production-teal?style=for-the-badge)
![CoC](https://img.shields.io/badge/Stellar%20CoC-Aligned%20Apr%2026%202026-green?style=for-the-badge)
![SCF](https://img.shields.io/badge/SCF-Kickstart%20Active-success?style=for-the-badge)

---

> **⚠️ MANDATORY LEGAL DISCLAIMER (SCF 7.0 — Updated April 26, 2026)**
>
> Nirium is **experimental software** deployed **exclusively on Stellar Testnet**. All operations use **test tokens with no real monetary value**. Smart contracts have not been formally audited by an independent third party (audit planned for Month 3, post-funding).
>
> **Nirium is not financial advice. It is not an investment product. It does not guarantee yields, dividends, asset appreciation, or returns of any kind.** Reference rate data displayed on the dashboard (Blend APY, Etherfuse CETES) represents **public protocol information only** — not projections or promises of return. XLM and Stellar assets are volatile. Use at your own risk.
>
> This project does not use SCF funds for speculation, trading, investment advice, or marketing of products promising interest or appreciation, in accordance with the [SCF 7.0 Official Rules](https://stellar.gitbook.io/scf-handbook/scf-awards/official-rules-for-submissions).

---

**Nirium** is an institutional treasury automation infrastructure powered by autonomous agents on Stellar/Soroban. It enables fintechs and financial institutions to automate treasury operations, cross-border FX, and cash-flow management — replacing slow manual trading desks with 24/7 autonomous execution, full on-chain auditability, and settlement in seconds.

We shipped **x402** in production on April 2, 2026 — the same day the Linux Foundation launched the x402 Foundation (contributing Coinbase's protocol). We shipped **MPP** on April 3, 2026 — within 16 days of Stripe and Tempo publishing the Machine Payment Protocol (March 18, 2026). We were tracking both specifications as they emerged and built the implementation immediately.

**Execution Nodes are the execution engine. Institutional B2B and A2A automation is the market.**

---

## What It Does

Nirium solves the **manual treasury bottleneck**: fintechs moving cross-border capital face high FX costs, slow settlement, and error-prone processes. Nirium replaces these workflows with:

- **Execution Nodes** — software units with their own Stellar wallets, operating 24/7 against live liquidity on SDEX, Soroswap, and Blend Protocol
- **x402 Micropayments** — agents pay for premium intelligence per-request in USDC on Stellar, no account or subscription required
- **MPP Session Budgets** — Optimized for **passive funding** (fondeos pasivos) and **mass payroll execution** (pagos de nómina masivos). Institutions delegate a USDC budget to an agent via Soroban escrow; the agent executes within limits, unused funds are refundable
- **Institutional API** — 44 endpoints with multi-tier auth (sandbox, API key, JWT), webhooks, real-time signal subscriptions, and a skill marketplace
- **Protocol Archive** — every agent decision is HMAC-SHA256 signed, immutably recorded, and translated into human-readable compliance summaries — no blockchain expertise required
- **Multi-LLM** — provider-agnostic (OpenAI, Anthropic, Gemini, Grok, Ollama, and more) with hot-swap via API, no redeployment needed
- **Etherfuse CETES** — MXN → tokenized CETES → USDC corridor via SPEI on testnet (displayed rate is a protocol reference only, not a guaranteed return)
- **MCP Server** — exposes Nirium as 12 tools for Claude Desktop, Cursor, and any MCP-compatible IDE

---

## Architecture

```
Fintech / Institution (B2B / A2A)
        |
        v
  [Next.js 15 Dashboard — nirium.xyz]
  [i18n: EN / ES / ZH — 25 routes]
        |
        v
  [Agent API — api.nirium.xyz — 44 endpoints]
        |-- Auth (JWT / API Key / Sandbox tiers)
        |-- legalShield middleware (SCF CoC compliance)
        |-- x402 + MPP payment middleware
        |-- Sliding-window rate limiting (300 rpm institutional)
        |-- AML screening + domainLock + obfuscation
        |
        v
  [Autonomous Execution Layer]
        |-- Institutional Execution Nodes (multi-LLM decisions)
        |-- Execution Cluster (30 nodes, racing mode, 3–12s intervals)
        |-- Strategy Router (flash-loan, path-arb, cross-dex, blend, soroswap)
        |
        v
  [Soroban Smart Contracts — Stellar Testnet]
        |-- NiriumVault      (non-custodial treasury, flash loans, 2-of-3 delegation)
        |-- Protocol Reputation (on-chain agent scoring)
        |-- Strategy Marketplace (strategy registry, CID)
        |-- Skill Vault      (x402 per-request pay-gate)
        |-- Settlement Hub   (MPP session escrow)
        |-- Protocol Sentinel (circuit-breaker + agent monitoring)
        |
        v
  [Supabase] ← protocol_logs, auth_keys, webhooks, fleet_agents, subscriptions
  [Protocol Archive] ← HMAC-SHA256 signature + immutable record per agent action
```

---

## Core Features

### Institutional API (44 endpoints, OpenAPI v2.5.0)

Multi-tier authentication with sandbox accounts, API key tiers (free/institutional), and JWT for WebSocket. Full RBAC, sliding-window rate limiting, AML checks, and domain lock.

| Access Level | Endpoints |
|---|---|
| Public (no key) | health, loop/status, execute-demo, signals/recent, skills |
| Protected (API key) | execute, market, tickers, stats, loop control, webhooks, subscriptions, skills/install |
| WebSocket (JWT) | `/ws/signals` — real-time signal stream |
| Admin only | system/health, config/llm |

Full specification: [API_DOCUMENTATION_OPENAPI.yaml](API_DOCUMENTATION_OPENAPI.yaml)

### Autonomous On-Chain Execution (Soroban)

Five strategy types executed via Soroban smart contracts — all verifiable on Stellar Expert:

- `routing-optimization` — automated path payment discovery for XLM-USDC corridors
- `liquidity-provisioning` — automated liquidity depth management on Stellar AMMs
- `lst-stabilization` — algorithmic parity maintenance for afXLM/vXLM tokens
- `blend-optimization` — non-custodial liquidity allocation on Blend Protocol
- `atomic-swap` — multi-hop execution on Soroswap with minimum slippage enforcement

### x402 + MPP + MCP

Any AI agent (Claude, GPT, custom) can access Nirium's premium intelligence **per-request** by paying USDC on Stellar — no account or subscription needed. Adopted on launch day alongside emerging industry standards:

- x402 integrated April 2, 2026 — same day as the Linux Foundation x402 Foundation launch
- MPP integrated April 3, 2026 — 16 days after Stripe/Tempo published the spec (March 18, 2026)

The MCP server exposes Nirium as **12 tools** for Claude Desktop, Cursor, and any MCP-compatible IDE. **13/13 integration tests PASS** (April 19, 2026).

### Audit Trail Engine

```
Agent action
    → HMAC-SHA256 signature (agent key)
    → Immutable database record
    → LLM translation to human-readable compliance summary
    → Encrypted JSON export (ready for due diligence)
```

Designed for regulatory compliance without requiring blockchain expertise from the institutional team.

### Live Market Ticker (Reference Data)

> *Data shown is public protocol information. It does not constitute investment advice or return projections.*

| Ticker | Source | Description |
|---|---|---|
| **XLM/USDC** | Reflector → CoinGecko → Stellar Expert | Multi-tier oracle price feed |
| **SDEX SPREAD** | Stellar Horizon orderbook | Live XLM/USDC spread in basis points |
| **BLEND APY** | Blend Protocol on-chain | Liquidity reference rate (~5.12%) |
| **ETHERFUSE APY** | Etherfuse testnet | Tokenized CETES reference rate (~5.78%) |
| **BASE FEE** | Stellar Horizon | Live network base fee |

### Published SDKs (npm + PyPI)

| SDK | Package | Version | Install |
|---|---|---|---|
| TypeScript | [nirium (npm)](https://www.npmjs.com/package/nirium) | 0.5.0 | `npm install nirium` |
| Python | [nirium (PyPI)](https://pypi.org/project/nirium/) | 0.5.0 | `pip install nirium` |

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
result = await agent.execute("routing-optimization", "XLM-USDC", {"amount": 5000}, stellar_account="G...")
async for signal in agent.listen():
    print(signal)
```

See [SDKs.md](SDKs.md) for full SDK documentation.

---

## Deployed Contracts (Stellar Testnet)

| Contract | Contract ID |
|---|---|
| **NiriumVault** (primary — Vault 2000 active) | `CDHDX63NUYSFCIPJTTS46N5PYLTI7J5WIAIOP7TZSPBNUTLI32AY7GA2` |
| Protocol Reputation (ELO) | `CC6Z3WJWRKVEAXEKIQ5S3LFEMKRF4L2FTN5YZDQU27MQRQAWA5QBJWF2` |
| Strategy Marketplace | `CB6Q3LKBJ7CAAZY4MK7EG5R6FDDTJHB52ZEENI6BQLBJNFKBQRIAUABC` |
| Protocol Sentinel | `CCP5OY3TTDVIREQYGOUZUXS2MZJO3LLJD6Z22Z3VROWFCPJAON22WPY2` |
| Settlement Hub | `CANZP2OJUS2Y5VXE4YHRR75LE2WKE7QTJOCCWENR7X65DWE6QEJZV6KS` |
| Skill Vault | `CB4JM3PP7GWKJUAYIZ7ZULWFTFJ57FTTUFZTFIDF4JCAPF664OJCXIEI` |

All verifiable at [Stellar Expert (Testnet)](https://stellar.expert/explorer/testnet).

---

## Side Projects

### x402-VPN — Institutional Mesh Proxy
A public proxy that exposes any legacy API behind an x402 pay-gate on Stellar. Primary use case: a bank, fintech, or data provider monetizes its APIs per-request in USDC without rewriting its backend. Also functions as an agentic VPN — agents pay for access to private network capacity.

Live: [x402-vpn.vercel.app](https://x402-vpn.vercel.app)

### /build — Startup Ideas Hub
Interactive dashboard with 12 production-ready startup ideas buildable on the Nirium API and SDKs. Includes a developer toolkit, reference endpoints, and code examples in TypeScript, Python, cURL, and MCP.

Live: [nirium.xyz/build](https://nirium.xyz/build)

---

## Quick Start

### Requirements
- Node.js 20+, pnpm 9+
- [Freighter Wallet](https://freighter.app/) in testnet mode for dashboard interactions

### Run Locally
```bash
pnpm install
pnpm dev          # starts web (port 3000) + agent API (port 3001) in parallel
```

### Deploy
```bash
pnpm ship         # → vercel --prod (frontend)
# Agent API deploys to Railway via git push to main
```

### SDK Quick Start
```bash
npm install nirium       # TypeScript SDK
pip install nirium       # Python SDK
```

---

## Project Structure

```
Nirium/                        (public repo)
├── apps/web/                  → Next.js 15 Dashboard (nirium.xyz) — 25 routes, i18n (EN/ES/ZH)
├── packages/sdk/              → TypeScript SDK v0.5.0 (npm: nirium)
├── packages/sdk-python/       → Python SDK v0.5.0 (PyPI: nirium)
├── packages/contracts/        → Soroban smart contracts (Rust) — 5 modules, 5 fuzz targets
├── .github/workflows/         → CI, release, security-gate, desktop release
│
├── packages/agent/            → [private] Express API server — 44 endpoints, execution logic
├── packages/mcp/              → [public] MCP Server v0.4.0 — 12 tools (4 free + 3 auth + 5 paid)
├── packages/cli/              → [public] CLI tool v1.0.0
├── packages/desktop/          → [private] Tauri desktop wrapper
```

---

## SCF 7.0 Build Award — Institutional Roadmap

Nirium is optimized for the **SCF 7.0 Build Award** and the **Kickstart** program. Our milestones are designed to transition the protocol from a functional Testnet MVP to a verified, audited Mainnet deployment.

Detailed Roadmap: [docs/scf-roadmap.md](docs/scf-roadmap.md)

### Milestone Summary
- **M1 (10%):** Compliance Framework & Protocol Hardening — 🚀 Start Month 1
- **M2 (20%):** Cluster Orchestration & Pilot Integration — 🚀 Start Month 2
- **M3 (30%):** Formal Security Audit & Risk Management — 🚀 Start Month 4
- **M4 (40%):** Verified Mainnet Launch & LatAm Scaling — 🎯 Month 6

### Regional Impact (LatAm)
We collaborate with local **Ambassador Chapters** to ensure our MXN→USDC treasury solutions meet the highest standards of regional compliance and technical efficiency.

---

## Security

- **Internal JARGUS Audit v3.0**: AAA Grade — 83/83 vectors PASS — 0 critical, 0 high (May 2026)
- Methodology: static analysis (`cargo clippy`, grep), dynamic analysis, JARGUS full-spectrum pentesting, `cargo audit` + `pnpm audit`, fuzz testing (5 cargo-fuzz targets), manual code review
- Formal third-party audit planned for Month 3 (eligible for **SCF Audit Bank**, 95% subsidy available — independent of any commercial partnership)
- See [SECURITY.md](SECURITY.md) for responsible vulnerability disclosure policy
- See [INTERNAL_SECURITY_AUDIT.md](INTERNAL_SECURITY_AUDIT.md) for the full 83-vector JARGUS report

---

## SCF 7.0 Compliance — Stellar Code of Conduct (April 26, 2026)

Nirium operates in full alignment with the Stellar Community Fund v7.0 framework and the [Stellar Code of Conduct](https://stellar.org/foundation/code-of-conduct) as of April 26, 2026.

### Alignment with SCF Official Rules (SCF 7.0)

| SCF Requirement | Nirium Status |
|---|---|
| Stellar must be **core and valuable** to the project, not auxiliary | ✅ 6 Soroban smart contracts, SDEX, Blend, Soroswap — Stellar is the execution layer |
| Budget covers **development costs only**, integrated with Stellar | ✅ SCF budget: engineering, audit, testnet infrastructure only |
| No speculation, wash trading, or insider trading with SCF funds | ✅ All contracts on Testnet; SCF funds allocated to development, not trading |
| No investment advice or yield promises | ✅ Prominent disclaimer; APY displayed as protocol reference data only |
| No marketing promising interest, dividends, or appreciation | ✅ Product language focuses on workflow automation and optimization, not guaranteed returns |
| Milestone structure 10% / 20% / 30% / 40% (SCF 7.0) | ✅ M1–M4 roadmap structured accordingly |
| Open source — contracts and SDKs publicly available | ✅ Soroban contracts + TypeScript SDK + Python SDK in public repo |
| Team available for bootcamp and investor demos | ✅ Founder available; independent go-to-market strategy active |

### SCF Build Award Milestone Structure

| Tranche | Milestone | % | Confirmed Deliverables |
|---|---|---|---|
| #1 | Compliance & Hardening | **10%** | Audit Trails (HMAC-SHA256), CNBV-Ready Reporting, Sentinel v1 |
| #2 | Cluster Orchestration | **20%** | Multi-protocol rebalancing (Blend/Soroswap), Pilot Integrations, SDK v1.0 |
| #3 | Security & Audit | **30%** | Formal Third-Party Audit (SCF Audit Bank), On-chain Circuit Breakers |
| #4 | Mainnet Launch | **40%** | Mainnet Deployment, Institutional Corridor Activation, LatAm Scaling |

> Full roadmap available in [docs/scf-roadmap.md](docs/scf-roadmap.md). Current Testnet MVP serves as the foundation for these growth milestones.

### Stellar Code of Conduct Principles (April 2026)

- **Transparency**: Every protocol action is auditable on-chain via Stellar Expert (Testnet)
- **Integrity**: No front-running or predatory extraction; the system enforces best execution
- **Safety**: Non-custodial by design; the user is the sole custodian of their keys
- **Professionalism**: All community interactions follow SDF ethical standards
- **Open Source**: Soroban contracts and SDKs under open license; CI/CD public in `.github/workflows`

To report violations: [community@stellar.org](mailto:community@stellar.org)

### SCF Kickstart Program (Operated by Ambassador Chapters)

Nirium has received Kickstart funding ($5,000 USD), with full KYC complete (Airtable + Persona + W-8BEN). This funding supported the technical validation phase prior to the SCF Build Award application.

> Kickstart (formerly Instaward) is SCF's early-stage funding program operated by regional Stellar Ambassador chapters. It funds prototyping and local validation — up to $15,000 per project. More info: [communityfund.stellar.org](https://communityfund.stellar.org)

---

## Roadmap

| Milestone | Status |
|---|---|
| Core infrastructure + x402/MPP on Testnet | ✅ Complete |
| Institutional API (44 endpoints) + SDKs v0.5.0 | ✅ Complete |
| Internal JARGUS Security Audit v3.0 (AAA Grade - 83/83 PASS) | ✅ Complete |
| x402-VPN — Institutional Mesh Proxy | ✅ Live |
| /build — Startup Ideas Hub (12 blueprints) | ✅ Live |
| MCP Server v0.4.0 — 12 tools (13/13 tests PASS) | ✅ Complete |
| Etherfuse CETES integration (testnet + SPEI sandbox) | ✅ Complete |
| Institutional JV — CNBV-regulated operator (Mexico) | 🔄 Commercial terms under renegotiation post-audit |
| Stellar House CDMX 2026 — institutional presentation to SDF | ✅ Completed April 20–23, 2026 |
| SCF Round 43 Build Award — application submitted | 🔄 In Panel Review (post-deadline Apr 26, 2026) |
| Etherfuse partnership — $150K grant + technical integration | 🔄 Active negotiation |
| Sprint M1 — 6 institutional PoCs (90 days) | 🔄 In progress |
| Formal third-party security audit | Planned — Month 3 (SCF Audit Bank eligible) |
| Mainnet Deployment | Post formal audit |
| Meridian 2026 — Lisbon, October | Target |
| SCF Follow-on Award (up to $300K lifetime) | Post-mainnet launch |

---

## External Credentials

- **3rd Place — Fintech World Cup Mexico 2026** — Sui Loop (founder's prior project, architecture migrated to Nirium on Stellar)
- **Stellar Scale / Kickstart** — 83/100 Bootcamp Impact; active graduate with ongoing SDF mentorship
- **SCF Kickstart $5,000** — Approved; full KYC complete (Airtable + Persona + W-8BEN); funds received
- **Stellar House CDMX 2026** — Presented to SDF executives, LatAm fintechs, and VCs (invite-only, 3rd edition)
- **Etherfuse** — Active technical partnership; $150K grant opportunity identified; technical call scheduled

---

## Documentation

| Document | Description |
|---|---|
| [SDKs.md](SDKs.md) | Full TypeScript + Python SDK documentation |
| [API_DOCUMENTATION_OPENAPI.yaml](API_DOCUMENTATION_OPENAPI.yaml) | OpenAPI v2.5.0 — complete 44-endpoint specification |
| [MCP_INTEGRATION_GUIDE.md](MCP_INTEGRATION_GUIDE.md) | MCP v0.4.0 — 12 tools for Claude Desktop / Cursor |
| [INTERNAL_SECURITY_AUDIT.md](INTERNAL_SECURITY_AUDIT.md) | Internal JARGUS v3.0 report — 83/83 vectors PASS (AAA) |
| [NIRIUM_TECHNICAL_PAPER.md](NIRIUM_TECHNICAL_PAPER.md) | Technical whitepaper v2.2 |
| [SECURITY.md](SECURITY.md) | Responsible vulnerability disclosure policy |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Open source contribution guide |

---

## Developer Quick Start

```bash
# Testnet — no real funds required
curl https://api.nirium.xyz/api/health

# Sandbox API Key (free)
curl https://api.nirium.xyz/api/sandbox/status \
  -H "x-api-key: YOUR_SANDBOX_KEY"

# WebSocket — real-time signals
wscat -c "wss://api.nirium.xyz/ws/signals" \
  -H "Authorization: Bearer YOUR_JWT"
```

---

## Contact

| Channel | Link |
|---|---|
| **Website** | [nirium.xyz](https://nirium.xyz) |
| **API** | [api.nirium.xyz](https://api.nirium.xyz) |
| **Build Hub** | [nirium.xyz/build](https://nirium.xyz/build) |
| **x402-VPN** | [x402-vpn.vercel.app](https://x402-vpn.vercel.app) |
| **X / Twitter** | [@NiriumXYZ](https://x.com/Niriumstellar) |
| **SCF / Community** | [communityfund.stellar.org](https://communityfund.stellar.org) |
| **Security** | xvaiosx7@gmail.com |

---

## Legal

Nirium Protocol employs a **Dual-Licensing Strategy** to balance protocol protection with ecosystem growth:

- **Core Protocol & Dashboard:** Licensed under the [Business Source License 1.1 (BSL)](LICENSE). Source is available for audit and non-commercial use. Commercial use is restricted until **April 2, 2028**.
- **SDKs & Integration Tools:** Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0). Permissive and integration-friendly for all fintechs and developers.

For full details, see [LICENSING.md](LICENSING.md).

This project operates under the [Stellar Community Fund v7.0](https://stellar.gitbook.io/scf-handbook) framework and the [Stellar Code of Conduct](https://stellar.org/foundation/code-of-conduct) (updated April 26, 2026).

---

*Nirium Protocol — experimental software. Not financial advice. Stellar Testnet only. Updated May 6, 2026.*
