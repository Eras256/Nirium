
# NIRIUM: Institutional Infrastructure for Automated Treasury and FX on Stellar

**Nirium** is a decentralized orchestration layer that enables fintechs and financial institutions to automate treasury operations and cross-border FX using autonomous agentic execution on Stellar. Agents manage liquidity, settle intents via **MPP** sessions, and pay for premium financial intelligence via **x402** micropayments—all with 24/7 reliability on Stellar Testnet.

Built for the **Agents on Stellar Hackathon (April 2026)**.

## What It Does

Nirium solves the **manual treasury bottleneck**: Fintechs moving capital across borders (e.g., USD/MXN) face high FX costs, slow settlement, and error-prone manual trading desks. Nirium replaces these workflows with autonomous agents that have their own Stellar wallets, funded via sponsorship (zero XLM needed), and capable of 24/7 execution using two complementary protocols:

- **FX Automation (MPP)**: A treasury manager delegates a USDC budget to an agent via a Soroban escrow session. The agent autonomously executes FX rebalancing and liquidity intents within that budget, eliminating manual oversight.
- **Pay-Per-Request Intelligence (x402)**: Agents acquire premium financial telemetry (e.g., real-time yield rankings or arbitrage signals) on a micropayment basis. This "Just-in-Time" billing allows institutions to pay only for the intelligence they use.

## Architecture

```
Human Operator (Freighter Wallet)
        |
        v
  [Next.js Dashboard]  <-->  [Soroban Contracts on Stellar Testnet]
        |                         |-- Nirium Vault (Treasury & Flash Loans)
        |                         |-- ELO Registry (Reputation)
        |                         |-- Marketplace (Strategy CIDs)
        |                         |-- Neural Sentinel (Performance Scoring)
        |                         |-- Settlement Hub (x402 & MPP Sessions)
        |                         |-- Skill Vault (x402 Payment Gate)
        v
  [Autonomous Agent Bots]
        |-- Neural Reasoner (DeepSeek-R1 via Ollama)
        |-- MPP Subscription Agent
        |-- x402 Fleet Agent
        |
        v
  [MCP Server] --> Claude Desktop / Cursor / AI IDEs
```

## Key Features

### 1. Neural Reasoner (Local LLM)
Agents use **DeepSeek-R1** locally via Ollama to make economic decisions:
- "Should I pay 0.01 USDC for this flash-loan-executor skill?"
- "Is my budget sufficient for another MPP cycle?"
- All reasoning is logged to the Neural Feed for operator observability.

### 2. Dual Protocol Settlement (x402 + MPP)
- **x402**: HTTP 402 response with payment instructions. Agent pays USDC, API verifies payment on Horizon, delivers premium data.
- **MPP**: Opens a Soroban escrow session with a USDC budget. Agent settles intents atomically within the budget. Unspent funds are refundable.

### 3. Skill Vault (On-Chain Payment Gate)
A Soroban contract that acts as a payment gateway for agent skills. `unlock_skill()` atomically verifies agent identity, deducts USDC, and emits an access key — all in a single invocation.

### 4. Zero-Friction Agent Onboarding
Using Stellar's **Sponsorship Protocol** (`beginSponsoringFutureReserves`), Nirium creates funded agent accounts with 0 XLM. The treasury covers reserves, and agents operate solely in USDC from second one.

### 5. Neural Sentinel (Performance Scoring)
On-chain agent reputation: +10 for success, -25 for failure. Only the trusted oracle (Settlement Hub) can report performance, ensuring trustless scoring.

### 6. MCP Server
Exposes Nirium as tools for Claude Desktop, Cursor, and other AI environments. Operators can query agent ELO scores, fetch premium strategies, and trigger skill acquisitions via natural language.

## Deployed Contracts (Stellar Testnet)

All contracts are live and verifiable on [Stellar Expert](https://stellar.expert/explorer/testnet).

| Contract | Role | Contract ID |
| :--- | :--- | :--- |
| **Nirium Vault** | Treasury & Flash Loans | `CAU2XBJTQUBTMPAUFRX7GMZ337I5WLBI4GYPWHZEVXTMJ66D3CP6DEL4` |
| **ELO Registry** | On-chain Reputation (ELO scoring) | `CC6Z3WJWRKVEAXEKIQ5S3LFEMKRF4L2FTN5YZDQU27MQRQAWA5QBJWF2` |
| **Marketplace** | Strategy CID Registry | `CB6Q3LKBJ7CAAZY4MK7EG5R6FDDTJHB52ZEENI6BQLBJNFKBQRIAUABC` |
| **Neural Sentinel** | Agent Performance Scoring | `CCP5OY3TTDVIREQYGOUZUXS2MZJO3LLJD6Z22Z3VROWFCPJAON22WPY2` |
| **Settlement Hub** | x402 & MPP Session Escrow | `CANZP2OJUS2Y5VXE4YHRR75LE2WKE7QTJOCCWENR7X65DWE6QEJZV6KS` |
| **Skill Vault** | x402 Payment Gate | `CB4JM3PP7GWKJUAYIZ7ZULWFTFJ57FTTUFZTFIDF4JCAPF664OJCXIEI` |
| **USDC (Testnet)** | Settlement Asset | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` |

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- [Ollama](https://ollama.com) with `deepseek-r1` model (for agent reasoning)
- [Freighter wallet](https://freighter.app) (for dashboard interactions)

### 1. Install and run the dashboard
```bash
pnpm install
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) and connect Freighter (Testnet mode).

### 2. Start the x402 server (canonical, with OZ Channels facilitator)
```bash
npx -y tsx scripts/x402_server.ts
```
This runs the x402 paid API server on port 3402. Uses `@x402/express` middleware with the OpenZeppelin Channels facilitator for payment verification and settlement. Agents sign Soroban auth entries (not full tx envelopes), and the facilitator sponsors all network fees.

### 3. Start the MPP Charge server (canonical, with @stellar/mpp)
```bash
npx -y tsx scripts/mpp_server.ts
```
This runs the MPP paid API server on port 3403. Uses `mppx` middleware with `@stellar/mpp` Charge mode. Each request triggers a Soroban SAC USDC transfer settled on-chain. Server optionally sponsors fees.

### 4. Launch the Neural Reasoner Agent (x402 buyer)
Ensure Ollama is running with DeepSeek-R1:
```bash
ollama pull deepseek-r1
npx -y tsx scripts/neural_reasoner_bot.ts
```
The agent creates a Stellar wallet, acquires USDC, then uses `@x402/fetch` with `ExactStellarScheme` to autonomously buy skills. DeepSeek-R1 decides which skill to acquire each cycle. Watch the Neural Feed in the dashboard for live reasoning logs.

### 5. Launch the MPP Agent (MPP Charge buyer)
Requires a funded sponsor account in `.env.local`:
```bash
npx -y tsx scripts/mpp_agent_bot.ts
```
Uses `mppx.fetch()` with `@stellar/mpp/charge/client` in pull mode. The agent signs auth entries, the server assembles and broadcasts. Demonstrates Stellar's Sponsorship Protocol for zero-XLM agent onboarding.

### 6. Connect as MCP Tool (Claude Desktop / Cursor)
Add to your MCP configuration:
```json
{
  "nirium-mcp": {
    "command": "npx",
    "args": ["-y", "tsx", "/absolute/path/to/scripts/mcp_server.ts"]
  }
}
```

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Network | Stellar Testnet (USDC via Soroban SAC) |
| Smart Contracts | Soroban (Rust) — 6 deployed contracts |
| x402 | `@x402/express` + `@x402/fetch` + `@x402/stellar` (ExactStellarScheme, OZ Channels facilitator) |
| MPP | `@stellar/mpp` Charge mode + `mppx` middleware (Soroban SAC per-request settlement) |
| Intelligence | Ollama (DeepSeek-R1 local) |
| Frontend | Next.js 15, Three.js (Neural Orb), Framer Motion |
| Wallet | Freighter (Soroban auth-entry signing) |
| Database | Supabase (agent logs, Neural Feed) |
| MCP | Model Context Protocol server for AI IDEs |

## Project Structure

```
nirium-core-private/
├── apps/web/                  # Next.js 15 dashboard
│   ├── app/                   # Pages (home, dashboard, marketplace, agents, etc.)
│   ├── components/            # UI components (NeuralCanvas, ProtocolRevenue, etc.)
│   └── lib/sorobanContracts.ts  # Typed wrappers for all 6 Soroban contracts
├── packages/contracts/        # Soroban smart contracts (Rust)
│   ├── src/                   # Nirium Vault (treasury, flash loans)
│   ├── elo/                   # ELO reputation system
│   ├── marketplace/           # Strategy registry
│   ├── sentinel/              # Agent performance scoring
│   ├── hub/                   # Settlement Hub (x402 & MPP escrow)
│   └── skill-vault/           # x402 payment gate
├── scripts/                   # Servers, agent bots, and MCP
│   ├── x402_server.ts         # x402 paid API (@x402/express + OZ Channels facilitator)
│   ├── mpp_server.ts          # MPP Charge paid API (@stellar/mpp + mppx)
│   ├── neural_reasoner_bot.ts # x402 buyer agent (DeepSeek-R1 + @x402/fetch)
│   ├── mpp_agent_bot.ts       # MPP Charge buyer agent (mppx.fetch + sponsorship)
│   ├── x402_agent_bot.ts      # x402 fleet testing agent
│   └── mcp_server.ts          # MCP server for AI IDEs
└── deploy_agentic_layer.sh    # Contract deployment script
```

## How the x402 Flow Works (Canonical)

Uses `@x402/express` server middleware + `@x402/fetch` client with OZ Channels facilitator.

```
1. Agent GET /skills/whale-tracker
   └── @x402/express middleware returns 402 + payment requirements

2. @x402/fetch client automatically:
   └── Builds Soroban SAC USDC transfer
   └── Signs AUTH ENTRIES only (not full tx envelope)
   └── Retries with X-PAYMENT header

3. Server middleware forwards to OZ Channels facilitator:
   ���── /verify — validates auth entry
   └── /settle — submits tx to Stellar (~5s)
   └── Facilitator pays all network fees (agent needs zero XLM)

4. Agent receives 200 + premium data (live whale movements from Horizon)
```

The Skill Vault contract provides an alternative on-chain path where payment verification and skill access are atomic within a single Soroban invocation.

## How the MPP Charge Flow Works (Canonical)

Uses `mppx` server middleware + `@stellar/mpp/charge/client` with pull mode.

```
1. Agent GET /signals/trading
   └── mppx middleware returns 402 + payment challenge

2. mppx.fetch() client automatically:
   └── Signs Soroban SAC auth entries
   └── mode: "pull" — server assembles + broadcasts the transaction
   └── Soroban SAC USDC transfer settled on-chain

3. Agent receives 200 + paid data (trading signals, whale alerts)
```

The Settlement Hub contract provides a complementary session-based path: a human locks a USDC budget in Soroban escrow via `open_session()`, the agent settles intents within the budget via `settle_intent()`, and unspent funds are refunded on `close_session()`.

## Verified Testnet Transactions

Every agent payment is a real, verifiable Stellar Testnet transaction. Here are live transaction hashes from our e2e test runs:

### x402 Payments (Agent pays for skills via Soroban auth-entry signing + OZ facilitator)

| Skill | USDC | Transaction Hash |
| :--- | :--- | :--- |
| Whale Tracker | $0.05 | [`473a679e...`](https://stellar.expert/explorer/testnet/tx/473a679e3e098e945de5f924236f5f90d6992e1eb568a313e0de98a652eda32e) |
| Arbitrage Bot | $0.02 | [`7dff5b29...`](https://stellar.expert/explorer/testnet/tx/7dff5b29f269f780ffeb3069810c6f95be2cdc054c4981983a723ff9bff54420) |

### MPP Charge Payments (Soroban SAC USDC transfers, server-sponsored fees)

| Service | USDC | Transaction Hash |
| :--- | :--- | :--- |
| Trading Signals | $0.01 | [`cdefaf72...`](https://stellar.expert/explorer/testnet/tx/cdefaf72a115b703c2ef5de1cfe36632b3c3012c586da059b2000517742fee49) |
| Whale Alerts | $0.02 | [`7f2ff3e5...`](https://stellar.expert/explorer/testnet/tx/7f2ff3e50531c7322ddb92a5023a00b28d01263e580ff8d4fe0e141bf1302d5e) |
| Sentiment Analysis | $0.01 | [`6c17e598...`](https://stellar.expert/explorer/testnet/tx/6c17e5981d4d5053bc3137d747bb6291c1ebc9fce427efa71e818c6cb93d6261) |

### Other On-Chain Evidence

| Action | Transaction Hash |
| :--- | :--- |
| Treasury XLM → USDC swap | [`d1b1cf2b...`](https://stellar.expert/explorer/testnet/tx/d1b1cf2b1d5adf1cee4ef183139d613636373efd2fc46c5eb0f7e80d712c6cf9) |
| Agent USDC setup (x402) | [`0761acd9...`](https://stellar.expert/explorer/testnet/tx/0761acd95c355b3e0ed9733251d678398c9ebb8e6fc558c6c9c244e324f4b826) |
| Agent USDC setup (MPP) | [`d124ae63...`](https://stellar.expert/explorer/testnet/tx/d124ae6372bc1a9653f6f9454db6ba82489bc072ccca127e496107ea9bdd4431) |

All transactions are verifiable on [Stellar Expert](https://stellar.expert/explorer/testnet).

## SDKs

| SDK | Package | Version |
| :--- | :--- | :--- |
| TypeScript | [`nirium`](https://www.npmjs.com/package/nirium) | 0.3.0 |
| Python | [`nirium`](https://pypi.org/project/nirium/) | 0.3.0 |

Both SDKs include x402 and MPP client wrappers for building agents that pay for services autonomously.

## Why Nirium for Institutions

1. **Automated Financial Outcomes**: Reduces FX slippage and treasury overhead by replacing manual desks with 24/7 autonomous agents.
2. **Real-World Asset Integration**: Native support for **CETES** (Mexican Treasury Bonds) via Etherfuse for institutional liquidity management.
3. **Dual Protocol Settlement**: x402 for on-demand intelligence; MPP for secure, session-based budget delegation.
4. **Auditability & Observability**: Full IPFS-stored audit trails and the Neural Feed show the "why" behind every execution for compliance teams.
5. **Zero-Friction Liquidity**: Agents are born with sponsored accounts—no XLM reserves needed to start moving USDC or CETES.
6. **Local-First Sovereign AI**: DeepSeek-R1 via Ollama ensures that financial reasoning stays private and within the institution's control.
7. **Published SDKs**: npm + PyPI packages with x402/MPP client wrappers for any developer to build agents.

---
**Built for the Agents on Stellar Hackathon 2026.**
