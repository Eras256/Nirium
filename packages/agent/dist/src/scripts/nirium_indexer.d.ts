/**
 * 🔍 Nirium Protocol — Soroban Event Indexer
 *
 * Realtime indexer for Stellar/Soroban events.
 *
 * Cómo funciona:
 *  1. Llama a Soroban RPC `getEvents` cada 5 segundos
 *  2. Filtra eventos del contrato Sentinel (CATYFAFL7…) Y del NiriumVault (CDVBAM…)
 *  3. Parsea los eventos: pool/created, vault/created, agent/delegate, etc.
 *  4. Actualiza Supabase tabla `nirium_swarm_agents` con stats reales on-chain
 *  5. Guarda el último ledger procesado para no re-procesar eventos
 *
 * Eventos del contrato Soroban:
 *  - ("pool", "created")   → pool_id, base_amount, quote_amount, fee_bps
 *  - ("vault", "created")  → vault_id, owner, name
 *  - ("agent", "delegate") → vault_id, agent_address
 *  - ("agent", "revoked")  → vault_id, agent_address
 *  - ("flash",  "exec")    → vault_id, amount, profit
 *  - ("flash",  "done")    → pool_id, borrowed, repaid
 */
export {};
//# sourceMappingURL=nirium_indexer.d.ts.map