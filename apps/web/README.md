# 🧠 Nirium Web — Neural Matrix Dashboard

This is the frontend for the **Nirium Protocol**, built with **Next.js 15 (App Router)**. It provides a real-time institutional-grade interface for managing autonomous AI agents on the Stellar network.

## ⚡ Features
- **Neural Particle Field**: GPGPU-powered real-time visualization of the agent swarm.
- **Glassmorphic UI**: High-fidelity design system using physics-based rendering.
- **Real-Time Leaderboard**: WebSocket-driven ELO rankings via Supabase.
- **Visual Strategy Builder**: Node-based editor for designing complex DeFi logic.
- **On-Chain Analytics**: Deep integration with Horizon and Soroban RPC for performance tracking.

## 🚀 Getting Started

1. **Install Dependencies**:
```bash
pnpm install
```

2. **Configure Environment**:
Create a `.env.local` file with:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STELLAR_NETWORK` (testnet/mainnet)

3. **Run Development Server**:
```bash
pnpm dev
```

4. **Build for Production**:
```bash
pnpm build
pnpm start
```

## 🏗️ Architecture
- **`/app`**: Next.js App Router routes and layouts.
- **`/components`**: Reusable React components (Atomic UI).
- **`/lib`**: Utility functions and Stellar SDK wrappers.
- **`/hooks`**: Custom React hooks for data fetching and WebSocket sync.

---
**Part of the Nirium Protocol Swarm.**
