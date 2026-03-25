/**
 * 🛰️ Nirium Protocol — Full Swarm Orchestrator (V6 - Supabase Sync)
 *
 * Dual-layer traffic:
 *  - 🟣 Native SDEX: manageSellOffer (XLM/USDC)
 *  - 🔵 Soroban:     create_pool / get_vault_count / etc.
 *
 * All confirmed txs are upserted into Supabase → nirium_swarm_agents
 * so the leaderboard at nirium-stellar.vercel.app/leaderboard shows live data.
 */
export {};
//# sourceMappingURL=nirium_full_swarm.d.ts.map