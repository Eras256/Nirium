# nirium

Official TypeScript SDK for the **Nirium Protocol** — autonomous DeFi agent infrastructure on Stellar/Soroban.

## Install

```bash
npm install nirium
```

## Quick Start

```typescript
import { Agent } from 'nirium';

const agent = new Agent({
  apiKey: 'sk_inst_your_key_here',
  baseUrl: 'https://api.nirium.xyz',
});

// Health check
const alive = await agent.ping();
console.log('Agent alive:', alive);

// Real market data from Stellar Horizon
const market = await agent.getMarket();
console.log('XLM Price:', market.xlmPrice);

// Execute a strategy
const result = await agent.execute('flash-loan-arb', 'XLM-USDC', { amount: 5000 });
console.log('Profit:', result.profit);

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
| Signals | `createSubscription()`, `getRecentSignals()` |
| Skills | `getSkills()`, `installSkill()`, `uninstallSkill()` |
| Webhooks | `registerWebhook()`, `getWebhooks()`, `deleteWebhook()`, `testWebhook()` |
| WebSocket | `subscribe()`, `onLog()`, `disconnect()` |
| x402 Payments | `initX402()`, `x402Fetch()` |
| MPP Payments | `initMpp()`, `mppFetch()` |

## Authentication

```typescript
// API Key for REST endpoints
const agent = new Agent({
  apiKey: 'sk_inst_...',
  baseUrl: 'https://api.nirium.xyz',
});

// With JWT token for WebSocket (optional)
const agent = new Agent({
  apiKey: 'sk_inst_...',
  baseUrl: 'https://api.nirium.xyz',
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

const response = await agent.x402Fetch('https://api.nirium.xyz/api/v1/premium/signals');
const data = await response.json();
```

### MPP — Session-Based Budget Delegation
```typescript
agent.initMpp({
  secretKey: 'S...',
  network: 'stellar:testnet',
  mode: 'pull',
});

const response = await agent.mppFetch('https://api.nirium.xyz/api/v1/mpp/signals');
const data = await response.json();
```

### Endpoint Access Model

| Access | Endpoints |
|---|---|
| **Public** (no key) | `health`, `loop/status`, `execute-demo`, `signals/recent`, `skills` list |
| **Protected** (API key) | `execute`, `market`, `loop/start\|stop\|scan`, `subscriptions`, `skills/install`, `webhooks` |
| **WebSocket** (JWT) | `/ws/signals` — real-time signal stream |
| **x402 Premium** | `/api/v1/premium/signals` ($0.02), `/api/v1/premium/market` ($0.05) |

## Requirements

- Node.js >= 18
- TypeScript >= 5.0

## Links

- [Full SDK Documentation](../../SDKs.md)
- [API Documentation](../../API_DOCUMENTATION_OPENAPI.yaml)
- [MCP Integration Guide](../../MCP_INTEGRATION_GUIDE.md)

## License

MIT — Nirium Protocol
