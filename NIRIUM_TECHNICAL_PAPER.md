# Nirium Protocol: Technical Whitepaper v2.5
> Institutional DeFi Infrastructure Powered by Autonomous Agents on Stellar/Soroban

**Version:** 2.5 — July 2026 (Updated Jul 13, 2026 — dual-network execution nodes, self-service API keys, non-custodial Payouts)
**Author:** Nirium Protocol Team
**Network:** Stellar Testnet (NiriumVault treasury, audit-gated) + Mainnet (receive-only execution nodes, early access)
**Contact:** niriumprotocol@gmail.com

---

## 1. Abstract

Nirium is institutional DeFi infrastructure that enables fintechs and financial institutions to automate treasury operations, cross-border FX, and cash-flow management using autonomous agents on the Stellar network. The protocol combines Soroban smart contracts with a multi-LLM execution layer, x402 micropayments, MPP session budgets, and a 66-endpoint institutional API (65 HTTP + 1 WebSocket) — creating a full-stack platform where autonomous agents execute financial strategies on-chain with cryptographic accountability and boardroom-ready audit trails.

Nirium addresses two markets simultaneously: institutional clients (B2B/A2A) that need automated treasury infrastructure, and the emerging agentic economy where AI agents pay for intelligence and execution with USDC micropayments. Both markets are served by the same protocol layer.

---

## 2. Core Architecture

### 2.1 Three-Layer Stack

```
Layer 1 — Interface
  Next.js 15 Dashboard (nirium.xyz)
  TypeScript SDK v0.7.0 (npm: nirium)
  Python SDK v0.7.0 (pypi: nirium)
  MCP Server (Claude Desktop / Cursor)

Layer 2 — Intelligence & API
  Express API Server, dual network, 66 endpoints (65 HTTP + 1 WebSocket)
    - nirium-agent.fly.dev          (testnet — full autonomous loop)
    - nirium-agent-mainnet.fly.dev  (mainnet — receive-only, early access)
  Neural Reasoner (LLM, provider-agnostic, 8 providers)
  Single autonomous execution agent (throttled cycle, deterministic fallback)
  Strategy Router (5 execution types)

Layer 3 — Settlement
  Soroban Smart Contracts (2 deployed: NiriumVault + NiriumProtocol, Testnet, audit-gated)
  Stellar SDEX / Soroswap / Blend
  Audit Storage (HMAC-SHA256 signed immutable records, anchored to IPFS)
  Supabase (persistence layer)
```

### 2.2 Cryptographic Sovereignty

Every agent in Nirium owns its private Ed25519 keys and operates through a delegation model: a human or institution creates a vault (`create_vault`, 12.5 XLM deployment fee), then delegates execution rights to an agent address with a defined `max_execution_amount`. The agent can execute within those bounds — it cannot exceed them, withdraw to unauthorized addresses, or modify delegation parameters. The Soroban contract is the immutable arbiter.

The LLM layer advises. The contract decides. A compromised LLM cannot drain funds.

---

## 3. Smart Contracts (Soroban — Stellar Testnet)

### 3.1 NiriumVault — Primary Execution Contract

**Contract ID:** `CBTWMZCG3P72EHFAQ4ZLSEBIOFYJC244H5J6DHZIJ56FHFWJ2CFAWSZU`
**Active Vault:** ID 1 (testnet, agent delegated)

Core functions:
- `create_vault(owner, asset, name, xlm_address)` — deploys vault, charges 12.5 XLM
- `delegate_agent(vault_id, agent_address, max_amount)` — stores AgentDelegation in persistent storage
- `flash_loan_execute(vault_id, pool_id, asset, amount, min_output)` — single-invocation flash loan
- `execute_path_arbitrage(vault_id, asset_in, asset_out, amount, min_output)` — multi-hop path payment
- `execute_cross_dex(vault_id, ...)` — cross-venue arbitrage
- `execute_blend_yield(vault_id, ...)` — Blend Protocol yield capture
- `execute_soroswap_swap(vault_id, ...)` — Soroswap direct execution

**Single-Invocation Flash Loan (SIFL):** Borrow, execute, and repay in a single atomic invocation. If the repayment check fails, the entire transaction reverts. Mathematical insolvency is impossible at the protocol level.

**Fee decoupling:** `create_vault` accepts an explicit `xlm_address` parameter, ensuring the 12.5 XLM platform fee always settles in native XLM regardless of the vault's base asset (USDC, CETES, etc.).

### 3.2 NiriumProtocol — Unified Registry Contract

**Contract ID:** `CC2TU5BDTKTPRRRQPEF77I54XYHFQ25XGIRO2TCWKSR7NRJDFR5L5NR5`

A single consolidated contract covering what were originally separate concerns, merged to reduce audit surface and cost:

| Function | Purpose |
|---|---|
| Protocol Reputation (ELO) | On-chain agent performance scoring (ELO 1200 base, K=32) |
| Strategy Marketplace | Strategy CID registry, ELO-weighted subscriptions |
| Skill Gate | x402 payment gate, atomic skill unlock |

**Soroban source modules** (`packages/contracts/src/` for NiriumVault, `packages/contracts/protocol/` for NiriumProtocol):
- `nirium_vault.rs` — Core vault, flash loans, agent delegation, 2-of-3 multisig emergency pause
- `agent_auth.rs` — Delegation validation utilities, permission level system (Owner/Agent/ReadOnly)
- NiriumProtocol `lib.rs` — ELO scoring, strategy marketplace, skill gate, consolidated from what were previously five independent sub-crates (hub, elo, marketplace, sentinel, skill-vault), retired to cut audit cost roughly 60–70% and reduce attack surface.

---

## 4. Institutional API Layer

### 4.1 Overview

The Nirium API is deployed dual-network on Fly.io with Express 5 and Node 20, exposing 66 endpoints (65 HTTP + 1 WebSocket) across 11 categories:

- **`nirium-agent.fly.dev`** (testnet) — full autonomous loop, all endpoints active
- **`nirium-agent-mainnet.fly.dev`** (mainnet, early access) — receive-only: x402, MPP, Audit Trail, Reporting, and Payouts (invite-only). No private signing key lives on this box; the autonomous rebalance loop and indexer are disabled here.

**Authentication tiers:**

| Tier | Rate limit | Access |
|---|---|---|
| Free | 10 rpm / 100 req/day | self-service via `/keys` (wallet-signed, SEP-53); public + protected endpoints |
| Sandbox | 30 rpm / 1K req/day | all public + sandbox endpoints |
| Institutional | 300 rpm / 10K req/day / 500 strategies/day | all endpoints, including mainnet Payouts (invite-only, manually authorized) |
| Enterprise | unlimited (custom) | negotiated institutional access |
| Admin | unlimited | system/health, config/llm |

**Key middleware stack (in order):**
1. `domainLock` — origin/CORS validation
2. `security` — SQL injection, prompt injection, XDR/address sanitization
3. `rateLimit` — sliding window per tier
4. `auth` — JWT (HS256, 1h), API Key (SHA-256 hash), Sandbox token
5. `aml` — AML screening
6. `legalShield` — TOS consent check (requires `x-stellar-account` header on `/api/execute`)
7. `x402` / `mpp` — payment validation on premium routes

### 4.2 Endpoint Summary

**Public:** `/health`, `/api/info`, `/api/loop/status`, `/api/signals/recent`, `/api/skills`, `/api/execute-demo`, `/api/public/*` (6 endpoints)

**Sandbox:** `/api/sandbox/request`, `/api/sandbox/status`, `/api/sandbox/info`, `/api/sandbox/accounts` (admin), `/api/sandbox/accounts/:id` (admin)

**Auth:** `/api/auth/token`, `/api/auth/keys` (GET/POST/DELETE — self-service, wallet-signed via SEP-53)

**Payouts:** `/api/payroll/run`, `/api/payroll/submit`, `/api/payroll/onboard`, `/api/payroll/onboard/submit`, `/api/payroll/runs`, `/api/payroll/terms`, `/api/payroll/info` — mainnet requires client identification (legal name, tax ID, legal representative) and institutional-tier authorization

**MPP:** `/api/v1/mpp/signals`, `/api/v1/mpp/market`, `/api/v1/mpp/execute`, `/api/v1/mpp/info` + 3 more

**Market:** `/api/market`, `/api/tickers`, `/api/stats/global`, `/api/strategies`, `/api/revenue`

**Execution:** `/api/execute` (real, requires x-stellar-account), `/api/execute-demo`

**Loop:** `/api/loop/start`, `/api/loop/stop`, `/api/loop/scan`, `/api/loop/status`

**Webhooks:** `/api/webhooks` (GET/POST), `/api/webhooks/:id` (DELETE), `/api/webhooks/:id/test`

**Subscriptions:** `/api/subscriptions` (GET/POST), `/api/subscriptions/:id` (DELETE), `/api/subscriptions/stats`

**Skills:** `/api/skills` (GET), `/api/skills/marketplace`, `/api/skills/install`, `/api/skills/:slug` (DELETE), `/api/skills/:slug/actions/:action`

**WebSocket:** `wss://nirium-agent.fly.dev/ws/signals?token=JWT`

**Admin:** `/api/system/health`, `/api/config/llm`

**x402 Premium:** `/api/v1/premium/signals` ($0.02 USDC), `/api/v1/premium/market` ($0.05 USDC)

### 4.3 WebSocket Real-Time Signals
JWT-authenticated WebSocket stream. Events: `signal` (arbitrage/yield signal), `log` (agent execution log), `connected`. Reconnects automatically. Used for real-time dashboard feeds and signal-triggered strategy execution.

---

## 5. Agentic Payment Protocols

### 5.1 x402 — Per-Request Intelligence Monetization

**Protocol:** HTTP 402 → agent pays USDC → API delivers premium data.

```
Agent → GET /api/v1/premium/signals
     ← 402 + payment requirements (0.02 USDC, stellar:testnet)
Agent → signs Soroban SAC auth entry (SEP-41)
     → GET + X-PAYMENT header
     ← 200 + premium signal data
```

No account required. Agent pays with any funded Stellar wallet. Facilitator (`x402.org`) sponsors network fees. Payment receipt logged to Supabase in real time.

**SDK:** `agent.initX402(config); const data = await agent.x402Fetch('/api/v1/premium/signals');`

### 5.2 MPP — Session-Based Budget Delegation

Institution or treasury manager locks USDC in a Soroban escrow session via `open_session()`. Agent executes within the budget using `settle_intent()`. Unspent funds return on `close_session()`. The agent never touches funds outside the session boundary.

**Use case:** Treasury operator delegates $10K USDC for nightly FX rebalancing. Agent executes cross-border swaps within budget, unspent funds auto-return at end of session.

**SDK:** `agent.initMpp(config); const data = await agent.mppFetch('/api/v1/mpp/signals');`

### 5.3 MCP Server

The `@nirium/mcp` package implements a Model Context Protocol server exposing Nirium as tools for Claude Desktop, Cursor, VS Code Copilot, and any MCP-compatible AI agent.

Free tools (no auth): `get_market_state`, `get_loop_status`, `execute_demo`

Info tools (no auth): `get_wallet_info` — shows x402/MPP session configuration

Authenticated tools (NIRIUM_API_KEY required): `start_loop`, `stop_loop`, `get_system_health`

Paid tools (x402 — STELLAR_SECRET_KEY + funded wallet): `get_premium_signals` ($0.01), `get_premium_market` ($0.01), `execute_paid_strategy` ($0.05)

Paid tools (MPP — direct Soroban SAC, no facilitator): `get_mpp_signals` ($0.01), `get_mpp_market` ($0.01)

---

## 6. LLM Intelligence Layer

### 6.1 Provider Abstraction

Nirium abstracts LLM interaction across 8 providers, configurable at deploy time via `ACTIVE_LLM_PROVIDER`. Hot-swap without downtime via `POST /api/config/llm`.

| Provider | Use case |
|---|---|
| OpenAI (gpt-4o, o1) | Highest reasoning quality |
| Anthropic (Claude) | Long-context analysis |
| Ollama (local) | Private institutional execution — keys never leave premises |
| Gemini, Grok, MiniMax | Edge / low-latency deployments |
| AWS Bedrock, OpenRouter | Enterprise compliance environments |

### 6.2 Three LLM Functions (Isolated)

**1. Unstructured Data Analysis:** Ingests news, macroeconomic releases (Banxico rate decisions, Fed minutes, peso/dollar alerts), on-chain governance — translates to structured trading signals before price ticks reflect the move.

**2. Execution Cluster Orchestration:** Dynamically activates or suppresses agent classes based on market regime (high volatility → risk protection agents active; deep liquidity → arbitrage agents racing; macro event pending → execution pause).

**3. Audit Log Generation:** Translates raw XDR transactions to boardroom-readable summaries in real time. Compliance teams audit every agent action without blockchain expertise.

### 6.2.1 LLM-Gated Treasury Execution

The autonomous loop's rebalance decision is gated by the LLM, not a hardcoded rule. Each throttled cycle, the agent presents the live treasury context to the reasoner — CETES sovereign yield via Etherfuse versus the rebalance threshold, idle-USDC opportunity cost, network base fee — and the LLM returns a structured `{action, confidence, reasoning}`. When the LLM returns `rebalance` above a configurable confidence floor (`AGENT_LLM_MIN_CONFIDENCE`, default 0.75), the agent transfers the real testnet asset (USDC or CETES, alternating one per cycle) to the vault treasury via its Stellar Asset Contract — the USDC↔CETES conversion itself is executed off-chain by Etherfuse, the regulated operator, never by an on-chain DEX swap; there is no testnet liquidity for that pair. Otherwise the agent holds and records its reasoning. The decision, confidence, and reasoning are persisted alongside the resulting transaction hash and IPFS audit CID — so every autonomous execution is traceable back to the exact reasoning that authorized it.

### 6.3 LLM Privacy Boundary (Non-Negotiable)

The LLM receives: public market data, anonymized on-chain stats, public news, sanitized TX summaries.

The LLM never receives: private keys, raw wallet balances, API secrets, user PII, unencrypted auth tokens.

The LLM suggests. The Soroban contract decides. A compromised LLM provider cannot issue unauthorized transactions or alter on-chain state.

---

## 7. Audit Trail Engine

Every agent action follows this pipeline:
1. Action recorded with raw inputs
2. HMAC-SHA256 signed (BlackBox Archive)
3. Written to Supabase (`agent_logs`)
4. LLM translates to human-readable summary
5. Record committed to immutable audit storage (decentralized, planned for future release)
6. Exportable as encrypted JSON

This dual-format archive (machine-readable + human-readable) enables both technical auditors and institutional directors to independently verify any agent action. Designed specifically so compliance teams need zero blockchain expertise.

---

## 8. Real-World Asset Integration

### 8.1 CETES (Mexican Treasury Bonds)

Integration via Etherfuse on Stellar Testnet:
- **Classic Asset:** `CETES:GC3CW7EDYRTWQ635VDIGY6S4ZUF5L6TQ7AA4MWS7LEQDBLUSZXV7UPS4`
- **SAC:** `CC72F57YTPX76HAA64JQOEGHQAPSADQWSY5DWVBR66JINPFDLNCQYHIC`
- **Fiat on-ramp:** MXN → CETES via SPEI (Etherfuse sandbox active)

Use case: AI agent dynamically moves capital between USDC (US yield) and CETES (Mexican Treasury yield) based on real-time spread analysis, 24/7, with full audit trail.

### 8.2 Cross-Border FX Automation (MXN ↔ USDC ↔ USD)

Nirium's path arbitrage engine operates on Stellar SDEX — the deepest on-chain order book for XLM/USDC. Gas: ~$0.000001 per operation.

Nirium charges a fixed software license fee (platform subscription + per-API-call pricing) — never a percentage of assets under management or transaction volume. Financial execution fees (FX spread, settlement) are set and collected by the regulated operator (e.g. Etherfuse), not by Nirium. See Section 12 for the full fee structure.

---

## 9. Security

### 9.1 Internal Security Review (May 2026)
Internal security framework (Kali Linux, 7-pillar methodology). Result: **83/83 PASS, 0 critical, 0 high.**

| Pillar | Score |
|---|---|
| Soroban/Rust smart contracts | 20/20 |
| OWASP API Top 10 | 10/10 |
| Frontend & obfuscation | 12/12 |
| Supply chain & CI/CD | 8/8 |
| Regulatory compliance (MX/US) | 6/6 |
| Pentesting (network/infra) | 5/5 |
| Full-spectrum pentest | 22/22 |

### 9.2 Smart Contract Security
- `require_auth` on all state-modifying functions
- `checked_*` arithmetic (no overflow)
- Emergency pause (`Pausable` state)
- `max_execution_amount` per delegation cap
- Structured error codes (no panic leakage)
- Fuzzing: 5 fuzz targets (vault_create, flash_loan, elo_record, xdr_parse, auth_keys)

### 9.3 API Security
- SQL injection guards on all query params
- Prompt injection sanitization on LLM inputs
- Prototype pollution guard
- HMAC-SHA256 webhook signature validation
- JWT: HS256, 1h expiry, RBAC tiers
- API keys stored as SHA-256 hash only — irrecoverable after issuance
- `timingSafeEqual` for all key comparisons

### 9.4 Formal Audit Plan
A formal independent third-party audit of the NiriumVault treasury contract is required before it is deployed to mainnet with real client funds — this is the condition that keeps the vault Testnet-only today. Nirium is pursuing this audit and Stellar Community Fund Build Award support once verifiable third-party developer traction (not just internal testnet activity) is established, consistent with SCF's requirements. The receive-only mainnet execution nodes (x402, MPP, Audit Trail, Payouts) do not touch the vault and do not require this audit, since they are non-custodial by construction — the client always signs with its own wallet.

### 9.5 Pending Pre-Mainnet (non-blocking for Testnet)
SEP-10, SEP-24, SEP-31, SEP-12/Travel Rule, Bug Bounty, Proof of Reserves, Sanctions Screening (Chainalysis/Elliptic).

---

## 10. SDKs

Both SDKs verified against live API (July 2026, v0.7.0).

### TypeScript (Node.js ≥ 18)
```bash
npm install nirium
```
```typescript
import { Agent } from 'nirium';
const agent = new Agent({ apiKey: 'sk_inst_...', baseUrl: 'https://nirium-agent.fly.dev' });

await agent.ping();
await agent.getMarket();
await agent.execute('path-arb', 'XLM-USDC', { amount: 5000 }, 'G...');
agent.subscribe(signal => console.log(signal.signal_type));
```

### Python (≥ 3.10)
```bash
pip install nirium
```
```python
from nirium import Agent
agent = Agent(api_url="https://nirium-agent.fly.dev", api_key="sk_inst_...")

await agent.get_market()
await agent.execute("path-arb", "XLM-USDC", {"amount": 5000}, stellar_account="G...")

@agent.on("signal")
async def on_signal(data): print(data['signal_type'])
await agent.subscribe()
```

Full documentation: [SDKs.md](SDKs.md)

---

## 11. Infrastructure

### 11.1 Agent API — Fly.io (dual box)
- **Runtime:** Node 20, Docker
- **Entrypoint:** `packages/agent/dist/src/scripts/master.js`
- **Box A** (`nirium-agent`, testnet): full Orchestrator — MASTER proxy + AGENT + INDEXER + autonomous rebalance loop. 2GB RAM (1GB degrades outbound networking under load).
- **Box B** (`nirium-agent-mainnet`, mainnet early access): receive-only — no `STELLAR_SECRET_KEY`, autonomous loop and indexer disabled. 2GB RAM.
- **Master:** Proxy server on dynamic `PORT` env (default 8080)
- **Agent:** Express API on port 3002 (spawned by master, +2s delay)
- **Health:** `GET /health` — handled by master, proxied to agent
- **Auto-restart:** All workers restart automatically on crash (5s backoff)
- **Dedicated Soroban RPC:** QuickNode (per box) — the free public RPC degrades outbound networking under sustained confirm-polling load

### 11.2 Frontend — Vercel
- **Framework:** Next.js 15.1.7 / React 19
- **Deploy:** `pnpm deploy` (CLI only — git auto-deploy disabled)
- **Domain:** nirium.xyz

### 11.3 Database — Supabase
Key tables: `agent_logs`, `auth_keys`, `nirium_swarm_agents`, `sandbox_accounts`, `webhooks`, `user_signatures`, `security_events`

---

## 12. Economic Model

**Protocol fees (fixed software licensing, never a percentage of assets or volume):**
- Platform license: $299/mo flat (Growth tier)
- API execution: $0.01–$0.05 USDC per call
- x402 per-request calls: $0.01–$0.25 USDC
- Payouts: flat software fee per disbursement run — never a percentage of the amount disbursed
- Agent/vault deployment: 12.5 XLM one-time

**Legal classification (software-only):**
All revenue streams are classified as software licensing under LRITF Art. 22, LMV Arts. 225–226, and Banxico Circular 4/2019. Nirium never touches transactional flow or holds funds. Financial commissions (FX spread, CETES conversion, ~0.20% at Etherfuse) are set and collected entirely by the regulated operator, not by Nirium.

---

## 13. Conclusion

Nirium is the infrastructure layer where institutional DeFi and the agentic economy converge on Stellar. Institutions get automated treasury operations with full auditability and compliance-ready output. AI agents get a protocol they can pay into and execute against without human intermediation.

The protocol's deployment — 66 API endpoints (65 HTTP + 1 WebSocket) across a dual-network stack, a single autonomous execution agent with deterministic fallback, 2 consolidated Soroban contracts, x402/MPP/Payouts payment protocols live in mainnet early access, multi-LLM support, MCP server (11 tools, 12/12 PASS), published SDKs (npm + PyPI, v0.7.0), internal security review passed (83/83) — establishes the architectural foundation for the NiriumVault treasury contract's mainnet readiness, pending a formal independent third-party audit.

---

*Nirium Protocol — experimental software. Not financial advice. Not an investment product. NiriumVault treasury contract is Testnet-only, audit-gated; select execution nodes run in mainnet early access. Updated July 13, 2026.*
