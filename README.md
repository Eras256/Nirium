# Nirium Protocol — Institutional Infrastructure on Stellar

![Network](https://img.shields.io/badge/Network-Testnet%20%2B%20Mainnet%20(partial)-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-yellow?style=for-the-badge)
![API](https://img.shields.io/badge/API-66%20Endpoints-blue?style=for-the-badge)
![Security](https://img.shields.io/badge/JARGUS%20Audit-83%2F83%20PASS-brightgreen?style=for-the-badge)
![Instaward](https://img.shields.io/badge/Instaward%20%231-Delivered-blueviolet?style=for-the-badge)
![x402](https://img.shields.io/badge/x402-In%20Production-teal?style=for-the-badge)
![MPP](https://img.shields.io/badge/MPP-In%20Production-teal?style=for-the-badge)
![CoC](https://img.shields.io/badge/Stellar%20CoC-Aligned-green?style=for-the-badge)
![SCF](https://img.shields.io/badge/SCF-Kickstart%20Active-success?style=for-the-badge)

---

> **⚠️ MANDATORY LEGAL DISCLAIMER**
>
> Nirium is **experimental software**. The NiriumVault treasury contract and formal on-chain rebalancing remain on **Stellar Testnet, audit-gated** — no independent third-party audit has occurred yet, and no real client funds ever reach that contract. A separate, receive-only set of execution nodes (x402 micropayments, MPP session budgets, IPFS audit anchoring, and non-custodial Payouts) run in **mainnet early access**, where real USDC value moves under the client's own wallet signature — Nirium itself never custodies funds.
>
> **Nirium is not financial advice. It is not an investment product. It does not guarantee yields, dividends, asset appreciation, or returns of any kind.** Reference rate data displayed on the dashboard (Blend APY, Etherfuse CETES) represents **public protocol information only** — not projections or promises of return. XLM and Stellar assets are volatile. Use at your own risk.
>
> This project does not use grant funds for speculation, trading, investment advice, or marketing of products promising interest or appreciation, in accordance with the [Stellar Community Fund Official Rules](https://stellar.gitbook.io/scf-handbook/scf-awards/official-rules-for-submissions).

---

**Nirium is an Infrastructure-as-Software (IaaS) provider** — a developer SDK and API, not a consumer dashboard.

**The Hero Product: The Nirium Agentic SDK & API**
Our core offering is a high-performance TypeScript/Python SDK and a 66-endpoint API that allows any B2B fintech to deploy autonomous execution nodes. These nodes monitor live liquidity and execute high-value cross-border settlements 24/7 without manual CFO intervention.

**Execution Nodes:**
1. **Settlement (x402 + MPP):** Soroban-based per-request micropayments and session budgets for AI agents — live in mainnet early access.
2. **Audit Trail:** Every agent decision is HMAC-SHA256 signed, immutably anchored to IPFS, and exportable for institutional due diligence.
3. **Payouts:** Non-custodial batch disbursements (up to 100 recipients/tx) for contractors, freelancers, and B2B suppliers — mainnet early access, invite-only.
4. **Rebalance:** Autonomous USDC↔CETES treasury allocation via Etherfuse — Testnet only, audit-gated ahead of mainnet.

---

## Market Traction: Developer Adoption & Verifiable On-Chain Activity

Our traction is **self-generated and independently verifiable** — it does not depend on third-party announcements:

- **Published SDKs** on npm and PyPI (`nirium`, v0.6.3) with recorded downloads across multiple versions.
- **Live autonomous agent** running 24/7 on Stellar Testnet, with on-chain rebalances verifiable on Stellar Expert.
- **Real mainnet activity**: x402 micropayments settling in production against a verifiable treasury address.
- **Open API + free sandbox keys**, so any developer can integrate and exercise the contracts directly.

We provide the middleware; regulated operators (e.g. Etherfuse) hold the licenses and execute settlement. We are open to integration conversations with regional fintechs, but make **no claim of signed pilots**.

---

## Architecture

```
Fintech / Institution (B2B / A2A)
        |
        v
  [Next.js 15 Dashboard — nirium.xyz]
  [i18n: EN / ES / ZH — 27 routes]
        |
        v
  [Agent API — dual network, 66 endpoints]
        |-- nirium-agent.fly.dev          (testnet — full autonomous loop)
        |-- nirium-agent-mainnet.fly.dev  (mainnet — receive-only, early access)
        |-- Auth (JWT / API Key / Sandbox tiers)
        |-- legalShield middleware (SCF CoC compliance)
        |-- x402 + MPP payment middleware
        |-- Sliding-window rate limiting (300 rpm institutional)
        |-- AML screening + domainLock + obfuscation
        |
        v
  [Autonomous Execution Layer]
        |-- Autonomous Execution Node (LLM decision + deterministic fallback)
        |-- Composable framework — up to 10 Execution Nodes per vault
        |-- Strategy Router (path payment, blend, soroswap, cross-border)
        |
        v
  [Soroban Smart Contracts — Stellar Testnet]
        |-- NiriumVault      (treasury, flash loans, agent delegation, 2-of-3 multisig)
        |-- NiriumProtocol   (ELO reputation, strategy registry, scoring, skill gate)
        |
        v
  [Supabase] ← protocol_logs, auth_keys, webhooks, fleet_agents, subscriptions
  [Protocol Archive] ← HMAC-SHA256 signature + immutable record per agent action
```

---

## Core Features

### Institutional API (66 endpoints: 65 HTTP + 1 WebSocket)

Multi-tier authentication with sandbox accounts, self-service API keys (`/keys`, wallet-signed via SEP-53), API key tiers (free/sandbox/institutional/enterprise), and JWT for WebSocket. Full RBAC, sliding-window rate limiting, AML checks, and domain lock.

| Access Level | Endpoints |
|---|---|
| Public (no key) | health, loop/status, execute-demo, signals/recent, skills |
| Protected (API key) | execute, market, tickers, stats, loop control, webhooks, subscriptions, skills/install, payroll/* |
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
| **ETHERFUSE APY** | Etherfuse testnet | Tokenized CETES reference rate (~5.57%) |
| **BASE FEE** | Stellar Horizon | Live network base fee |

### Published SDKs (npm + PyPI)

| SDK | Package | Version | Install |
|---|---|---|---|
| TypeScript | [nirium (npm)](https://www.npmjs.com/package/nirium) | 0.6.3 | `npm install nirium` |
| Python | [nirium (PyPI)](https://pypi.org/project/nirium/) | 0.6.3 | `pip install nirium` |

```typescript
import { Agent } from 'nirium';
const agent = new Agent({ apiKey: 'sk_inst_...', baseUrl: 'https://nirium-agent.fly.dev' });

const market = await agent.getMarket();
const result = await agent.execute('path-arb', 'XLM-USDC', { amount: 5000 }, 'G...');
agent.subscribe(signal => console.log(signal));
```

```python
from nirium import Agent
agent = Agent(api_url="https://nirium-agent.fly.dev", api_key="sk_inst_...")

market = await agent.get_market()
result = await agent.execute("routing-optimization", "XLM-USDC", {"amount": 5000}, stellar_account="G...")
async for signal in agent.listen():
    print(signal)
```

See [SDKs.md](SDKs.md) for full SDK documentation.

---

## Deployed Contracts (Stellar Testnet)

| Contract | Contract ID | Function |
|---|---|---|
| **NiriumVault** (Vault ID 1 active) | `CBTWMZCG3P72EHFAQ4ZLSEBIOFYJC244H5J6DHZIJ56FHFWJ2CFAWSZU` | Core treasury: vaults, agent delegation, strategy execution, flash loans, 2-of-3 multisig |
| **NiriumProtocol** | `CC2TU5BDTKTPRRRQPEF77I54XYHFQ25XGIRO2TCWKSR7NRJDFR5L5NR5` | Unified registry: ELO reputation, strategy marketplace, agent scoring, skill gate (x402) |

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
pnpm dev          # starts web (port 3000) + agent API (port 3002) in parallel
```

### Deploy
```bash
pnpm ship         # → vercel --prod (frontend)
# Agent API deploys to Fly.io (fly deploy)
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
├── apps/web/                  → Next.js 15 Dashboard (nirium.xyz) — 27 routes, i18n (EN/ES/ZH)
├── packages/sdk/              → TypeScript SDK v0.6.3 (npm: nirium)
├── packages/sdk-python/       → Python SDK v0.6.3 (PyPI: nirium)
├── packages/contracts/        → Soroban smart contracts (Rust) — 2 contracts (NiriumVault + NiriumProtocol), 5 fuzz targets
├── .github/workflows/         → CI, release, security-gate, desktop release
│
├── packages/agent/            → [private] Express 5 API server — 66 endpoints (65 HTTP + 1 WebSocket)
├── packages/mcp/              → [public] MCP Server v0.4.0 — 12 tools (3 free + 3 auth + 1 info + 3 x402 + 2 MPP)
├── packages/cli/              → [public] CLI tool v1.0.0
├── packages/desktop/          → [private] Tauri desktop wrapper
```

---

## Security

- **Internal JARGUS Audit v3.0**: AAA Grade — 83/83 vectors PASS — 0 critical, 0 high
- Methodology: static analysis (`cargo clippy`, grep), dynamic analysis, JARGUS full-spectrum pentesting, `cargo audit` + `pnpm audit`, fuzz testing (5 cargo-fuzz targets), manual code review
- Formal independent third-party audit is planned ahead of any mainnet deployment of the NiriumVault treasury contract; the receive-only mainnet execution nodes (x402, MPP, Audit Trail, Payouts) do not require it since they never custody funds
- See [SECURITY.md](SECURITY.md) for responsible vulnerability disclosure policy
- See [INTERNAL_SECURITY_AUDIT.md](INTERNAL_SECURITY_AUDIT.md) for the full 83-vector JARGUS report

---

## Stellar Code of Conduct Alignment

Nirium operates in alignment with the [Stellar Code of Conduct](https://stellar.org/foundation/code-of-conduct).

| Principle | Nirium Status |
|---|---|
| Stellar must be **core and valuable** to the project, not auxiliary | ✅ 2 Soroban smart contracts (NiriumVault + NiriumProtocol), SDEX, Blend, Soroswap — Stellar is the execution layer |
| No speculation, wash trading, or insider trading with grant funds | ✅ Grant funds allocated to development, not trading |
| No investment advice or yield promises | ✅ Prominent disclaimer; APY displayed as protocol reference data only |
| No marketing promising interest, dividends, or appreciation | ✅ Product language focuses on workflow automation and optimization, not guaranteed returns |
| Open source — contracts and SDKs publicly available | ✅ Soroban contracts + TypeScript SDK + Python SDK in public repo |
| Transparency | ✅ Every protocol action is auditable on-chain via Stellar Expert |
| Integrity | ✅ No front-running or predatory extraction; the system enforces best execution |
| Safety | ✅ Non-custodial by design; the user is the sole custodian of their keys |

To report violations: [community@stellar.org](mailto:community@stellar.org)

### SCF Kickstart

Nirium received Kickstart funding ($5,000 USD) via a regional Stellar Ambassador chapter, with full KYC complete (Airtable + Persona + W-8BEN). Kickstart (formerly Instaward) is SCF's early-stage funding program for prototyping and local validation — up to $15,000 per project. More info: [communityfund.stellar.org](https://communityfund.stellar.org)

---

## Roadmap

| Milestone | Status |
|---|---|
| Core infrastructure + x402/MPP on Testnet | ✅ Complete |
| Institutional API (66 endpoints) + SDKs v0.6.3 | ✅ Complete |
| Internal JARGUS Security Audit v3.0 (AAA Grade - 83/83 PASS) | ✅ Complete |
| x402-VPN — Institutional Mesh Proxy | ✅ Live |
| /build — Startup Ideas Hub (12 blueprints) | ✅ Live |
| MCP Server v0.4.0 — 12 tools (13/13 tests PASS) | ✅ Complete |
| Etherfuse CETES integration (testnet + SPEI sandbox) | ✅ Complete |
| Self-service API Keys console (`/keys`, wallet-signed via SEP-53) | ✅ Live |
| Payouts node — non-custodial batch disbursements | ✅ Live, mainnet early access (invite-only) |
| Mainnet receive-only nodes (x402, MPP, Audit Trail) | ✅ Live, early access |
| Go-to-market — independent (software-only) | ✅ Active; regulated operators (Etherfuse) execute settlement |
| Stellar House CDMX 2026 — institutional presentation to SDF | ✅ Completed |
| Etherfuse — enterprise KYB onboarding | 🔄 In progress |
| Stellar Community Fund Build Award | 🔄 Building verifiable third-party traction before applying |
| Formal independent security audit of NiriumVault | Planned, ahead of any treasury-contract mainnet deployment |
| NiriumVault mainnet deployment (real treasury funds) | Post formal audit |

---

## External Credentials

- **3rd Place — Fintech World Cup Mexico 2026** — Sui Loop (founder's prior project, architecture migrated to Nirium on Stellar)
- **Stellar Scale / Kickstart** — 83/100 Bootcamp Impact; active graduate with ongoing SDF mentorship
- **SCF Kickstart $5,000** — Approved; full KYC complete (Airtable + Persona + W-8BEN); funds received
- **Stellar House CDMX 2026** — Presented to SDF executives, LatAm fintechs, and VCs (invite-only, 3rd edition)
- **Etherfuse** — Active technical integration (CETES on testnet + SPEI sandbox); enterprise KYB onboarding in progress

---

## Documentation

| Document | Description |
|---|---|
| [SDKs.md](SDKs.md) | Full TypeScript + Python SDK documentation |
| [API_DOCUMENTATION_OPENAPI.yaml](API_DOCUMENTATION_OPENAPI.yaml) | OpenAPI v2.5.0 — complete 66-endpoint specification |
| [MCP_INTEGRATION_GUIDE.md](MCP_INTEGRATION_GUIDE.md) | MCP v0.4.0 — 12 tools for Claude Desktop / Cursor |
| [INTERNAL_SECURITY_AUDIT.md](INTERNAL_SECURITY_AUDIT.md) | Internal JARGUS v3.0 report — 83/83 vectors PASS (AAA) |
| [NIRIUM_TECHNICAL_PAPER.md](NIRIUM_TECHNICAL_PAPER.md) | Technical whitepaper v2.5 |
| [SECURITY.md](SECURITY.md) | Responsible vulnerability disclosure policy |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Open source contribution guide |

---

## Developer Quick Start

```bash
# Testnet — no real funds required
curl https://nirium-agent.fly.dev/api/health

# Sandbox API Key (free)
curl https://nirium-agent.fly.dev/api/sandbox/status \
  -H "x-api-key: YOUR_SANDBOX_KEY"

# WebSocket — real-time signals
wscat -c "wss://nirium-agent.fly.dev/ws/signals" \
  -H "Authorization: Bearer YOUR_JWT"
```

---

## Contact

| Channel | Link |
|---|---|
| **Website** | [nirium.xyz](https://nirium.xyz) |
| **API** | [nirium-agent.fly.dev](https://nirium-agent.fly.dev) |
| **Build Hub** | [nirium.xyz/build](https://nirium.xyz/build) |
| **x402-VPN** | [x402-vpn.vercel.app](https://x402-vpn.vercel.app) |
| **X / Twitter** | [@NiriumXYZ](https://x.com/Niriumstellar) |
| **SCF / Community** | [communityfund.stellar.org](https://communityfund.stellar.org) |
| **Security** | niriumprotocol@gmail.com |

---

## Legal

Nirium Protocol is fully open-source and licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) to ensure full compliance with the Stellar Community Fund open-source requirements.

For full details, see [LICENSING.md](LICENSING.md).

This project operates under the [Stellar Community Fund](https://stellar.gitbook.io/scf-handbook) framework and the [Stellar Code of Conduct](https://stellar.org/foundation/code-of-conduct).

---

*Nirium Protocol — experimental software. Not financial advice. NiriumVault treasury contract is Testnet-only, audit-gated. Updated July 13, 2026.*
