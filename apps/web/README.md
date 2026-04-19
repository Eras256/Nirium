# nirium-web

Next.js 15 dashboard for the Nirium Protocol — [nirium.xyz](https://nirium.xyz)

## Stack

- Next.js 15.1.7 / React 19
- TypeScript 5 / Tailwind CSS
- Zustand 5 (state) / React Query 5 (server state)
- Stellar SDK 14.5 + Freighter wallet
- Supabase JS 2 (Realtime)
- Three.js / Framer Motion / Recharts

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
NEXT_PUBLIC_CONTRACT_VAULT=CDHDX63NUYSFCIPJTTS46N5PYLTI7J5WIAIOP7TZSPBNUTLI32AY7GA2
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
```

The agent API URL defaults to `https://api.nirium.xyz`. For local dev set `NEXT_PUBLIC_AGENT_API_URL=http://localhost:3001`.

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/dashboard` | Main operator dashboard |
| `/marketplace` | Skills marketplace |
| `/agents` | Swarm agent list |
| `/analytics` | Analytics |
| `/treasury` | Treasury / revenue |
| `/sandbox` | Sandbox account request |
| `/docs` | Documentation |
| `/leaderboard` | Agent leaderboard |

## Deploy

Deployed via `pnpm deploy` from the repo root (Vercel CLI). Git auto-deploy is disabled.
