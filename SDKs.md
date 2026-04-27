# Nirium Protocol — Official SDK Documentation

**Version:** 0.5.0  
**Packages:** `nirium` on npm · `nirium` on PyPI  
**API Base:** `https://api.nirium.xyz`  
**Network:** Stellar Testnet

---

## Overview

Nirium provides two official client SDKs — one for TypeScript/Node.js and one for Python. Both wrap the full REST API and WebSocket stream with idiomatic interfaces, identical capabilities, and production-grade patterns including automatic reconnection, error propagation, and x402/MPP payment protocol support.

Both SDKs have been integration-tested against the live API with 33/33 endpoints passing.

---

## Table of Contents

1. [TypeScript SDK](#typescript-sdk)
   - Installation & setup
   - Full method reference
   - Use cases with complete examples
   - WebSocket streaming
   - x402 and MPP payment protocols
   - Error handling
   - TypeScript types reference
2. [Python SDK](#python-sdk)
   - Installation & setup
   - Full method reference
   - Use cases with complete examples
   - WebSocket streaming
   - x402 and MPP payment protocols
   - Error handling
3. [Common Patterns](#common-patterns)
   - Market monitoring loop
   - Strategy execution with retry
   - Webhook server integration
   - Multi-strategy portfolio
4. [Rate Limits and Quotas](#rate-limits-and-quotas)

---

# TypeScript SDK

## Installation

```bash
npm install nirium
```

**Requirements:** Node.js >= 18 · TypeScript >= 5.0

## Setup

```typescript
import { Agent } from 'nirium';

const agent = new Agent({
  apiKey: 'sk_inst_YOUR_API_KEY',
  baseUrl: 'https://api.nirium.xyz',
  // token: 'eyJhbG...'  // Optional JWT for WebSocket auth
});
```

### Constructor options

| Option | Type | Required | Description |
|---|---|---|---|
| `apiKey` | `string` | Yes | Your institutional API key |
| `baseUrl` | `string` | No | Default: `http://localhost:3001` |
| `wsUrl` | `string` | No | WebSocket URL override |
| `token` | `string` | No | JWT token for WebSocket authentication |

---

## Method Reference

### Health & System

#### `ping(): Promise<boolean>`
Returns `true` if the API is reachable. Never throws.

```typescript
const alive = await agent.ping();
if (!alive) console.error('API unreachable');
```

#### `health(): Promise<Record<string, unknown>>`
Returns basic service health.

```typescript
const h = await agent.health();
// { status: 'operational', version: '0.1.0', uptime: 3600, network: 'testnet' }
```

#### `systemHealth(): Promise<SystemHealth>`
Returns full system health (Horizon, Soroban, WebSocket, LLM). Requires admin key.

```typescript
const sys = await agent.systemHealth();
console.log('Horizon latency:', sys.horizon.latencyMs);
```

---

### Market Data

#### `getTickers(): Promise<TickersResponse>`
Returns real-time XLM and USDC prices from Stellar Horizon order books.

```typescript
const { tickers } = await agent.getTickers();
const xlm = tickers.find(t => t.symbol === 'XLM');
console.log(`XLM: $${xlm.price}`);
// { symbol: 'XLM', price: 0.112, volume24h: 23, change24h: null, network: 'testnet' }
```

#### `getMarket(): Promise<MarketState>`
Returns deep market state including SDEX spread, pool depth, Blend APY, and discovered arbitrage paths.

```typescript
const market = await agent.getMarket();
console.log(`XLM: $${market.xlmPrice}`);
console.log(`SDEX spread: ${market.sdexSpread} bps`);
console.log(`Blend supply APY: ${market.blendApy.supply}%`);
console.log(`Arb routes found: ${market.pathPaymentRoutes.length}`);
```

#### `getStats(): Promise<GlobalStats>`
Returns protocol-level statistics.

```typescript
const stats = await agent.getStats();
console.log(`Uptime: ${stats.protocol.uptime}s`);
console.log(`Active WebSocket clients: ${stats.connectivity.websocketClients}`);
console.log(`Loaded plugins: ${stats.plugins.loaded}`);
```

#### `getRecentSignals(count?: number): Promise<{ signals: Signal[] }>`
Returns recent trading signals from the autonomous swarm. Default count: 20, max: 100.

```typescript
const { signals } = await agent.getRecentSignals(10);
for (const s of signals) {
  console.log(`${s.signal_type} | ${s.pair} | confidence: ${s.data.confidence}`);
}
```

---

### Execution

#### `executeDemo(strategy, asset): Promise<DemoResult>`
Runs a Soroban dry-run simulation without submitting a transaction. Safe to call at any time.

```typescript
const demo = await agent.executeDemo('path-arbitrage', 'XLM');
console.log(demo.message);
// "No arbitrage window detected — market conditions stable"  (profit: 0)
// "Arbitrage window detected — executing strategy"           (profit: >0)
console.log(`Gas estimate: ${demo.gas_consumed} stroops`);
```

**Available strategies:**

| Strategy | Contract Function | Description |
|---|---|---|
| `flash-loan-arb` | `flash_loan_execute` | Flash loan + same-block arbitrage |
| `path-arbitrage` | `execute_path_arbitrage` | Multi-hop path payment (3 hops) |
| `cross-dex` | `execute_cross_dex` | SDEX vs Soroswap AMM spread |
| `blend-yield` | `execute_blend_yield` | Blend protocol supply/borrow yield |
| `soroswap-swap` | `execute_soroswap_swap` | Direct AMM swap via Soroswap |

#### `execute(strategy, asset, params?, stellarAccount?): Promise<ExecutionResult>`
Executes a strategy via a real Soroban contract transaction. Builds XDR, simulates, signs, submits, and polls for confirmation.

```typescript
const result = await agent.execute(
  'path-arbitrage',
  'XLM',
  { amount: 1000 },  // amount in stroops (1000 stroops = 0.0001 XLM)
  'GCVVQUDCIHIMZLIZCWPMCORWOX32OX5NVU2EMT7S2DRV2VOVPLEMINR3'  // x-stellar-account
);

if (result.success) {
  console.log(`TxHash: ${result.txHash}`);
  console.log(`Profit: ${result.profit} stroops`);
  console.log(`Gas: ${result.gasUsed} stroops`);
  console.log(`Time: ${result.details.executionTime}ms`);
  // Verify: https://stellar.expert/explorer/testnet/tx/<txHash>
}
```

> The `stellarAccount` parameter sets the `x-stellar-account` header required for legal consent verification. Your wallet must be pre-enrolled via `/api/sandbox/request`.

---

### Autonomous Loop

#### `getLoopStatus(): Promise<LoopStatus>`

```typescript
const status = await agent.getLoopStatus();
console.log(`Running: ${status.isRunning}`);
console.log(`Total scans: ${status.scanCount}`);
console.log(`Last decision: ${status.lastAiDecision?.action}`);
```

#### `startLoop(config?): Promise<{ success: boolean; message: string }>`

```typescript
await agent.startLoop({
  interval: 60000,        // scan every 60 seconds
  assets: ['XLM', 'USDC'],
  strategies: ['path-arbitrage', 'cross-dex'],
});
```

#### `stopLoop(): Promise<{ success: boolean; message: string }>`

```typescript
await agent.stopLoop();
```

#### `triggerScan(): Promise<{ success: boolean; marketState: MarketState }>`
Forces an immediate out-of-cycle scan.

```typescript
const { marketState } = await agent.triggerScan();
console.log(`Fresh XLM price: $${marketState.xlmPrice}`);
```

---

### Webhooks

#### `registerWebhook(url, events, secret?): Promise<Webhook>`

```typescript
const webhook = await agent.registerWebhook(
  'https://your-server.com/nirium/events',
  ['execution.completed', 'execution.failed', 'signal.high_confidence'],
  'your-hmac-secret-32-chars-minimum'
);
console.log(`Webhook ID: ${webhook.id}`);
```

**Available events:** `execution.started` · `execution.completed` · `execution.failed` · `signal.high_confidence`

#### `getWebhooks(): Promise<Webhook[]>`

```typescript
const webhooks = await agent.getWebhooks();
webhooks.forEach(w => console.log(`${w.id}: ${w.url} — active: ${w.active}`));
```

#### `testWebhook(id): Promise<{ success: boolean; message: string }>`
Sends a test payload to verify your server receives and validates the HMAC signature.

```typescript
await agent.testWebhook(webhookId);
```

#### `deleteWebhook(id): Promise<{ success: boolean }>`

```typescript
await agent.deleteWebhook(webhookId);
```

---

### Subscriptions

#### `createSubscription(options?): Promise<Record<string, unknown>>`
Creates a filtered WebSocket subscription. Use the returned `id` when connecting to the WS stream.

```typescript
const sub = await agent.createSubscription({
  signal_types: ['path_arbitrage', 'flash_loan'],
  min_confidence: 0.85,
  min_profit_percentage: 1.5,
  pairs: ['XLM/USDC'],
});
console.log(`Subscription ID: ${sub.id}`);
```

---

### Skills / Plugins

#### `getSkills(): Promise<{ skills: Skill[]; total: number }>`

```typescript
const { skills, total } = await agent.getSkills();
console.log(`${total} skills loaded`);
skills.forEach(s => console.log(`${s.slug} v${s.version} (built-in: ${s.isBuiltIn})`));
```

#### `installSkill(source): Promise<Skill>`

```typescript
const skill = await agent.installSkill('whale-tracker');
console.log(`Installed: ${skill.name} v${skill.version}`);
```

#### `uninstallSkill(slug): Promise<{ success: boolean }>`

```typescript
await agent.uninstallSkill('whale-tracker');
```

---

### WebSocket Streaming

#### `subscribe(callback, subscriptionId?): void`
Opens a persistent WebSocket connection. Automatically reconnects on disconnect (exponential backoff, up to 5 attempts).

```typescript
// Get a JWT token first
const { token } = await agent.request('POST', '/api/auth/token', {
  walletAddress: 'GCVVQUDCIHIMZLIZCWPMCORWOX32OX5NVU2EMT7S2DRV2VOVPLEMINR3',
});

const agentWithToken = new Agent({
  apiKey: 'sk_inst_YOUR_API_KEY',
  baseUrl: 'https://api.nirium.xyz',
  token,
});

// Subscribe to all signals
agentWithToken.subscribe((signal) => {
  console.log(`[${signal.signal_type}] ${signal.pair}`);
  console.log(`  Confidence: ${signal.data.confidence}`);
  console.log(`  Expected profit: ${signal.data.expectedProfit} stroops`);
  console.log(`  Details: ${signal.data.details}`);
});

// Subscribe with filter (subscription ID from createSubscription)
agentWithToken.subscribe((signal) => {
  // Only receives signals matching the subscription filters
}, subscriptionId);
```

#### `onLog(callback): void`
Receives agent execution log entries in real time.

```typescript
agentWithToken.onLog((log) => {
  console.log(`[${log.level}] ${log.message}`);
});
```

#### `disconnect(): void`
Closes the WebSocket and prevents reconnection.

```typescript
agent.disconnect();
```

---

### Payment Protocols

#### x402 — Pay-Per-Request

```typescript
agent.initX402({
  secretKey: 'S...',           // Stellar secret key
  network: 'stellar:testnet',  // or 'stellar:pubnet'
});

// Automatically handles 402 negotiation, auth-entry signing, and payment
const response = await agent.x402Fetch('https://api.nirium.xyz/skills/whale-tracker');
const data = await response.json();
```

#### MPP — Machine Payment Protocol (Charge Mode)

```typescript
agent.initMpp({
  secretKey: 'S...',
  network: 'stellar:testnet',
  mode: 'pull',  // 'pull' = server assembles+broadcasts | 'push' = client broadcasts
});

const response = await agent.mppFetch('https://api.nirium.xyz/signals/premium');
const data = await response.json();
```

---

### Error Handling

All methods throw on non-2xx responses with a descriptive message.

```typescript
try {
  const result = await agent.execute('path-arbitrage', 'XLM', { amount: 1000 }, wallet);
  console.log('Success:', result.txHash);
} catch (error) {
  // error.message format: "Nirium API Error [403]: {"error":"Forbidden","code":"LEGAL_CONSENT_REQUIRED"}"
  if (error.message.includes('429')) {
    console.error('Rate limit hit — wait before retrying');
  } else if (error.message.includes('403')) {
    console.error('Legal consent missing — add x-stellar-account header');
  } else {
    console.error('Execution failed:', error.message);
  }
}
```

---

### TypeScript Types Reference

```typescript
interface AgentConfig {
  apiKey: string;
  baseUrl?: string;
  wsUrl?: string;
  token?: string;
}

interface Ticker {
  symbol: string;
  price: number | null;
  volume24h: number | null;
  change24h: number | null;
  network: string;
}

interface TickersResponse {
  tickers: Ticker[];
  timestamp: string;
  network: string;
}

interface MarketState {
  xlmPrice: number;
  baseFee: number;
  sdexSpread: number;
  soroswapPoolDepth: number;
  blendApy: { supply: number; borrow: number };
  pathPaymentRoutes: PathPaymentRoute[];
  timestamp: string;
}

interface ExecutionResult {
  success: boolean;
  txHash?: string;
  profit?: number;
  gasUsed?: number;
  error?: string;
  timestamp: string;
  network: string;
  details?: {
    strategy: string;
    asset: string;
    method: string;
    executionTime: number;
    contractId: string;
  };
}

interface Signal {
  id: string;
  signal_type: string;
  pair: string;
  data: {
    expectedProfit: number;
    profitPercentage: number;
    urgency: string;
    confidence: number;
    timeToLive: number;
    details: string;
  };
  timestamp: string;
  expiresAt: string;
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  failureCount: number;
}

interface Skill {
  slug: string;
  name: string;
  version: string;
  description?: string;
  isBuiltIn: boolean;
  installedAt?: string;
}

interface GlobalStats {
  protocol: { version: string; network: string; uptime: number };
  execution: { loopActive: boolean; totalScans: number };
  connectivity: { websocketClients: number; activeSubscriptions: number };
  plugins: { loaded: number };
  timestamp: string;
}
```

---

# Python SDK

## Installation

```bash
pip install nirium
```

**Requirements:** Python >= 3.10 · aiohttp >= 3.9.0 · websockets >= 13.0

## Setup

```python
from nirium import Agent

agent = Agent(
    api_url="https://api.nirium.xyz",
    api_key="sk_inst_YOUR_API_KEY",
    # token="eyJhbG..."  # Optional JWT for WebSocket auth
)
```

### Constructor parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `api_url` | `str` | No | Default: `http://localhost:3001` |
| `api_key` | `str` | No | Your institutional API key |
| `token` | `str` | No | JWT token for WebSocket authentication |

> Pass either `api_key` or `token`. If both are provided, `api_key` takes precedence for REST and `token` is used for WebSocket.

---

## Method Reference

The Python SDK uses `async/await` throughout. All methods are coroutines and must be awaited inside an `async` function.

### Health & System

#### `ping() -> bool`
Returns `True` if the API is reachable. Never raises.

```python
alive = await agent.ping()
if not alive:
    print("API unreachable")
```

#### `health() -> dict`
Returns basic service health.

```python
h = await agent.health()
# {'status': 'operational', 'version': '0.1.0', 'uptime': 3600, 'network': 'testnet'}
```

#### `system_health() -> dict`
Returns full system health (Horizon, Soroban, WebSocket, LLM). Requires admin key.

```python
sys = await agent.system_health()
print(f"Horizon latency: {sys['horizon'].get('latencyMs')} ms")
```

---

### Market Data

#### `get_tickers() -> dict`

```python
data = await agent.get_tickers()
xlm = next(t for t in data["tickers"] if t["symbol"] == "XLM")
print(f"XLM: ${xlm['price']:.4f}")
```

#### `get_market() -> dict`

```python
market = await agent.get_market()
print(f"XLM: ${market['xlmPrice']:.4f}")
print(f"SDEX spread: {market['sdexSpread']} bps")
print(f"Blend supply APY: {market['blendApy']['supply']}%")
print(f"Arb routes: {len(market['pathPaymentRoutes'])}")
```

#### `get_stats() -> dict`

```python
stats = await agent.get_stats()
print(f"Uptime: {stats['protocol']['uptime']}s")
print(f"WS clients: {stats['connectivity']['websocketClients']}")
```

#### `get_recent_signals(count: int = 20) -> dict`

```python
data = await agent.get_recent_signals(10)
for s in data["signals"]:
    print(f"{s['signal_type']} | {s['pair']} | conf: {s['data']['confidence']:.2f}")
```

---

### Execution

#### `execute_demo(strategy: str, asset: str) -> dict`

```python
result = await agent.execute_demo("path-arbitrage", "XLM")
print(result["message"])
# "No arbitrage window detected — market conditions stable"
print(f"Gas estimate: {result['gas_consumed']} stroops")
```

**Available strategies:** `flash-loan-arb` · `path-arbitrage` · `cross-dex` · `blend-yield` · `soroswap-swap`

#### `execute(strategy, asset, params=None, stellar_account=None) -> dict`

```python
result = await agent.execute(
    strategy="path-arbitrage",
    asset="XLM",
    params={"amount": 1000},  # stroops
    stellar_account="GCVVQUDCIHIMZLIZCWPMCORWOX32OX5NVU2EMT7S2DRV2VOVPLEMINR3"
)

if result["success"]:
    print(f"TxHash: {result['txHash']}")
    print(f"Profit: {result['profit']} stroops")
    print(f"Gas: {result['gasUsed']} stroops")
    print(f"Time: {result['details']['executionTime']} ms")
```

---

### Autonomous Loop

#### `get_loop_status() -> dict`

```python
status = await agent.get_loop_status()
print(f"Running: {status['isRunning']}")
print(f"Total scans: {status.get('scanCount', 0)}")
```

#### `start_loop(config: dict = None) -> dict`

```python
await agent.start_loop({
    "interval": 60000,
    "assets": ["XLM", "USDC"],
    "strategies": ["path-arbitrage"],
})
```

#### `stop_loop() -> dict`

```python
await agent.stop_loop()
```

#### `trigger_scan() -> dict`

```python
result = await agent.trigger_scan()
print(f"XLM fresh price: ${result['marketState']['xlmPrice']:.4f}")
```

---

### Webhooks

#### `register_webhook(url, events, secret=None) -> dict`

```python
wh = await agent.register_webhook(
    url="https://your-server.com/nirium/events",
    events=["execution.completed", "execution.failed", "signal.high_confidence"],
    secret="your-hmac-secret"
)
webhook_id = wh["id"]
```

#### `get_webhooks() -> list`

```python
webhooks = await agent.get_webhooks()
for w in webhooks:
    print(f"{w['id']}: {w['url']}")
```

#### `test_webhook(webhook_id: str) -> dict`

```python
await agent.test_webhook(webhook_id)
```

#### `delete_webhook(webhook_id: str) -> dict`

```python
await agent.delete_webhook(webhook_id)
```

---

### Skills / Plugins

#### `get_skills() -> dict`

```python
data = await agent.get_skills()
print(f"{data['total']} skills loaded")
for s in data["skills"]:
    print(f"  {s['slug']} v{s['version']}")
```

#### `install_skill(source: str) -> dict`

```python
skill = await agent.install_skill("whale-tracker")
print(f"Installed: {skill['name']}")
```

#### `uninstall_skill(slug: str) -> dict`

```python
await agent.uninstall_skill("whale-tracker")
```

---

### WebSocket Streaming

The Python SDK uses the `@agent.on(event_type)` decorator to register callbacks, then calls `await agent.subscribe()` to start the connection. Reconnects automatically on disconnect.

```python
import asyncio
from nirium import Agent

agent = Agent(
    api_url="https://api.nirium.xyz",
    api_key="sk_inst_YOUR_API_KEY",
    token="eyJhbG...",  # JWT from /api/auth/token
)

@agent.on("signal")
async def on_signal(data):
    print(f"[{data['signal_type']}] {data['pair']}")
    print(f"  Confidence: {data['data']['confidence']:.2f}")
    print(f"  Expected profit: {data['data']['expectedProfit']} stroops")

@agent.on("log")
async def on_log(data):
    print(f"[{data.get('level', 'info')}] {data.get('message', '')}")

@agent.on("connected")
async def on_connected(_):
    print("Connected to Nirium Signal Stream")

# Blocks indefinitely — reconnects on disconnect
asyncio.run(agent.subscribe())
```

**Decorator-based:** `@agent.on("signal")` · `@agent.on("log")` · `@agent.on("connected")`

**Or pass callback directly:**

```python
async def handle_signal(data):
    print(f"Signal: {data['signal_type']}")

asyncio.run(agent.subscribe(callback=handle_signal))
```

---

### Payment Protocols

#### x402 — Pay-Per-Request

```python
agent.init_x402(
    secret_key="S...",          # Stellar secret key
    network="stellar:testnet"   # or "stellar:pubnet"
)

# Automatically handles 402 negotiation and USDC payment
data = await agent.x402_fetch("https://api.nirium.xyz/skills/whale-tracker")
print(data)
```

#### MPP — Machine Payment Protocol (Charge Mode)

```python
agent.init_mpp(
    secret_key="S...",
    network="stellar:testnet"
)

data = await agent.mpp_fetch("https://api.nirium.xyz/signals/premium")
print(data)
```

---

### Error Handling

All HTTP methods raise `aiohttp.ClientResponseError` on non-2xx responses.

```python
import aiohttp

try:
    result = await agent.execute(
        "path-arbitrage", "XLM",
        {"amount": 1000},
        stellar_account="GCVVQ..."
    )
    print("TxHash:", result["txHash"])

except aiohttp.ClientResponseError as e:
    if e.status == 429:
        print("Rate limit exceeded — back off and retry")
    elif e.status == 403:
        print("Legal consent missing — check x-stellar-account")
    elif e.status == 401:
        print("Invalid API key")
    else:
        print(f"API error {e.status}: {e.message}")

except Exception as e:
    print(f"Unexpected error: {e}")
```

---

# Common Patterns

## Pattern 1 — Market Monitoring Loop

Poll prices and alert when spread exceeds a threshold.

### TypeScript

```typescript
import { Agent } from 'nirium';

const agent = new Agent({ apiKey: 'sk_inst_...', baseUrl: 'https://api.nirium.xyz' });

async function monitorSpread(thresholdBps: number) {
  while (true) {
    const market = await agent.getMarket();
    
    if (market.sdexSpread > thresholdBps) {
      console.log(`⚠️  Spread ${market.sdexSpread} bps exceeds threshold ${thresholdBps} bps`);
      console.log(`   XLM: $${market.xlmPrice} | Routes: ${market.pathPaymentRoutes.length}`);
    }
    
    await new Promise(r => setTimeout(r, 30_000)); // poll every 30s
  }
}

monitorSpread(50);
```

### Python

```python
import asyncio
from nirium import Agent

agent = Agent(api_url="https://api.nirium.xyz", api_key="sk_inst_...")

async def monitor_spread(threshold_bps: int):
    while True:
        market = await agent.get_market()
        
        if market["sdexSpread"] > threshold_bps:
            print(f"⚠️  Spread {market['sdexSpread']} bps > {threshold_bps} bps")
            print(f"   XLM: ${market['xlmPrice']:.4f}")
        
        await asyncio.sleep(30)

asyncio.run(monitor_spread(50))
```

---

## Pattern 2 — Strategy Execution with Retry

Execute with exponential backoff on rate limit errors.

### TypeScript

```typescript
async function executeWithRetry(
  strategy: string,
  asset: string,
  amount: number,
  wallet: string,
  maxAttempts = 3
) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await agent.execute(strategy, asset, { amount }, wallet);
      if (result.success) {
        console.log(`✅ Success on attempt ${attempt}: ${result.txHash}`);
        return result;
      }
    } catch (error: any) {
      if (error.message.includes('429') && attempt < maxAttempts) {
        const wait = Math.pow(2, attempt) * 1000;
        console.log(`Rate limited — retrying in ${wait}ms`);
        await new Promise(r => setTimeout(r, wait));
      } else {
        throw error;
      }
    }
  }
  throw new Error(`Failed after ${maxAttempts} attempts`);
}

await executeWithRetry('path-arbitrage', 'XLM', 1000, wallet);
```

### Python

```python
import asyncio, aiohttp
from nirium import Agent

agent = Agent(api_url="https://api.nirium.xyz", api_key="sk_inst_...")

async def execute_with_retry(strategy, asset, amount, wallet, max_attempts=3):
    for attempt in range(1, max_attempts + 1):
        try:
            result = await agent.execute(strategy, asset, {"amount": amount}, stellar_account=wallet)
            if result["success"]:
                print(f"✅ Success on attempt {attempt}: {result['txHash']}")
                return result
        except aiohttp.ClientResponseError as e:
            if e.status == 429 and attempt < max_attempts:
                wait = (2 ** attempt)
                print(f"Rate limited — retrying in {wait}s")
                await asyncio.sleep(wait)
            else:
                raise
    raise RuntimeError(f"Failed after {max_attempts} attempts")

asyncio.run(execute_with_retry("path-arbitrage", "XLM", 1000, wallet))
```

---

## Pattern 3 — Webhook Server Integration

Receive and validate HMAC-signed event deliveries.

### TypeScript (Express)

```typescript
import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.raw({ type: 'application/json' }));

const WEBHOOK_SECRET = 'your-hmac-secret';

app.post('/nirium/events', (req, res) => {
  const signature = req.headers['x-nirium-signature'] as string;
  const expected = 'sha256=' + crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex');
  
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(req.body.toString());
  
  switch (event.type) {
    case 'execution.completed':
      console.log(`✅ Execution: ${event.data.txHash} | profit: ${event.data.profit}`);
      break;
    case 'execution.failed':
      console.log(`❌ Execution failed: ${event.data.error}`);
      break;
    case 'signal.high_confidence':
      console.log(`🎯 Signal: ${event.data.signal_type} | confidence: ${event.data.confidence}`);
      break;
  }
  
  res.sendStatus(200);
});

app.listen(3000);
```

### Python (FastAPI)

```python
import hmac, hashlib
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()
WEBHOOK_SECRET = b"your-hmac-secret"

@app.post("/nirium/events")
async def handle_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("x-nirium-signature", "")
    expected = "sha256=" + hmac.new(WEBHOOK_SECRET, body, hashlib.sha256).hexdigest()
    
    if not hmac.compare_digest(signature, expected):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    import json
    event = json.loads(body)
    
    if event["type"] == "execution.completed":
        print(f"✅ TxHash: {event['data']['txHash']} | profit: {event['data']['profit']}")
    elif event["type"] == "execution.failed":
        print(f"❌ Error: {event['data']['error']}")
    elif event["type"] == "signal.high_confidence":
        print(f"🎯 Signal: {event['data']['signal_type']} | conf: {event['data']['confidence']}")
    
    return {"ok": True}
```

---

## Pattern 4 — Multi-Strategy Portfolio Runner

Scan market conditions and select the best strategy, then execute.

### TypeScript

```typescript
import { Agent, MarketState } from 'nirium';

const agent = new Agent({ apiKey: 'sk_inst_...', baseUrl: 'https://api.nirium.xyz' });
const WALLET = 'GCVVQ...';

function selectStrategy(market: MarketState): string | null {
  // Prioritize path arbitrage when profitable routes exist
  if (market.pathPaymentRoutes.length > 0) {
    const best = market.pathPaymentRoutes[0];
    if (best.profitPercentage > 0.5) return 'path-arbitrage';
  }
  // Fall back to yield when spread is tight
  if (market.sdexSpread < 10 && market.blendApy.supply > 5) return 'blend-yield';
  // Cross-DEX when AMM pool depth is high
  if (market.soroswapPoolDepth > 100_000) return 'cross-dex';
  return null;
}

async function run() {
  const market = await agent.getMarket();
  const strategy = selectStrategy(market);
  
  if (!strategy) {
    console.log('No opportunity — waiting for next cycle');
    return;
  }
  
  // Dry run first
  const demo = await agent.executeDemo(strategy, 'XLM');
  if (demo.simulated_profit === 0) {
    console.log(`Demo: ${demo.message}`);
    return;
  }
  
  // Execute for real
  const result = await agent.execute(strategy, 'XLM', { amount: 5000 }, WALLET);
  if (result.success) {
    console.log(`✅ ${strategy} | profit: ${result.profit} stroops | tx: ${result.txHash}`);
  }
}

// Run every 60 seconds
setInterval(run, 60_000);
run();
```

### Python

```python
import asyncio
from nirium import Agent

agent = Agent(api_url="https://api.nirium.xyz", api_key="sk_inst_...")
WALLET = "GCVVQ..."

def select_strategy(market: dict) -> str | None:
    routes = market.get("pathPaymentRoutes", [])
    if routes and routes[0].get("profitPercentage", 0) > 0.5:
        return "path-arbitrage"
    if market.get("sdexSpread", 999) < 10 and market.get("blendApy", {}).get("supply", 0) > 5:
        return "blend-yield"
    if market.get("soroswapPoolDepth", 0) > 100_000:
        return "cross-dex"
    return None

async def run():
    market = await agent.get_market()
    strategy = select_strategy(market)
    
    if not strategy:
        print("No opportunity — waiting")
        return
    
    demo = await agent.execute_demo(strategy, "XLM")
    if demo["simulated_profit"] == 0:
        print(f"Demo: {demo['message']}")
        return
    
    result = await agent.execute(strategy, "XLM", {"amount": 5000}, stellar_account=WALLET)
    if result["success"]:
        print(f"✅ {strategy} | profit: {result['profit']} | tx: {result['txHash']}")

async def main():
    while True:
        await run()
        await asyncio.sleep(60)

asyncio.run(main())
```

---

## Pattern 5 — Real-Time Signal Dashboard (WebSocket)

Subscribe to live signals and act on high-confidence opportunities.

### TypeScript

```typescript
import { Agent, Signal } from 'nirium';

const agent = new Agent({
  apiKey: 'sk_inst_...',
  baseUrl: 'https://api.nirium.xyz',
  token: 'eyJhbG...',
});
const WALLET = 'GCVVQ...';

// Create filtered subscription
const sub = await agent.createSubscription({
  signal_types: ['path_arbitrage', 'flash_loan'],
  min_confidence: 0.85,
  min_profit_percentage: 1.0,
});

agent.subscribe(async (signal: Signal) => {
  const { confidence, expectedProfit, details } = signal.data;
  
  console.log(`📡 ${signal.signal_type} on ${signal.pair}`);
  console.log(`   Confidence: ${(confidence * 100).toFixed(1)}%`);
  console.log(`   Expected profit: ${expectedProfit} stroops`);
  console.log(`   ${details}`);
  
  // Auto-execute high-confidence signals
  if (confidence >= 0.9 && expectedProfit > 5) {
    try {
      const result = await agent.execute('path-arbitrage', 'XLM', { amount: 1000 }, WALLET);
      console.log(`  → Executed: ${result.txHash}`);
    } catch (e: any) {
      console.error(`  → Execution failed: ${e.message}`);
    }
  }
}, sub.id as string);
```

### Python

```python
import asyncio
from nirium import Agent

agent = Agent(
    api_url="https://api.nirium.xyz",
    api_key="sk_inst_...",
    token="eyJhbG...",
)
WALLET = "GCVVQ..."

@agent.on("signal")
async def on_signal(data):
    conf = data["data"]["confidence"]
    profit = data["data"]["expectedProfit"]
    
    print(f"📡 {data['signal_type']} on {data['pair']}")
    print(f"   Confidence: {conf:.1%} | Profit: {profit} stroops")
    
    if conf >= 0.9 and profit > 5:
        try:
            result = await agent.execute(
                "path-arbitrage", "XLM", {"amount": 1000},
                stellar_account=WALLET
            )
            print(f"  → Executed: {result['txHash']}")
        except Exception as e:
            print(f"  → Failed: {e}")

asyncio.run(agent.subscribe())
```

---

# Rate Limits and Quotas

| Tier | Req/min | Req/day | Strategies/day |
|---|---|---|---|
| Free | 10 | 100 | 10 |
| Sandbox | 60 | 1,000 | 100 |
| **Institutional** | **300** | **10,000** | **500** |
| Enterprise | 1,000 | 100,000 | unlimited |

**Institutional Partner current tier:** Institutional (300 req/min · 10,000 req/day · 500 strategies/day)

**Rate limit headers returned on 429:**
```
Retry-After: <seconds>
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 0
X-RateLimit-Reset: <unix_timestamp>
```

**Best practices:**
- Use `executeDemo()` first to validate strategy before calling `execute()`
- Cache `getMarket()` responses — market state changes at most every 30 seconds
- Use WebSocket subscriptions instead of polling `getRecentSignals()` for real-time use cases
- Check `getStats().connectivity.websocketClients` to monitor connection health

---

## Contract Reference

| Contract | Address | Network |
|---|---|---|
| NiriumVault | `CAU2XBJTQUBTMPAUFRX7GMZ337I5WLBI4GYPWHZEVXTMJ66D3CP6DEL4` | Testnet |
| Vault ID (Institutional Partner) | `2000` | Testnet |

Verify transactions: `https://stellar.expert/explorer/testnet/tx/<txHash>`

---

## Support

- **Security issues:** xvaiosx7@gmail.com  
- **npm:** https://www.npmjs.com/package/nirium  
- **PyPI:** https://pypi.org/project/nirium/  
- **API reference:** [API_DOCUMENTATION_OPENAPI.yaml](API_DOCUMENTATION_OPENAPI.yaml)  
- **Endpoint test guide:** [InstitutionalPartnerKey.md](InstitutionalPartnerKey.md)

---

*Nirium Protocol — April 19, 2026*
