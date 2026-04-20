# Nirium Protocol: Technical Whitepaper v2.0
> Institutional DeFi Infrastructure Powered by Autonomous Agents on Stellar/Soroban

**Version:** 2.0 — April 2026
**Author:** Nirium Protocol Team — Nirium Protocol
**Network:** Stellar Testnet (Mainnet post-audit)
**Contact:** xvaiosx7@gmail.com

---

## 1. Abstract

Nirium is institutional DeFi infrastructure that enables fintechs and financial institutions to automate treasury operations, cross-border FX, and yield management using autonomous agents on the Stellar network. The protocol combines Soroban smart contracts with a multi-LLM execution layer, x402 micropayments, MPP session budgets, and a 44-endpoint institutional API — creating a full-stack platform where autonomous agents execute financial strategies on-chain with cryptographic accountability and boardroom-ready audit trails.

Nirium addresses two markets simultaneously: institutional clients (B2B/A2A) that need automated treasury infrastructure, and the emerging agentic economy where AI agents pay for intelligence and execution with USDC micropayments. Both markets are served by the same protocol layer.

---

## 2. Core Architecture

### 2.1 Three-Layer Stack

```
Layer 1 — Interface
  Next.js 15 Dashboard (nirium.xyz)
  TypeScript SDK v0.5.0 (npm: nirium)
  Python SDK v0.5.0 (pypi: nirium)
  MCP Server (Claude Desktop / Cursor)

Layer 2 — Intelligence & API
  Express API Server (api.nirium.xyz, 44 endpoints)
  Neural Reasoner (LLM, provider-agnostic)
  30-Agent Swarm (racing mode, 3–12s intervals)
  Strategy Router (5 execution types)

Layer 3 — Settlement
  Soroban Smart Contracts (6 deployed, Testnet)
  Stellar SDEX / Soroswap / Blend
  IPFS / Pinata (audit trail)
  Supabase (persistence layer)
```

### 2.2 Cryptographic Sovereignty

Every agent in Nirium owns its private Ed25519 keys and operates through a delegation model: a human or institution creates a vault (`create_vault`, 12.5 XLM deployment fee), then delegates execution rights to an agent address with a defined `max_execution_amount`. The agent can execute within those bounds — it cannot exceed them, withdraw to unauthorized addresses, or modify delegation parameters. The Soroban contract is the immutable arbiter.

The LLM layer advises. The contract decides. A compromised LLM cannot drain funds.

---

## 3. Smart Contracts (Soroban — Stellar Testnet)

### 3.1 NiriumVault — Primary Execution Contract

**Contract ID:** `CAU2XBJTQUBTMPAUFRX7GMZ337I5WLBI4GYPWHZEVXTMJ66D3CP6DEL4`
**Active Vault:** ID 2000 (production, agent delegated)

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

### 3.2 Supporting Contracts

| Contract | ID | Purpose |
|---|---|---|
| ELO Reputation | `CDSDNMJQYPNGJM2GALM7Z2GFTXTUNX7GITUFFIE6JD4AGEMSWM5FYK7Z` | On-chain agent performance scoring (ELO 1200 base, K=32) |
| Strategy Marketplace | `CBOJ5M4AM3C4YCZJC5KDE4NRHYQEZZFKIOIMW53DPIUWLNA6GAYK74H5` | Strategy CID registry, ELO-weighted subscriptions |
| Neural Sentinel | `CCP5OY3TTDVIREQYGOUZUXS2MZJO3LLJD6Z22Z3VROWFCPJAON22WPY2` | Agent performance reporting, score storage |
| Settlement Hub | `CANZP2OJUS2Y5VXE4YHRR75LE2WKE7QTJOCCWENR7X65DWE6QEJZV6KS` | MPP session escrow (open/settle/close) |
| Skill Vault | `CC5HUV5RA2LHFD7IXFSROB7OO4BXCWHH42Y2KY6SWRKS3DELZ2GSJ2UW` | x402 payment gate, atomic skill unlock |

---

## 4. Institutional API Layer

### 4.1 Overview

The Nirium API (`api.nirium.xyz`) exposes 44 endpoints across 11 categories, deployed on Railway with Express 5 and Node 20.

**Authentication tiers:**

| Tier | Rate limit | Access |
|---|---|---|
| Public | 60 rpm | health, demo, signals/recent, skills list |
| Sandbox | 30 rpm / 1K req/day | all public + sandbox endpoints |
| Institutional | 300 rpm / 10K req/day / 500 strategies/day | all endpoints |
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

**Auth:** `/api/auth/token`, `/api/auth/keys` (GET/POST/DELETE)

**Market:** `/api/market`, `/api/tickers`, `/api/stats/global`, `/api/strategies`, `/api/revenue`

**Execution:** `/api/execute` (real, requires x-stellar-account), `/api/execute-demo`

**Loop:** `/api/loop/start`, `/api/loop/stop`, `/api/loop/scan`, `/api/loop/status`

**Webhooks:** `/api/webhooks` (GET/POST), `/api/webhooks/:id` (DELETE), `/api/webhooks/:id/test`

**Subscriptions:** `/api/subscriptions` (GET/POST), `/api/subscriptions/:id` (DELETE), `/api/subscriptions/stats`

**Skills:** `/api/skills` (GET), `/api/skills/marketplace`, `/api/skills/install`, `/api/skills/:slug` (DELETE), `/api/skills/:slug/actions/:action`

**WebSocket:** `wss://api.nirium.xyz/ws/signals?token=JWT`

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

**Use case:** Remittance operator delegates $10K USDC for nightly FX rebalancing. Agent executes cross-border swaps within budget, unspent funds auto-return at end of session.

**SDK:** `agent.initMpp(config); const data = await agent.mppFetch('/api/v1/mpp/signals');`

### 5.3 MCP Server

The `@nirium/mcp` package implements a Model Context Protocol server exposing Nirium as tools for Claude Desktop, Cursor, VS Code Copilot, and any MCP-compatible AI agent.

Free tools: `get_market_state`, `get_loop_status`, `start_loop`, `stop_loop`, `execute_demo`, `get_system_health`

Paid tools (x402): `get_premium_signals` ($0.02), `get_premium_market` ($0.05), `execute_paid_strategy` ($0.25)

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

**2. Swarm Orchestration:** Dynamically activates or suppresses agent classes based on market regime (high volatility → risk protection agents active; deep liquidity → arbitrage agents racing; macro event pending → execution pause).

**3. Audit Log Generation:** Translates raw XDR transactions to boardroom-readable summaries in real time. Compliance teams audit every agent action without blockchain expertise.

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
5. IPFS CID generated via Pinata for immutable long-term storage
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

Nirium's path arbitrage engine operates on Stellar SDEX — the deepest on-chain order book for XLM/USDC. Total corridor cost: 0.8% (0.3% AMM hop × 2 + 0.2% slippage). Gas: ~$0.000001 per operation.

For institutional clients: fee structure is 0.5% B2B (Remzy rate) to 0.8% (external clients), invoiced monthly as software license — not financial intermediation.

---

## 9. Security

### 9.1 JARGUS Audit v2.0 (April 2026)
Internal security framework (Kali Linux). Result: **78/78 PASS, 0 critical, 0 high.**

| Pillar | Score |
|---|---|
| Soroban/Rust smart contracts | 20/20 |
| OWASP API Top 10 | 10/10 |
| Frontend & obfuscation | 12/12 |
| Supply chain & CI/CD | 8/8 |
| Regulatory compliance (MX/US) | 6/6 |
| JARGUS full-spectrum | 22/22 |

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
Formal third-party audit planned for Month 3 of Isacap JV:
- Soroban layer ($25K–$30K): SCF Audit Bank eligible (95% subsidy)
- Server/API pen test ($10K–$15K): funded by Isacap

### 9.5 Pending Pre-Mainnet (non-blocking for Testnet)
SEP-10, SEP-24, SEP-31, SEP-12/Travel Rule, Bug Bounty, Proof of Reserves, Sanctions Screening (Chainalysis/Elliptic).

---

## 10. SDKs

Both SDKs verified 33/33 endpoints against live API (April 2026, v0.5.0).

### TypeScript (Node.js ≥ 18)
```bash
npm install nirium
```
```typescript
import { Agent } from 'nirium';
const agent = new Agent({ apiKey: 'sk_inst_...', baseUrl: 'https://api.nirium.xyz' });

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
agent = Agent(api_url="https://api.nirium.xyz", api_key="sk_inst_...")

await agent.get_market()
await agent.execute("path-arb", "XLM-USDC", {"amount": 5000}, stellar_account="G...")

@agent.on("signal")
async def on_signal(data): print(data['signal_type'])
await agent.subscribe()
```

Full documentation: [SDKs.md](SDKs.md)

---

## 11. Infrastructure

### 11.1 Agent API — Railway
- **Runtime:** Node 20, nixpacks
- **Entrypoint:** `packages/agent/dist/src/scripts/master.js`
- **Flags:** `--dns-result-order=ipv4first --max-old-space-size=2048`
- **Health:** `GET /health` (300s timeout)
- **Port:** 3002

### 11.2 Frontend — Vercel
- **Framework:** Next.js 15.1.7 / React 19
- **Deploy:** `pnpm deploy` (CLI only — git auto-deploy disabled)
- **Domain:** nirium.xyz

### 11.3 Database — Supabase
Key tables: `agent_logs`, `auth_keys`, `nirium_swarm_agents`, `sandbox_accounts`, `webhooks`, `user_signatures`, `security_events`

---

## 12. Economic Model

**Protocol fees (software licensing, not financial intermediation):**
- Variable license: 0.5% volume (Remzy/anchor client) — 0.6–0.8% (external clients)
- Agent deployment: 12.5 XLM one-time
- x402 API calls: $0.02–$0.25 USDC per request
- Total corridor cost for clients: 1.3% (Remzy) — 1.4–1.6% (external)

**Legal classification (software-only):**
All revenue streams classified as software licensing under LRITF Art. 22, LMV Arts. 225–226, Banxico Circular 4/2019. Holding never touches transactional flow. Isacap/Remzy is the sole regulated operator.

**3-Year Projections:**
- Scenario A (Pedro ecosystem only): ~$993K USD cumulative
- Scenario B (Pedro + external, 18% CNBV market): ~$1.45M USD cumulative
- Break-even: Month 6–7 post Go-Live

---

## 13. Conclusion

Nirium is the infrastructure layer where institutional DeFi and the agentic economy converge on Stellar. Institutions get automated treasury operations with full auditability and compliance-ready output. AI agents get a protocol they can pay into and execute against without human intermediation.

The protocol's deployment on Stellar Testnet — 44 API endpoints, 30 autonomous agents, 6 Soroban contracts, x402/MPP payment protocols, multi-LLM support, published SDKs, and JARGUS-verified security — establishes the architectural foundation for mainnet readiness pending formal third-party audit.

---

*Nirium Protocol — experimental software. Not financial advice. Not an investment product. Testnet operations only.*
