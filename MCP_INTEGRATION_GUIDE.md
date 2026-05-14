# Nirium MCP Server — Integration Guide v0.4.0

> Model Context Protocol server for Nirium Protocol.
> Exposes 12 tools to any MCP-compatible AI: Claude, GPT, Cursor, VS Code Copilot.
> Tested: 19 April 2026 via JSON-RPC stdio.

---

## Quick Start (Claude Desktop)

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nirium": {
      "command": "node",
      "args": ["/path/to/nirium/packages/mcp/dist/index.js"],
      "env": {
        "AGENT_API_URL": "https://nirium-agent.fly.dev",
        "NIRIUM_API_KEY": "sk_inst_...",
        "STELLAR_SECRET_KEY": "S...",
        "STELLAR_PUBLIC_KEY": "G...",
        "STELLAR_NETWORK": "testnet"
      }
    }
  }
}
```

**Minimum required:** only `AGENT_API_URL` for free tools.
`NIRIUM_API_KEY` unlocks loop control and health monitoring.
`STELLAR_SECRET_KEY` + `STELLAR_PUBLIC_KEY` unlock x402 + MPP paid tools and `start_loop`.

> `STELLAR_PUBLIC_KEY` is required for `start_loop` (legal consent middleware). If omitted, start_loop returns `LEGAL_CONSENT_MISSING`. It can be the G... address corresponding to your secret key.

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `AGENT_API_URL` | Yes | Nirium agent API URL. Default: `http://127.0.0.1:3001`. Production: `https://nirium-agent.fly.dev` |
| `NIRIUM_API_KEY` | For auth tools | API key from `/api/auth/keys`. Unlocks loop control, system health |
| `STELLAR_SECRET_KEY` | For paid tools | Stellar testnet keypair. Funds x402 + MPP payments |
| `STELLAR_NETWORK` | No | `testnet` (default) or `mainnet` |
| `SOROBAN_RPC_URL` | No | Soroban RPC. Default: `https://soroban-testnet.stellar.org` |

---

## Tools Reference

### FREE (no key required)

#### `get_market_state`
Real-time market data: XLM/USDC price, SDEX spread, base fee, Blend APY.

```
Input: none
Output: { tickers, market: { xlmPrice, baseFee, sdexSpread, blendSupplyApy }, timestamp, network }
```

**Test result (19 Apr 2026):** ✅ PASS
```json
{
  "tickers": [{ "symbol": "XLM", "price": 0.1189, "network": "testnet" }],
  "market": { "xlmPrice": 0.1189, "baseFee": 100, "sdexSpread": null, "blendSupplyApy": 0 }
}
```
> Note: `sdexSpread` shows `null` when testnet liquidity is thin (expected behavior). Price from CoinGecko.

---

#### `get_loop_status`
Autonomous scanning loop state: running/stopped, scan count, last AI decision, config.

```
Input: none
Output: { isRunning, scanCount, uptime, config, lastAiDecision, marketState }
```

**Test result:** ✅ PASS
```json
{
  "isRunning": false,
  "scanCount": 0,
  "uptime": 0,
  "config": {
    "minProfitPercentage": 0.3,
    "maxBaseFee": 500,
    "minLiquidity": 50000,
    "minConfidence": 0.5
  },
  "lastAiDecision": null
}
```

---

#### `execute_demo`
Dry-run a strategy via Soroban simulation. No real transaction, no funds needed.

```
Input: { strategy: string, asset: string }
Output: { success, simulated_profit, gas_consumed, message }
```

Strategies: `flash-loan-arb` | `path-arbitrage` | `cross-dex` | `blend-yield` | `soroswap-swap`

**Test result (path-arbitrage, XLM-USDC):** ✅ PASS
```json
{
  "success": true,
  "simulated_profit": 0,
  "gas_consumed": 24500,
  "message": "No arbitrage window detected — market conditions stable"
}
```

**Test result (flash-loan-arb, XLM-USDC):** ✅ PASS
```json
{
  "success": true,
  "simulated_profit": 0,
  "gas_consumed": 24500,
  "message": "No arbitrage window detected — market conditions stable"
}
```

---

#### `get_wallet_info`
Shows x402 + MPP wallet address and tool tier configuration for the current session.

```
Input: none
Output: { address, network, niriumApiKeySet, x402Enabled, freeTools, authenticatedTools, paidToolsX402, paidToolsMpp }
```

**Test result (no key):** ✅ PASS — returns `"No STELLAR_SECRET_KEY configured. Set it to enable paid tools."`

---

### AUTHENTICATED (requires `NIRIUM_API_KEY`)

#### `start_loop`
Start the autonomous Stellar market scanning loop.

```
Input: { minProfitPercentage?: number, maxBaseFee?: number }
Output: { started, message }
```

#### `stop_loop`
Stop the autonomous scanning loop.

```
Input: none
Output: { stopped, message }
```

#### `get_system_health`
Full system health: Horizon, Soroban RPC, WebSocket, LLM provider status.

```
Input: none
Output: { horizon, soroban, websocket, llm, uptime, version }
```

> All three require `NIRIUM_API_KEY` in env. Without it: `{ "error": "Unauthorized" }`.

---

### PAID via x402 (requires `STELLAR_SECRET_KEY` + funded wallet)

Payment flow: MCP auto-handles HTTP 402 → signs Soroban auth → sends X-PAYMENT header → receives 200.

#### `get_premium_signals` — $0.02 USDC
Premium arbitrage signals with confidence scores, profit estimates, valid-until ledger windows.

```
Input: { count?: number }
Output: [{ signal_type, asset_pair, confidence, estimated_profit_pct, valid_until_ledger }]
```

#### `get_premium_market` — $0.05 USDC
Enriched market state: arbitrage windows, yield ranking, fee pressure alerts, execution recommendation.

```
Input: none
Output: { market, arbitrageWindows, yieldRanking, recommendation }
```

#### `execute_paid_strategy` — $0.25 USDC
Execute a DeFi strategy on Stellar via Soroban. No Nirium account required.

```
Input: { strategy: string, asset: string, params?: object }
Output: { txHash, status, profit, gasConsumed }
```

---

### PAID via MPP Charge (requires `STELLAR_SECRET_KEY` + funded wallet)

No external facilitator — direct Soroban SAC transfer. Same data as x402 equivalents.

#### `get_mpp_signals` — $0.02 USDC via MPP
Same output as `get_premium_signals`.

#### `get_mpp_market` — $0.05 USDC via MPP
Same output as `get_premium_market`.

---

## Test Results Summary (19 April 2026)

All 13 tool invocations tested end-to-end. Paid tools tested with a funded Stellar testnet wallet (1 USDC obtained via SDEX swap from Friendbot XLM).

| Tool | Auth Required | Status | Notes |
|------|--------------|--------|-------|
| `get_market_state` | None | ✅ PASS | XLM $0.12 from CoinGecko |
| `get_loop_status` | None | ✅ PASS | Returns loop config and state |
| `execute_demo` (path-arb) | None | ✅ PASS | Simulation, no tx |
| `execute_demo` (flash-loan) | None | ✅ PASS | Simulation, no tx |
| `get_wallet_info` | None | ✅ PASS | Shows tier config |
| `start_loop` | NIRIUM_API_KEY + STELLAR_PUBLIC_KEY | ✅ PASS | Requires `x-stellar-account` header — set `STELLAR_PUBLIC_KEY` in env |
| `stop_loop` | NIRIUM_API_KEY | ✅ PASS | Loop stopped cleanly |
| `get_system_health` | NIRIUM_API_KEY | ✅ PASS | `status: online`, `service: nirium-matrix-v2.5` |
| `get_premium_signals` | STELLAR_SECRET_KEY | ✅ PASS | Paid 0.02 USDC via x402 — `paidWith: "USDC/Stellar"` |
| `get_premium_market` | STELLAR_SECRET_KEY | ✅ PASS | Paid 0.05 USDC via x402 — path routes returned |
| `execute_paid_strategy` | STELLAR_SECRET_KEY | ✅ PASS | Paid 0.25 USDC via x402 — txHash `77a250...`, contract CAU2X |
| `get_mpp_signals` | STELLAR_SECRET_KEY | ✅ PASS | Paid 0.02 USDC via MPP — `noFacilitator: true` |
| `get_mpp_market` | STELLAR_SECRET_KEY | ✅ PASS | Paid 0.05 USDC via MPP — path routes returned |

**Protocol:** JSON-RPC 2.0 over stdio
**Server:** `nirium-mcp-server` v0.4.0
**Tools registered:** 12
**Total test run:** 13/13 PASS

---

## Funding a Testnet Wallet for Paid Tools

Paid tools cost 0.02–0.25 USDC per call. To get a funded testnet wallet in under 2 minutes:

**Step 1 — Generate keypair and get free XLM:**
```bash
npx tsx packages/agent/src/scripts/setup-testnet-wallet.ts
```
This generates a keypair and deposits 10,000 testnet XLM via Friendbot.

**Step 2 — Add USDC trustline and buy USDC on testnet SDEX:**
```bash
npx tsx --eval "
import { Keypair, Asset, Operation, TransactionBuilder, BASE_FEE, Networks } from '@stellar/stellar-sdk';
import { Horizon } from '@stellar/stellar-sdk';

const SECRET = 'S_YOUR_SECRET_KEY_HERE';
const kp = Keypair.fromSecret(SECRET);
const USDC = new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');
const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');

const account = await horizon.loadAccount(kp.publicKey());
const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: Networks.TESTNET })
  .addOperation(Operation.changeTrust({ asset: USDC }))
  .addOperation(Operation.manageBuyOffer({ selling: Asset.native(), buying: USDC, buyAmount: '1', price: '10' }))
  .setTimeout(60).build();
tx.sign(kp);
const result = await horizon.submitTransaction(tx);
console.log('TX:', result.hash);
const acc2 = await horizon.loadAccount(kp.publicKey());
acc2.balances.forEach((b:any) => console.log(b.asset_type === 'native' ? 'XLM: ' + b.balance : b.asset_code + ': ' + b.balance));
"
```
After this you'll have ~1 USDC — enough for 20+ paid tool calls.

**Step 3 — Set env vars in Claude Desktop config:**
```json
"STELLAR_SECRET_KEY": "S...",
"STELLAR_PUBLIC_KEY": "G..."
```

> USDC x402 contract on testnet: `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`
> Classic USDC issuer: `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`

---

## Build

```bash
cd packages/mcp
pnpm install
pnpm build        # → dist/index.js
```

## Run (dev, no auth)

```bash
AGENT_API_URL=https://nirium-agent.fly.dev node dist/index.js
```

## Run (full config)

```bash
AGENT_API_URL=https://nirium-agent.fly.dev \
NIRIUM_API_KEY=sk_inst_... \
STELLAR_SECRET_KEY=S... \
STELLAR_NETWORK=testnet \
node dist/index.js
```

---

## Institutional Partner Integration Notes

- Institutional Partner team installs MCP in their Claude Desktop using their `sk_inst_partner_lead_investor_nirium_2026` key as `NIRIUM_API_KEY`
- This gives them access to loop control and health monitoring without touching the Core Repo
- Paid tools (x402/MPP) require a funded Stellar testnet wallet — Institutional Partner provides their own keypair
- The MCP never exposes the Core Repo, secret keys, or admin credentials
- All paid tool calls are logged server-side with payer Stellar address

---

*Nirium MCP Integration Guide v0.4.0 — Tested 19 April 2026 — Updated 26 April 2026*
