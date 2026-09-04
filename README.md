# Nirium Protocol: Institutional Infrastructure on Stellar

[![CI](https://github.com/Eras256/Nirium/actions/workflows/ci.yml/badge.svg)](https://github.com/Eras256/Nirium/actions/workflows/ci.yml)
[![Security Gate](https://github.com/Eras256/Nirium/actions/workflows/security-gate.yml/badge.svg)](https://github.com/Eras256/Nirium/actions/workflows/security-gate.yml)

![Network](https://img.shields.io/badge/Network-Testnet%20%2B%20Mainnet%20(partial)-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-yellow?style=for-the-badge)
![API](https://img.shields.io/badge/API-86%20Endpoints-blue?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-Internal%20Audit%20Complete%2C%20Independent%20Pending-blue?style=for-the-badge)
![Instaward](https://img.shields.io/badge/Instaward%20%231%20%26%20%232-Delivered-blueviolet?style=for-the-badge)
![x402](https://img.shields.io/badge/x402-In%20Production-teal?style=for-the-badge)
![MPP](https://img.shields.io/badge/MPP-Charge%20In%20Production-teal?style=for-the-badge)
![CoC](https://img.shields.io/badge/Stellar%20CoC-Aligned-green?style=for-the-badge)
![SCF](https://img.shields.io/badge/SCF-Instaward%20Active-success?style=for-the-badge)

---

> **⚠️ MANDATORY LEGAL DISCLAIMER**
>
> Nirium is **experimental software**. Nirium's own **NiriumVault** treasury contract remains on **Stellar Testnet, audit-gated**: no independent third-party audit has occurred yet, and no real client funds ever reach that contract.
>
> The **autonomous treasury node runs on mainnet over a DeFindex vault the client owns**: a third-party contract audited by OtterSec, not ours. Nirium holds only the vault's `RebalanceManager` role, which by the contract's own design cannot withdraw funds, change roles, or pause anything. Autonomous rebalancing on mainnet is **invite-only** while a legal review closes. A separate set of receive-only nodes (x402 micropayments, MPP Charge, IPFS audit anchoring, non-custodial Payouts, Reporting) also run in **mainnet early access**, where real USDC moves under the client's own wallet signature. **Nirium never custodies funds.**
>
> **Nirium is not financial advice. It is not an investment product. It does not guarantee yields, dividends, asset appreciation, or returns of any kind.** Reference rate data shown on the dashboard (Blend supply rate, Etherfuse CETES rate) is **public protocol information only**, not projections or promises of return. XLM and Stellar assets are volatile. Smart contracts carry risk even when audited. Use at your own risk.
>
> This project does not use grant funds for speculation, trading, investment advice, or marketing of products promising interest or appreciation, in accordance with the [Stellar Community Fund Official Rules](https://stellar.gitbook.io/scf-handbook/scf-awards/official-rules-for-submissions).

---

**Nirium is an Infrastructure-as-Software provider**: autonomous treasury and agentic payments (x402/MPP) on Stellar/Soroban, not a consumer dashboard.

**The hero product is the rail, not the data.** An 86-endpoint API and TypeScript/Python SDKs that let any B2B fintech both *pay* for machine-to-machine services and *charge* for its own, plus autonomous execution nodes that run treasury operations 24/7 without manual CFO intervention.

### Execution Nodes

| # | Node | Status | Network | What it does |
|---|---|---|---|---|
| 1 | **Settlement** (x402 + MPP Charge) | ✅ Active | both | Per-request micropayments for AI agents. Pay for others' APIs with `initX402()` today. Charging for your own with `x402Serve()` as a third-party facilitator is invite-only while legal review closes — same gate as Treasury and Payouts. |
| 2 | **Audit Trail** | ✅ Active | both | Evidence anchored to IPFS as immutable receipts, optionally **signed by the agent that produced it** (ed25519 over a domain-separated statement), so the CID proves not just *that* a fact is unaltered but *who declared it*. |
| 3 | **Payouts** | ✅ Active | both | Non-custodial batch disbursements, up to 100 recipients per transaction. Mainnet is invite-only; independent service payments only (contractors, freelancers, B2B); never subordinate-employee salary. |
| 4 | **Treasury Rebalance** | ✅ Active | both | Moves idle capital into a CETES strategy and back, on its own, over a **DeFindex vault the client owns**. Live on mainnet, invite-only during legal review. |
| 5 | **Reporting** | ✅ Active | both | Institutional-format summaries and CSV/JSON exports over anchored receipts. Read-only; regulatory filings remain the client's responsibility. |
| 6 | **Compliance Sentinel** | 🟡 Proposed | testnet | Not built. The intent is to validate every proposed transfer against a policy before it is signed. What exists today is the agent-to-agent x402 client pattern in `coordinationService`; the auditor endpoint it calls does not exist yet, and the call fails open by design so a downed auditor never blocks execution. Do not rely on this as a control. |

The framework supports up to 10 nodes per vault. Live catalog: `GET /api/nodes`.

---

## What runs where, and how to check it yourself

Every claim below is a link. Nothing here asks to be believed.

### Mainnet (real value)

| What | Status | Verify |
|---|---|---|
| API box | Live, **receive-only, holds no signing key**, enforced at startup | [`/health`](https://nirium-agent-mainnet.fly.dev/health) · [`/api/nodes`](https://nirium-agent-mainnet.fly.dev/api/nodes) |
| x402: first real payment | Settled 9 Jul 2026 | [`3134a51c…7558bc`](https://stellar.expert/explorer/public/tx/3134a51c66091fd7fbd85b38a4a6ec6cd432bb92c2450eac84ea7855cb7558bc) |
| x402: paid from a social login (Pollar) | Settled 5 Aug 2026, holding **zero XLM** end to end | [`e4fa3df9…16ed9`](https://stellar.expert/explorer/public/tx/e4fa3df9cb225a4d7f64dd0082eb38218ada4b4af3378f288989a5d4b1116ed9) |
| `nirium-pollar-adapter`: end-to-end from a clean npm install | Settled 27 Jul 2026, standard Stellar keypair signer (the pluggable-signer test, not Pollar-specific) | [`48136451…3795e`](https://stellar.expert/explorer/public/tx/4813645165d15af1e503d66ef84d826e83fff235d4f98c3f6eba8a4e7c83795e) · receipt [`QmRzgTtVPg…`](https://gateway.pinata.cloud/ipfs/QmRzgTtVPg5a5pipi8npfpXt81xiGG5Ue5Rygd6Fye1aon) |
| MPP Charge | Live: `market` charges and delivers | [`/api/v1/mpp/info`](https://nirium-agent-mainnet.fly.dev/api/v1/mpp/info) |
| Treasury: vault deployed | 6 Aug 2026, **client signs** | [`93ff6284…78416`](https://stellar.expert/explorer/public/tx/93ff6284cdf03706624c88434a79fba1b213ee547f58e09a9248f75373178416) |
| Treasury: autonomous invest | 6 Aug 2026, **the agent signs** | [`82d73f53…6b3d4`](https://stellar.expert/explorer/public/tx/82d73f537e907140367f9343f63a36704c74a5286aced7a938cee8fffb56b3d4) |
| Treasury: the vault itself | Client-owned, roles readable on-chain | [`CAMDXG6L…K57MH`](https://stellar.expert/explorer/public/contract/CAMDXG6L4LXLXXV675KZSHM3BMSETZ4NVMC7JYIQCZ2JTG54OMSK57MH) |
| Payouts | Live, **invite-only** (tier-gated + terms acceptance) | [`/api/payroll/info`](https://nirium-agent-mainnet.fly.dev/api/payroll/info) |
| Trustless Work escrow: full cycle, 3 Sep 2026 | deploy → fund → approve → release, real 0.50 USDC, **self-directed** (one key, every role, no third-party client). Proves the mechanism — not a decision to open this flow to Payouts production, which stays behind legal review | [`4110dd16…12aefe84`](https://stellar.expert/explorer/public/tx/4110dd16df6c7cdaf50d89f7402e3e51de0ac4f63255f6601e800e3912aefe84) → [`7b181a13…451c09c`](https://stellar.expert/explorer/public/tx/7b181a13160d6d7170f78ba9a4e15309cc0a8f6e20a1db01adfcdb667451c09c) → [`a3aa35a2…4096ca5`](https://stellar.expert/explorer/public/tx/a3aa35a272774547d3ca4ce5a32e361641daac6cf829ecf8951b83a194096ca5) → [`0c533088…a8192b`](https://stellar.expert/explorer/public/tx/0c533088ab6326a78b9f79c197b7636ca4662a0d72562968ddea37f370a8192b) — receiver balance moved by exactly 0.4985 USDC, 0.50 minus Trustless Work's fixed 0.3% fee |
| Audit + Reporting | Live | [`/api/audit/info`](https://nirium-agent-mainnet.fly.dev/api/audit/info) · [`/api/reporting/info`](https://nirium-agent-mainnet.fly.dev/api/reporting/info) |
| Autonomous rebalancing | **Invite-only** while a legal review closes | enabling a vault takes a commit to this repo, with author and date |
| **NiriumVault (our own contract)** | ❌ **Not on mainnet**: audit-gated | n/a |
| **MPP Channel mode** | ❌ **Not on mainnet**: deposit contract = temporary custody, same audit gate | [`channel.enabled: false`](https://nirium-agent-mainnet.fly.dev/api/v1/mpp/info) |
| **LCP legal layer** | ❌ Off: terms pending legal review | n/a |

### Testnet (no real value, where the loop and the key live)

| What | Status | Verify |
|---|---|---|
| API box | Live, full autonomous loop, agent holds a key | [`/health`](https://nirium-agent.fly.dev/health) · [`/api/loop/status`](https://nirium-agent.fly.dev/api/loop/status) |
| NiriumVault | Live: treasury, delegation, flash loans, 2-of-3 multisig | [`CBTWMZCG…AWSZU`](https://stellar.expert/explorer/testnet/contract/CBTWMZCG3P72EHFAQ4ZLSEBIOFYJC244H5J6DHZIJ56FHFWJ2CFAWSZU) |
| NiriumProtocol | Live: ELO, marketplace, scoring, skill gate | [`CC2TU5BD…FR5L5NR5`](https://stellar.expert/explorer/testnet/contract/CC2TU5BDTKTPRRRQPEF77I54XYHFQ25XGIRO2TCWKSR7NRJDFR5L5NR5) |
| Policy Account | Live: one `CallContract` rule, **no** `Default` rule | [`CCZW2WIF…B5LML`](https://stellar.expert/explorer/testnet/contract/CCZW2WIFAD7OQX35U5AILTNF32TCHQUYVPNB32GGKEKKPII2HF7B5LML) |
| Treasury: full cycle, 5 Aug 2026 | deploy → deposit → autonomous invest | [`a96eec81…a2662`](https://stellar.expert/explorer/testnet/tx/a96eec81347731ced1505cd20be7bbc92d66fbc88c8e12e5376d685ff82a2662) → [`2c4df5a8…2c3b7`](https://stellar.expert/explorer/testnet/tx/2c4df5a85de8357c1f4868ddbb88aa123db04fc80967291fe3f06e9a9332c3b7) → [`c53d4746…52ed3`](https://stellar.expert/explorer/testnet/tx/c53d474658898af7ebbb84d17845902572147cfe1fb72965833e3d4cf7552ed3) |
| Autonomous rebalancing | Live and open: this is the demonstration | [`/api/loop/status`](https://nirium-agent.fly.dev/api/loop/status) |
| x402 `signals` / `execute` | Live and paid: the loop and the key exist here | [`/api/v1/premium/signals`](https://nirium-agent.fly.dev/api/v1/premium/signals) → `402` |

### Signed audit evidence (anyone can verify with only the CID)

Each document carries an ed25519 signature over `nirium-audit-v1:<content_sha256>`, so the CID proves not only that the fact is unaltered, but **who declared it**.

| Document | CID |
|---|---|
| Milestone attestation | [`QmYNvmR7C5Fivm7G1THbo5qd7jCp1nYoWMDkbmBmHibYvk`](https://gateway.pinata.cloud/ipfs/QmYNvmR7C5Fivm7G1THbo5qd7jCp1nYoWMDkbmBmHibYvk) |
| Dispute attestation | [`QmSSZdtt3dQ8BqUm62zrKQ85E4BUHYiVfvDgZmHfJsqU1U`](https://gateway.pinata.cloud/ipfs/QmSSZdtt3dQ8BqUm62zrKQ85E4BUHYiVfvDgZmHfJsqU1U) |

> **The two networks are not two copies of the same thing.** Testnet is where the agent holds a key and rebalances on demand. That is the demonstration. Mainnet is where real value moves, and there the API box holds **no key at all**: a separate process with no HTTP surface signs the rebalances, and every fund movement a client makes is signed by the client. Never quote a testnet figure as if it were mainnet: deploying a vault costs ~0.038 XLM on testnet and ~1.4 XLM on mainnet, 47× more.

---

## The Treasury Node: how an agent moves someone else's money without being able to take it

This is the part that took the longest to get right, and it is worth stating precisely because the safety does not come from our promises.

The client deploys a **DeFindex vault** (a third-party Soroban contract) with their own signature. That vault has four roles:

| Role | Held by | Can do |
|---|---|---|
| Manager | **the client** | everything: pause, rescue, change roles |
| Emergency Manager | **the client** | emergency stop |
| Fee Receiver | **the client** | collect the vault fee (we set it to 0) |
| **RebalanceManager** | **Nirium** | `rebalance()` and nothing else |

`rebalance()` accepts four instructions: `Invest`, `Unwind`, `SwapExactIn`, `SwapExactOut`. **None of them takes a destination address**: `to` is hardcoded to the vault itself in every branch. Withdrawal is not *forbidden*, it is **inexpressible**. This was verified by reading DeFindex's source (not its docs) and confirmed by submitting real transactions: Soroban's simulator *records* `require_auth()` without verifying signatures, so simulating gives a false pass.

The client can call `set_rebalance_manager` and remove us unilaterally, without notice, and we cannot stop them.

**Verified on mainnet, with real funds:**

| Step | Who signs | Transaction |
|---|---|---|
| Deploy vault | the client | [`93ff6284…78416`](https://stellar.expert/explorer/public/tx/93ff6284cdf03706624c88434a79fba1b213ee547f58e09a9248f75373178416) |
| Invest into strategy | **the agent** | [`82d73f53…6b3d4`](https://stellar.expert/explorer/public/tx/82d73f537e907140367f9343f63a36704c74a5286aced7a938cee8fffb56b3d4) |

That second transaction is the whole argument turned into evidence: the agent moved someone else's funds, and the contract gave it no way to take them out.

**Audit scope, stated honestly:** the vault is DeFindex, audited by OtterSec (March 2025, 16 findings, all 13 vulnerabilities resolved), running a Blend V2 strategy (3 independent audits). The deployed WASM matches the public 1.0.0 release. What is *not* covered is the Etherfuse pool as an external dependency and each instance's configuration. **Fees:** Nirium takes no percentage of your capital; DeFindex, the protocol behind the vault, takes 20% of the yield it generates.

The mainnet signer is a **separate process with its own key and no HTTP surface**: the mainnet API box holds no signing key at all, by design, and enforces it at startup.

---

## Market Traction: Developer Adoption & Verifiable On-Chain Activity

Traction is **self-generated and independently verifiable**. It does not depend on third-party announcements:

- **Published SDKs** on npm and PyPI (`nirium`) with recorded downloads across multiple versions.
- **Live autonomous agent** running 24/7 on Stellar Testnet, every rebalance verifiable on Stellar Expert.
- **Real mainnet activity**: x402 micropayments settling in production, and a full treasury cycle executed with real funds (hashes above).
- **Open API + free sandbox keys**, so any developer can integrate and exercise the contracts directly.
- **Real upstream engagement**: 10 reported issues/PRs across five repos
  (x402-foundation/x402, stellar/stellar-dev-skill, OpenZeppelin/stellar-contracts,
  stellar/stellar-mpp-sdk, stellar/smart-account-kit) —
  2 merged: stellar/stellar-dev-skill#96 is our own fix, written and merged;
  x402-foundation/x402#3171 is a bug we reported that an external contributor,
  JasonColapietro, wrote and merged the fix for as #3180.
  stellar/stellar-dev-skill#97 went through real, multi-round review from the
  Foundation's own bot, and that review found a real security bug pattern —
  a paid route that could silently serve for free instead of charging when
  its payment middleware wasn't initialized. We confirmed and fixed the same
  pattern in our own production MPP and x402 middleware, both of which now
  fail closed instead of open; the finding and our confirmation are in the
  #97 thread itself, not a doc-only correction. (Commit hashes for that fix
  live in our private monorepo and aren't independently checkable, so we're
  not citing them here — the public thread is the verifiable part.)
  OpenZeppelin/stellar-contracts#840 now has a proposed fix we
  wrote and submitted (#844, open, unmerged, pending maintainer review).
  x402-foundation/x402#3148 remains open, awaiting response.
  stellar/stellar-mpp-sdk#68 reports two invalid mainnet SAC contract addresses
  (USDC_SAC_MAINNET, XLM_SAC_MAINNET) that fail Stellar's own StrKey validation —
  a proposed fix we wrote and submitted as #69 (open, unmerged, pending
  maintainer review).
  Ahead of Stellar Protocol 28 (mainnet vote September 16, 2026), we reproduced
  two real breaking-change gaps against the actual compiler/runtime, not just
  the upgrade notes: we opened OpenZeppelin/stellar-contracts#865, a non-exhaustive
  match in production code that compiles clean today but fails to build
  (`error[E0004]`, reproduced against both SDK versions) the day the crate's own
  soroban-sdk pin moves to 28.x; and we opened stellar/smart-account-kit#7, an
  uncapped peer-dependency range that lets a routine install resolve an
  `@stellar/stellar-sdk` version whose API removed a method that library calls
  in 9+ production files — a runtime crash, live today, independent of the
  mainnet vote date. Both open, unmerged, pending maintainer review.
- **A real integrator's own words**, not solicited copy:

  > "We verify everything a 402 claims, whoever it comes from, and with Nirium it all checked out... And when things did come up, they got resolved fast. They warned us about a risk in our integration — that the collection account rotated on mainnet — before it bit us, and the bugs we reported were fixed the same day, not in the next release. That tells me more than any number on a landing page."
  > — Fer, AgentLedger

We provide the middleware; regulated operators (e.g. Etherfuse) hold the licenses and execute settlement. We are open to integration conversations with regional fintechs, but make **no claim of signed pilots**.

---

## Architecture

```
Fintech / Institution (B2B / A2A)
        |
        v
  [Next.js 15 Dashboard: nirium.xyz]
  [i18n: EN / ES, 27 routes]
        |
        v
  [Agent API: dual network, 86 endpoints]
        |-- nirium-agent.fly.dev          (testnet, full autonomous loop, agent holds a key)
        |-- nirium-agent-mainnet.fly.dev  (mainnet, receive-only, NO signing key by design)
        |-- Auth (JWT / API key / sandbox tiers)
        |-- legalShield middleware (SCF CoC compliance)
        |-- x402 + MPP payment middleware
        |-- Sliding-window rate limiting (300 rpm institutional)
        |-- AML screening + domainLock + obfuscation
        |
        v
  [Autonomous Execution Layer]
        |-- Autonomous node: LLM proposes, deterministic fallback decides if it stalls
        |-- Mainnet rebalancer: separate process, own key, no HTTP surface,
        |                        deterministic rule with no model in the signing path
        |-- Composable framework: up to 10 Execution Nodes per vault
        |
        v
  [Soroban Contracts]
        |-- Testnet: NiriumVault      (treasury, flash loans, delegation, 2-of-3 multisig)
        |-- Testnet: NiriumProtocol   (ELO reputation, strategy registry, scoring, skill gate)
        |-- Testnet: Policy Account   (scopes the agent key to ONE vault: one CallContract
        |                              rule, no Default rule; that absence IS the mechanism)
        |-- Mainnet: DeFindex vault   (third-party, OtterSec-audited, owned by the client;
        |                              Nirium holds RebalanceManager only)
        |
        v
  [Supabase] ← logs, auth_keys, webhooks, payroll_runs, treasury_vaults, subscriptions
  [IPFS / Pinata] ← immutable receipts; daily digest of confirmed executions
```

---

## Core Features

### Institutional API (86 endpoints: 85 HTTP + 1 WebSocket)

Multi-tier authentication with sandbox accounts, self-service API keys (`/keys`, wallet-signed via SEP-53), tiers (free/sandbox/institutional/enterprise), and JWT for WebSocket. Full RBAC, sliding-window rate limiting, AML checks, and domain lock.

| Access level | Endpoints |
|---|---|
| Public (no key) | health, loop/status, execute-demo, signals/recent, skills, nodes, netdiag |
| Protected (API key) | execute, market, tickers, stats, loop control, webhooks, subscriptions, skills/install, payroll/\*, treasury/\* |
| Paid (x402 / MPP) | premium/\*, mpp/\* |
| WebSocket (JWT) | `/ws/signals`, real-time signal stream |
| Admin only | system/health, config/llm |

**Endpoints charge where the capability exists, not where it reads better.** The mainnet box holds no signing key and runs no autonomous loop, so `premium/signals` and `premium/execute` return `501` there instead of charging for an empty answer. `premium/market` charges and delivers on both networks.

Full specification: [API_DOCUMENTATION_OPENAPI.yaml](API_DOCUMENTATION_OPENAPI.yaml)

### Autonomous On-Chain Execution (Soroban)

Strategies dispatched to the NiriumVault contract on testnet, all verifiable on Stellar Expert:

- `flash-loan-arb` / `flash-loan` → `flash_loan_execute`: atomic flash loans with automatic revert on non-repayment
- `path-arbitrage` / `path-vector` → `execute_path_arbitrage`: path payment discovery for XLM-USDC corridors
- `cross-dex` → `execute_cross_dex`: cross-venue routing
- `blend-yield` → `execute_blend_yield`: non-custodial allocation on Blend Protocol
- `soroswap-swap` → `execute_soroswap_swap`: multi-hop execution with minimum-slippage enforcement

The mainnet treasury path does **not** go through this router. It goes through the client-owned DeFindex vault described above.

### x402 + MPP + MCP

Any AI agent (Claude, GPT, custom) can access Nirium's premium data **per request** by paying USDC on Stellar: no account, no subscription. Adopted on launch day alongside emerging industry standards:

- x402 integrated April 2, 2026: same day as the Linux Foundation x402 Foundation launch
- MPP integrated April 3, 2026: 16 days after the spec was published (March 18, 2026)

**Both directions are supported.** `initX402()` pays for someone else's API, live today. `x402Serve()` charges for yours — third-party facilitator use is invite-only while legal review closes, same gate as Treasury and Payouts:

```typescript
import { x402Serve } from 'nirium';

app.use('/premium', x402Serve({
    payTo: 'G...',
    routes: { 'GET /signals': '$0.02' },
}));
```

**MPP runs in Charge mode only**, on both networks: the client signs a complete USDC transfer inside the request, the server validates it by simulation and broadcasts it: no external facilitator. MPP's Channel mode is implemented but **disabled**, because its setup phase deploys a channel contract holding a deposit, which is temporary custody and falls under the same audit gate as our own vault.

The MCP server exposes Nirium as **25 tools** for Claude Desktop, Cursor, and any MCP-compatible IDE: 10 free, 9 authenticated, 1 informational, 3 paid over x402, 2 paid over MPP.

### Audit Trail Engine

```
Agent action or third-party event
    → SHA-256 content hash
    → optional agent attestation: ed25519 signature over
      "nirium-audit-v1:<content_sha256>"  (domain-separated on purpose:
      without it, a signature made for a login could be replayed as evidence)
    → pinned to IPFS, CID returned
    → verifiable by anyone holding only the CID
```

An invalid signature returns **400 and nothing is anchored**: IPFS has no delete, so a false attestation would be permanent. Third-party apps anchor through `POST /api/audit/log`. Anchor **hashes, not raw personal data**.

### Live Market Ticker (Reference Data)

> *Public protocol information. Not investment advice and not a return projection.*

| Ticker | Source | Description |
|---|---|---|
| **XLM/USDC** | Reflector → CoinGecko → Stellar Expert | Multi-tier oracle price feed |
| **SDEX spread** | Stellar Horizon orderbook | Live XLM/USDC spread in basis points |
| **Blend rate** | Blend Protocol on-chain | Liquidity reference rate |
| **CETES rate** | Etherfuse | Tokenized CETES reference rate (~5.57%) |
| **Base fee** | Stellar Horizon | Live network base fee |

### Published SDKs (npm + PyPI)

| SDK | Package | Version | Install |
|---|---|---|---|
| TypeScript | [nirium (npm)](https://www.npmjs.com/package/nirium) | 0.13.4 | `npm install nirium` |
| Python | [nirium (PyPI)](https://pypi.org/project/nirium/) | 0.9.0 | `pip install nirium` |

> The two SDKs have identical **client** surfaces. TypeScript is one minor ahead because `x402Serve()` is Express middleware: server-side Node, with no meaningful Python equivalent. The version gap is the honest signal, not a lag.

| MCP server | [nirium-mcp (npm)](https://www.npmjs.com/package/nirium-mcp) | 0.6.0 | `npx nirium-mcp` |
| Pollar adapter | [nirium-pollar-adapter (npm)](https://www.npmjs.com/package/nirium-pollar-adapter) | 0.4.1 | `npm install nirium-pollar-adapter` |

This repository is a personal mirror. The org-owned source is [nirium-protocol/nirium-sdk](https://github.com/nirium-protocol/nirium-sdk) — start there for issues, PRs and the canonical package sources; the Pollar-specific adapter has its own repo at [nirium-protocol/nirium-pollar-adapter](https://github.com/nirium-protocol/nirium-pollar-adapter).

```typescript
import { Agent } from 'nirium';
const agent = new Agent({ apiKey: 'sk_inst_...', baseUrl: 'https://nirium-agent.fly.dev' });

const market = await agent.getMarket();
const nodes = await agent.getNodes();
await agent.anchorAuditRecord({ hash: '...' });
agent.subscribe(signal => console.log(signal));
```

```python
from nirium import Agent
agent = Agent(api_url="https://nirium-agent.fly.dev", api_key="sk_inst_...")

market = await agent.get_market()
await agent.anchor_audit_record(hash="...")
async for signal in agent.listen():
    print(signal)
```

See [SDKs.md](SDKs.md) for full SDK documentation.

---

## Deployed Contracts

| Contract | Network | Contract ID | Function |
|---|---|---|---|
| **NiriumVault** (Vault ID 1 active) | Testnet | `CBTWMZCG3P72EHFAQ4ZLSEBIOFYJC244H5J6DHZIJ56FHFWJ2CFAWSZU` | Core treasury: vaults, agent delegation, strategy execution, flash loans, 2-of-3 multisig |
| **NiriumProtocol** | Testnet | `CC2TU5BDTKTPRRRQPEF77I54XYHFQ25XGIRO2TCWKSR7NRJDFR5L5NR5` | Unified registry: ELO reputation, strategy marketplace, agent scoring, skill gate (x402) |
| **Policy Account** | Testnet | `CCZW2WIFAD7OQX35U5AILTNF32TCHQUYVPNB32GGKEKKPII2HF7B5LML` | Scopes an agent key to a single vault: one `CallContract` rule, **no** `Default` rule |
| **DeFindex vault** (reference) | Mainnet | `CAMDXG6L4LXLXXV675KZSHM3BMSETZ4NVMC7JYIQCZ2JTG54OMSK57MH` | Third-party, OtterSec-audited, owned by its deployer; Nirium holds RebalanceManager only |

Verifiable at [Stellar Expert](https://stellar.expert/explorer/public).

---

## Side Projects

### /build: Startup Ideas Hub
Interactive dashboard with 12 production-ready startup ideas buildable on the Nirium API and SDKs, with code examples in TypeScript, Python, cURL, and MCP.

Live: [nirium.xyz/build](https://nirium.xyz/build)

---

## Quick Start

### Requirements
- Node.js 20+, pnpm 9+
- [Freighter Wallet](https://freighter.app/) for dashboard interactions

### Run locally
```bash
pnpm install
pnpm dev          # web (port 3000) + agent API (port 3002) in parallel
```

### Deploy
```bash
pnpm ship         # → vercel --prod (frontend)
fly deploy        # agent API → Fly.io (run from the repo root)
```

### SDK quick start
```bash
npm install nirium       # TypeScript SDK
pip install nirium       # Python SDK
```

---

## Project Structure

```
Nirium/                        (public repo)
├── apps/web/                  → Next.js 15 dashboard (nirium.xyz), 27 routes, i18n (EN/ES)
├── packages/sdk/              → TypeScript SDK v0.13.4 (npm: nirium)
├── packages/sdk-python/       → Python SDK v0.9.0 (PyPI: nirium)
├── packages/contracts/        → Soroban contracts (Rust), 2 contracts, 5 fuzz targets
├── packages/policy-account/   → Soroban policy account (Rust), scopes a key to one vault
├── packages/pollar-adapter/   → nirium-pollar-adapter v0.4.1, sign x402 with a social login
├── .github/workflows/         → CI, release, security-gate, desktop release
│
├── packages/agent/            → [private] Express 5 API, 86 endpoints (85 HTTP + 1 WebSocket)
├── packages/mcp/              → [public] MCP server v0.6.0, 25 tools
├── packages/cli/              → [public] CLI v1.1.1 (npm: nirium-cli)
├── packages/desktop/          → [private] Tauri desktop wrapper
```

---

## Security

- **Internal security review**: 83/83 vectors checked, 0 critical, 0 high
- Methodology: static analysis (`cargo clippy`, grep), dynamic analysis, full-spectrum pentesting, `cargo audit` + `pnpm audit`, fuzz testing (5 cargo-fuzz targets), manual code review
- A formal independent audit is planned before any mainnet deployment of **NiriumVault**. The mainnet nodes running today do not depend on it: they either never touch funds (x402, MPP, audit, reporting), or the client signs every fund movement themselves (Payouts), or they operate a **third-party contract already audited by OtterSec** in a role that cannot withdraw (Treasury).
- The mainnet API box holds **no signing key**, enforced at startup. The autonomous mainnet signer is a separate process with no HTTP surface.
- See [SECURITY.md](SECURITY.md) for responsible disclosure, and [INTERNAL_SECURITY_AUDIT.md](INTERNAL_SECURITY_AUDIT.md) for the full 83-vector report.

---

## Stellar Code of Conduct Alignment

Nirium operates in alignment with the [Stellar Code of Conduct](https://stellar.org/foundation/code-of-conduct).

| Principle | Nirium status |
|---|---|
| Stellar must be **core and valuable**, not auxiliary | ✅ Soroban contracts, SDEX, Blend, DeFindex, x402, MPP; Stellar is the execution layer |
| No speculation, wash trading, or insider trading with grant funds | ✅ Grant funds allocated to development, not trading |
| No investment advice or yield promises | ✅ Prominent disclaimer; rates displayed as protocol reference data only |
| No marketing promising interest, dividends, or appreciation | ✅ Language focuses on workflow automation, not guaranteed returns |
| Open source, contracts and SDKs publicly available | ✅ Soroban contracts + TypeScript SDK + Python SDK in the public repo |
| Transparency | ✅ Every protocol action auditable on-chain via Stellar Expert |
| Integrity | ✅ No front-running or predatory extraction |
| Safety | ✅ Non-custodial by design; the user is the sole custodian of their keys |

To report violations: [community@stellar.org](mailto:community@stellar.org)

### SCF Instaward

Nirium received Instaward funding via a regional Stellar Ambassador chapter, with full KYC complete (Airtable + Persona + W-8BEN). Instaward (formerly Kickstart) is SCF's early-stage program for prototyping and local validation, up to $15,000 per project. More info: [communityfund.stellar.org](https://communityfund.stellar.org)

---

## Roadmap

| Milestone | Status |
|---|---|
| Core infrastructure + x402/MPP on testnet | ✅ Complete |
| Institutional API (86 endpoints) + published SDKs | ✅ Complete |
| Internal security review (83/83 vectors checked) | ✅ Complete |
| MCP server v0.6.0, 25 tools | ✅ Complete |
| Etherfuse CETES integration (testnet + SPEI sandbox) | ✅ Complete |
| Self-service API keys console (`/keys`, wallet-signed via SEP-53) | ✅ Live |
| Mainnet receive-only nodes (x402, MPP Charge, Audit Trail, Reporting) | ✅ Live, early access |
| Payouts node, non-custodial batch disbursements | ✅ Live, mainnet invite-only |
| `x402Serve()`, charge for your own API in one call | ✅ Shipped in SDK, third-party use invite-only during legal review |
| Agent attestation in the audit trail (signed evidence) | ✅ Shipped |
| Treasury node on mainnet over a client-owned DeFindex vault | ✅ Live, invite-only during legal review |
| Legal opinion on the treasury node (MX + cross-border) | 🔄 In progress: gates opening it beyond invite-only |
| Etherfuse, enterprise KYB onboarding | 🔄 In progress |
| Stellar Community Fund Build Award | 🔄 Submission in active preparation — third-party traction now documented and verifiable: [10-minute reviewer path](https://github.com/nirium-protocol/nirium-sdk/blob/main/docs/FOR-REVIEWERS.md), the GrantFox bounty program, the DeFindex treasury node, and the Pollar integration |
| Formal independent audit of NiriumVault | Planned, ahead of any NiriumVault mainnet deployment |
| NiriumVault mainnet deployment (real treasury funds) | Post formal audit |

---

## External Credentials

- **3rd place, Fintech World Cup Mexico 2026**: Sui Loop (founder's prior project; architecture migrated to Nirium on Stellar)
- **Stellar Scale**: BAF's Stellar acceleration program, unrelated to SCF; 83/100 Bootcamp Impact, active graduate with ongoing mentorship
- **SCF Instaward**: approved and delivered across two awards; full KYC complete (Airtable + Persona + W-8BEN)
- **Stellar House CDMX 2026**: presented to SDF executives, LatAm fintechs, and VCs (invite-only, 3rd edition)
- **Etherfuse**: active technical integration (CETES on testnet + SPEI sandbox); enterprise KYB onboarding in progress

---

## Documentation

| Document | Description |
|---|---|
| [SDKs.md](SDKs.md) | Full TypeScript + Python SDK documentation |
| [API_DOCUMENTATION_OPENAPI.yaml](API_DOCUMENTATION_OPENAPI.yaml) | OpenAPI specification |
| [MCP_INTEGRATION_GUIDE.md](MCP_INTEGRATION_GUIDE.md) | MCP v0.6.0, 25 tools for Claude Desktop / Cursor |
| [INTERNAL_SECURITY_AUDIT.md](INTERNAL_SECURITY_AUDIT.md) | Internal security review report, 83/83 vectors checked |
| [NIRIUM_TECHNICAL_PAPER.md](NIRIUM_TECHNICAL_PAPER.md) | Technical whitepaper |
| [SECURITY.md](SECURITY.md) | Responsible vulnerability disclosure policy |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Open source contribution guide |

---

## Developer Quick Start

```bash
# Testnet: no real funds required
curl https://nirium-agent.fly.dev/health

# The node catalog: no key needed
curl https://nirium-agent.fly.dev/api/nodes

# Sandbox API key (free)
curl https://nirium-agent.fly.dev/api/sandbox/status \
  -H "x-api-key: YOUR_SANDBOX_KEY"

# WebSocket: real-time signals
wscat -c "wss://nirium-agent.fly.dev/ws/signals?token=YOUR_JWT"
```

---

## Contact

| Channel | Link |
|---|---|
| **Website** | [nirium.xyz](https://nirium.xyz) |
| **API (testnet)** | [nirium-agent.fly.dev](https://nirium-agent.fly.dev) |
| **API (mainnet)** | [nirium-agent-mainnet.fly.dev](https://nirium-agent-mainnet.fly.dev) |
| **Build Hub** | [nirium.xyz/build](https://nirium.xyz/build) |
| **X / Twitter** | [@Niriumstellar](https://x.com/Niriumstellar) |
| **SCF / Community** | [communityfund.stellar.org](https://communityfund.stellar.org) |
| **Security** | niriumprotocol@gmail.com |

---

## Legal

Nirium Protocol is open-source and licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), meeting the Stellar Community Fund open-source requirement.

For full details, see [LICENSING.md](LICENSING.md).

This project operates under the [Stellar Community Fund](https://stellar.gitbook.io/scf-handbook) framework and the [Stellar Code of Conduct](https://stellar.org/foundation/code-of-conduct).

---

*Nirium Protocol: experimental software. Not financial advice. NiriumVault is testnet-only and audit-gated; the mainnet treasury node runs over a client-owned, third-party audited DeFindex vault in a role that cannot withdraw. Updated August 28, 2026.*
