# nirium-web

Next.js 15 dashboard for the Nirium Protocol — [nirium.xyz](https://nirium.xyz)

## Stack

- **Framework**: Next.js 15.1.7 / React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **State**: Zustand 5 (client state) / React Query 5 (server state)
- **Blockchain**: Stellar SDK 14.5 + Freighter wallet + Stellar Wallets Kit 2
- **Database**: Supabase JS 2 (Realtime subscriptions)
- **3D/Visualization**: Three.js 0.160 / React Three Fiber 9 / Drei 10
- **Charts**: Recharts 2.15
- **Animation**: Framer Motion 11
- **Icons**: Lucide React
- **Validation**: Zod 3
- **Analytics**: Vercel Analytics
- **i18n**: Custom dictionary system (en / es / zh)

## Local Development

```bash
# from repo root
pnpm install
pnpm dev
```

Opens at [http://localhost:3000](http://localhost:3000). Requires Freighter browser extension in Testnet mode.

## Environment Variables

Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_CONTRACT_VAULT=CAU2XBJTQUBTMPAUFRX7GMZ337I5WLBI4GYPWHZEVXTMJ66D3CP6DEL4
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
```

The agent API URL defaults to `https://nirium-agent.fly.dev`. For local dev set `NEXT_PUBLIC_AGENT_API_URL=http://localhost:3001`.

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with hero, market ticker (5 live indicators), protocol integrations |
| `/dashboard` | Main operator dashboard — agent fleet, neural feed, revenue, settlement |
| `/agents` | Cluster agent list with status and performance metrics |
| `/analytics` | Protocol analytics and execution history |
| `/treasury` | Treasury / revenue tracking |
| `/strategies` | Strategy explorer and builder |
| `/marketplace` | Skills marketplace with install/uninstall |
| `/sandbox` | Sandbox account request and management |
| `/docs` | API documentation and guides |
| `/leaderboard` | Agent leaderboard with ELO ranking |
| `/build` | Startup Ideas Hub — developer toolkit, code examples (TS/Py/cURL/MCP) |
| `/ramp` | Fiat on-ramp (MXN → CETES → USDC via Etherfuse) |
| `/how-to-use` | Getting started guide |
| `/manifesto` | Protocol manifesto |
| `/plugins` | Plugin management |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |
| `/disclaimers` | Disclaimers |
| `/risk-disclosure` | Risk Disclosure |
| `/api/*` | Internal API routes |
| `/components/*` | Component routes |

## Live Market Ticker

The landing page and dashboard show 5 real-time indicators:
- **XLM/USDC** — multi-tier oracle (Reflector → CoinGecko → Stellar Expert)
- **SDEX SPREAD** — orderbook spread in basis points
- **BLEND APY** — Blend Protocol supply yield (~5.12%)
- **ETHERFUSE APY** — tokenized CETES yield via Etherfuse (~5.78%)
- **BASE FEE** — Stellar network base fee

## Key Components

- `MarketTicker` — live 5-indicator ticker strip
- `ProtocolFeed` — real-time agent decision logs
- `ProtocolRevenue` — revenue tracking (testnet simulation)
- `AISettingsModal` — LLM provider configuration
- `ApiKeyManager` — institutional API key management
- `StrategyBuilder` — visual strategy builder
- `WalletConnector` — Freighter + Stellar Wallets Kit integration

## Deploy

Deployed via `pnpm ship` from the repo root (Vercel CLI). Git auto-deploy is disabled.

---
*Updated April 22, 2026*
