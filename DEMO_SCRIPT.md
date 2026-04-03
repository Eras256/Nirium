# Nirium Protocol — Demo Script (SCF #43 / Hackathon Video)

**Total runtime:** 3–4 minutes  
**Audience:** SDF / SCF evaluators, Pedro (ISA Capital)  
**Goal:** Show x402 agentic payments end-to-end — an AI agent pays USDC to get premium signals from Nirium, automatically, on Stellar.

---

## Pre-flight Checklist (before recording)

- [ ] Agent running locally: `cd packages/agent && npx tsx src/index.ts`
- [ ] Testnet wallet funded with USDC ([faucet.circle.com](https://faucet.circle.com) → Stellar Testnet)
- [ ] `STELLAR_SECRET_KEY` set in `packages/mcp/.env`
- [ ] `X402_PAY_TO_ADDRESS` set to your Stellar wallet in `packages/agent/.env.local`
- [ ] Frontend running: `cd apps/web && pnpm dev`
- [ ] Terminal font size: 18px minimum
- [ ] Screen resolution: 1920×1080

---

## Scene 1 — The Problem (30 seconds)

**Narration:**
> "Traditional DeFi APIs require account creation, API keys, and billing agreements. For AI agents operating autonomously at machine speed, this is a fundamental friction. Nirium solves this with x402 — the HTTP payment protocol for the agentic economy."

**Show:** A simple `curl` to a premium endpoint returning `402 Payment Required`:
```bash
curl -i http://localhost:3001/api/v1/premium/signals
```

**Expected output:**
```
HTTP/1.1 402 Payment Required
x-payment-required: {"scheme":"exact","network":"stellar:testnet","price":"$0.01",...}
```

---

## Scene 2 — The MCP Tool (60 seconds)

**Narration:**
> "Any AI agent — Claude, GPT, Codex — can connect to Nirium via the Model Context Protocol. The agent has no idea it's paying. It just calls a tool."

**Show:** Open Claude Desktop or Claude Code with Nirium MCP configured:

```
User: What are the current arbitrage opportunities?
      Use get_premium_signals from Nirium.
```

**What happens (narrate live):**
1. Claude calls `get_premium_signals` via MCP
2. MCP server hits `/api/v1/premium/signals` → gets HTTP 402
3. MCP server signs Soroban auth entry automatically (0.01 USDC)
4. Retries with `X-PAYMENT` header → HTTP 200
5. Claude receives premium signal data and explains it

**Show on screen:**
- The `X-PAYMENT` header exchange in MCP server stderr logs
- Claude responding with parsed signal data

---

## Scene 3 — On-Chain Settlement (45 seconds)

**Narration:**
> "The payment settles on Stellar in real time. The facilitator verifies the signature and executes the USDC transfer — all within the same request."

**Show:**
1. Open [Stellar Expert](https://stellar.expert/explorer/testnet) and search for the `X402_PAY_TO_ADDRESS`
2. Show the incoming USDC transaction from the demo payment
3. Highlight: destination address, 0.01 USDC amount, recent timestamp

**Key point:** "No intermediary, no escrow. The payment and the data exchange happen atomically."

---

## Scene 4 — Revenue Dashboard (30 seconds)

**Narration:**
> "Every payment is logged in real time in the Nirium dashboard."

**Show:**
1. Open `http://localhost:3000/dashboard`
2. Scroll to the **Protocol Revenue** panel
3. Show the x402 payment entry: amount, caller address, route, timestamp

**Zoom in on:**
- "Total Earned" counter
- The specific payment from Scene 2

---

## Scene 5 — The Vision (30 seconds)

**Narration:**
> "Nirium is now an open protocol. Any AI agent anywhere in the world can pay $0.01 USDC on Stellar to access Nirium's arbitrage intelligence — no registration, no API key, no billing. This is the agentic economy."

**Show:** The architecture diagram (draw live or use a pre-made slide):
```
External AI Agent
        │
        │ MCP tool call: get_premium_signals
        ▼
Nirium MCP Server
        │
        │ HTTP GET /api/v1/premium/signals
        ▼
    ← 402 + payment requirements
        │
        │ Sign Soroban auth entry (0.01 USDC)
        ▼
x402 Facilitator (x402.org/facilitator)
        │
        │ Verify + settle on Stellar
        ▼
    ← 200 + premium signal data
        │
        ▼
External AI Agent receives intelligence
Nirium wallet receives 0.01 USDC
```

---

## Scene 6 — Railway + 24/7 Operation (optional, 30 seconds)

**Show:**
1. `cat railway.toml` — single config file
2. `npx tsx scripts/master.ts` output — all three processes starting
3. "Deployed on Railway, running 24/7 without a laptop"

---

## Key Talking Points (for Q&A)

| Question | Answer |
|---|---|
| Why Stellar over EVM for x402? | Native SEP-41 USDC, 5s finality, sub-cent fees — ideal for micropayments |
| What wallets support x402 on Stellar? | Freighter (desktop), Albedo, Hana, HOT — all support auth-entry signing |
| Is this mainnet ready? | Testnet now, mainnet by switching `stellar:testnet` → `stellar:pubnet` |
| How much does a facilitator cost? | Coinbase's facilitator is free on testnet (fees sponsored). Mainnet: negligible |
| Can non-AI clients use x402? | Yes — any HTTP client that can sign a Stellar auth entry |

---

## Commands Reference

```bash
# Start agent (local dev)
cd packages/agent && npx tsx src/index.ts

# Start MCP server (separate terminal)
cd packages/mcp && STELLAR_SECRET_KEY=S... npx tsx src/index.ts

# Manual x402 test (shows the full 402→pay→200 cycle)
cd packages/agent && npx tsx scripts/nirium_indexer.ts

# Test the 402 flow directly
curl -v http://localhost:3001/api/v1/premium/signals

# Railway deployment
railway up
```

---

## SCF Submission Notes

- **Track:** Build Award (up to $150,000 XLM)
- **Round:** SCF #43 — deadline April 26, 2026
- **Category:** DeFi / AI Agents / Agentic Payments
- **Key differentiator:** Only Stellar DeFi protocol with x402 + MCP integration + autonomous swarm
- **Deliverables:** Live testnet deployment, open-source MCP server, x402 premium endpoints, demo video
