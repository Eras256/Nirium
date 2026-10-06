# nirium

Autonomous treasury and agentic-payments infrastructure for **Nirium Protocol** on Stellar/Soroban.

Nirium agents rebalance USDC ↔ CETES (tokenized Mexican T-bills via Etherfuse) 24/7 without human intervention. Built for developers who want to integrate autonomous treasury management, agentic payments (x402 + MPP) — in both directions, paying for other APIs with `initX402()` and charging for your own with `x402Serve()` — and real-time market data into their applications.

## Install

```bash
npm install nirium
```

## Quick Start

```typescript
import { Agent } from 'nirium';

const agent = new Agent({
  apiKey: 'sk_inst_your_key_here',
  baseUrl: 'https://nirium-agent.fly.dev',
});

// Health check
const alive = await agent.ping();
console.log('Agent alive:', alive);

// Real market data from Stellar Horizon
const market = await agent.getMarket();
console.log('XLM Price:', market.xlmPrice);

// Trigger a demo strategy on Nirium's own shared testnet vault — a real,
// working transaction, not a simulation, but it moves Nirium's testnet
// funds, not yours. To rebalance YOUR OWN vault, see Treasury Rebalance below.
const result = await agent.execute('blend-yield', 'USDC', { amount: 5000 });
console.log('Result:', result.success, result.txHash);

// Real-time signals via WebSocket
agent.subscribe((signal) => {
  console.log('Signal:', signal.signal_type, signal.data.details);
});
```

## API Coverage

| Category | Methods |
|---|---|
| Health | `ping()`, `health()`, `systemHealth()` |
| Execution | `execute()`, `executeDemo()` |
| Market | `getTickers()`, `getMarket()`, `getStats()`, `getLoopStatus()`, `startLoop()`, `stopLoop()`, `triggerScan()` |
| Signals | `createSubscription()`, `getSubscriptions()`, `deleteSubscription()`, `getSubscriptionStats()`, `getRecentSignals()` |
| Skills | `getSkills()`, `installSkill()`, `uninstallSkill()`, `getSkillMarketplace()`, `executeSkillAction()` |
| Strategies | `getStrategies()` |
| Webhooks | `registerWebhook()`, `getWebhooks()`, `deleteWebhook()`, `testWebhook()` |
| Auth | `getAuthToken()`, `createAuthKey()`, `getAuthKeys()`, `revokeAuthKey()` |
| Revenue | `getRevenue()`, `getInfo()` |
| Nodes | `getNodes()` |
| Payouts | `createPayoutRun()`, `submitPayout()`, `onboardPayoutRecipient()`, `submitPayoutOnboard()`, `getPayoutRuns()`, `getPayoutTerms()`, `getPayoutInfo()` |
| Treasury | `getTreasuryInfo()`, `getTreasuryVault()`, `getTreasuryVaults()`, `getTreasuryStrategyAsset()`, `deployTreasuryVault()`, `depositToTreasuryVault()`, `withdrawFromTreasuryVault()`, `setTreasuryRebalanceManager()`, `buildTreasuryRebalance()`, `proposeTreasuryRebalance()`, `executeTreasuryRebalance()`, `submitTreasuryTx()` |
| Audit Trail | `anchorAuditRecord()`, `getAuditInfo()` |
| Reporting | `getReportingSummary()`, `getReportingExport()`, `getReportingExportUrl()` |
| Admin | `configureLLM()` |
| WebSocket | `subscribe()`, `onLog()`, `disconnect()` |
| x402 Payments | `initX402()`, `x402Fetch()` |
| MPP Payments | `initMpp()`, `mppFetch()` |

## Authentication

```typescript
// API Key for REST endpoints
const agent = new Agent({
  apiKey: 'sk_inst_...',
  baseUrl: 'https://nirium-agent.fly.dev',
});

// With JWT token for WebSocket (optional)
const agent = new Agent({
  apiKey: 'sk_inst_...',
  baseUrl: 'https://nirium-agent.fly.dev',
  token: 'eyJhbG...', // JWT from /api/auth/token
});
```

## Payment Protocols

### x402 — Pay-Per-Request
```typescript
agent.initX402({
  secretKey: 'S...',           // Stellar secret key
  network: 'stellar:testnet',
});

const response = await agent.x402Fetch('https://nirium-agent.fly.dev/api/v1/premium/signals');
const data = await response.json();
```

### MPP — Session-Based Budget Delegation
```typescript
agent.initMpp({
  secretKey: 'S...',
  network: 'stellar:testnet',
  mode: 'pull',
});

const response = await agent.mppFetch('https://nirium-agent.fly.dev/api/v1/mpp/signals');
const data = await response.json();
```

### x402Serve() — Charging Your Own API

`initX402()` above lets you *pay* for someone else's API. This is the other side: charging for yours.

```typescript
import { x402Serve } from 'nirium';
import express from 'express';

const app = express();
app.use('/premium', x402Serve({
  payTo: 'G...',                 // your Stellar address — where payments land
  routes: { 'GET /signals': '$0.02' },
  facilitatorApiKey: '...',      // required on mainnet; OpenZeppelin Channels by default
}));
```

Runs on **your own server**, not Nirium's — `x402Serve()` is a client-side function you call from your own code; Nirium doesn't operate, host, or route through anything here, is never in the payment path, and never sees your end users' requests.

**Known limitation:** `x402Serve()` verifies and settles the payment; it does not deduplicate a payment proof across requests or rate-limit callers on its own. Add your own protection if you need either - see [issue #91](https://github.com/nirium-protocol/nirium/issues/91) for what's missing, why, and a real production reference implementation.

**Usage telemetry — opt-in, off by default:** set `NIRIUM_X402SERVE_TELEMETRY=true` to send a small, non-blocking usage ping to Nirium — your `payTo` address, a SHA-256 hash of your `facilitatorApiKey` (never the key itself), network, route/request counts, and this SDK's version. It never blocks, delays, or fails a payment if the ping fails, times out, or isn't sent at all. Disabled by default since v0.14.0 — it's the only channel that would otherwise connect Nirium to how a specific integrator is using this locally-run function, and that isn't a decision this package should make for you.

**Compliance is yours.** `x402Serve()` is a general-purpose library, not a service Nirium provides to your end users. You choose what to charge for, who your `payTo` is, and which jurisdiction you operate in — you remain solely responsible for complying with the financial, tax, and consumer-protection laws that apply to your own use of it.

### Endpoint Access Model

| Access | Endpoints |
|---|---|
| **Public** (no key) | `health`, `loop/status`, `execute-demo`, `signals/recent`, `skills` list |
| **Protected** (API key) | `execute`, `market`, `loop/start\|stop\|scan`, `subscriptions`, `skills/install`, `webhooks` |
| **WebSocket** (JWT) | `/ws/signals` — real-time signal stream |
| **x402 Premium** | `/api/v1/premium/signals` ($0.02 USDC), `/api/v1/premium/market` ($0.05 USDC) |
| **MPP** | `/api/v1/mpp/signals`, `/api/v1/mpp/market` |

## Payouts

Batch disbursement, non-custodial: the node builds an **unsigned** transaction, you sign it with your own wallet and broadcast it. Nirium never holds funds and never sees your keys.

```typescript
const run = await agent.createPayoutRun({
  recipients: [{ wallet: 'GABC...', amount: '250.00' }],
  acknowledgeTerms: true,       // required on every network — 403 without it
});

const signedXdr = await signWithYourWallet(run.xdr);
const settled = await agent.submitPayout(run.runId, signedXdr);
console.log(settled.txHash, settled.cid);   // on-chain hash + IPFS receipt
```

Licensed for **independent service payments only** — contractors, freelancers, B2B. Not for subordinate-employee salary. Read `getPayoutTerms()` before integrating; classifying recipients and meeting tax and labor obligations is the client's responsibility.

Mainnet is invite-only during early access and additionally requires `clientInfo`.

## Treasury Rebalance

Two ways to rebalance a DeFindex vault between idle cash and an invested strategy. Neither is a swap — the contract's `rebalance()` exposes exactly two instructions, `Unwind` and `Invest`, and neither accepts a destination address, so withdrawing anywhere but back into the vault itself is not expressible.

### Propose — you review and sign, available to everyone today

The agent decides what it would do, using the same decision logic as the autonomous signer below, but it never signs. Public, no allowlist, no invite required — works for any vault where you're already the on-chain rebalance manager.

```typescript
const proposal = await agent.proposeTreasuryRebalance({
  vault: 'CABC...',
  caller: 'GABC...',   // must already be this vault's rebalanceManager on-chain
  enterAt: 2.5,        // your own mandate — Nirium never supplies a default here
  exitAt: 2.0,
});

if (proposal.instructions.length) {
  const signedXdr = await signWithYourWallet(proposal.xdr!);
  await agent.submitTreasuryTx(signedXdr);
} else {
  console.log('Nothing to propose:', proposal.reason);
}
```

### Autonomous — Nirium signs, invite-only during legal review

`executeTreasuryRebalance()` has Nirium sign and submit with its own RebalanceManager key — full autonomy, no per-cycle approval. **This is invite-only while a specific legal question stays open**: whether executing on a client's behalf without taking custody still counts as regulated facilitation under Mexican law. It only runs against vaults explicitly allowlisted server-side; calling it against any other vault returns 403, and Nirium's mainnet infrastructure returns 501 for it entirely, since that box holds no signing key by design. Ask if you want autonomous execution today — otherwise, `proposeTreasuryRebalance()` above gives you the same decision-making with you as the one who signs.

## Audit Trail

Anchor evidence to IPFS and get back a CID — an integrity seal, not notarization.

```typescript
const anchor = await agent.anchorAuditRecord({
  hash: 'sha-256:9f86d081...',   // hash of your own file or event
  tag: 'invoice-batch-jul',
});
console.log(anchor.cid);
```

Anchor a **hash** rather than the data itself: IPFS content cannot be deleted, so raw personal data would outlive any erasure request.

## Requirements

- Node.js >= 18
- TypeScript >= 5.0

## Links

- [Documentation](https://nirium.xyz/docs)
- [Developer Sandbox](https://nirium.xyz/sandbox)
- [API Reference](https://nirium.xyz/docs/api)
- [MCP Server Integration](https://nirium.xyz/docs/mcp)
- [GitHub](https://github.com/nirium-protocol/nirium-sdk)

## License

Apache 2.0 — Nirium Protocol
