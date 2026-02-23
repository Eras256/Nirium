import { supabase } from './supabase';

export interface ActiveStrategy {
    id?: string;
    strategy_id: string; // The type (e.g., 'sui-usdc-loop')
    name: string;
    emoji: string;
    status: string;
    yield: string;
    asset?: 'XLM' | 'USDC';  // vault asset type
    tx_digest?: string;
    created_at?: string;
    config?: any;
}

// ─── localStorage helpers (offline fallback) ────────────────────────────────

const LS_KEY = (wallet: string) => `sui_loop_strategies_${wallet}`;

function lsGet(wallet: string): ActiveStrategy[] {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY(wallet)) || '[]');
    } catch {
        return [];
    }
}

function lsSet(wallet: string, strategies: ActiveStrategy[]): void {
    try {
        localStorage.setItem(LS_KEY(wallet), JSON.stringify(strategies));
    } catch { /* quota exceeded – silently ignore */ }
}

// ─── Helper: check if Supabase is reachable ──────────────────────────────────

let _supabaseReachable: boolean | null = null; // cached per session

async function isSupabaseReachable(): Promise<boolean> {
    if (_supabaseReachable !== null) return _supabaseReachable;
    if (!supabase) { _supabaseReachable = false; return false; }
    try {
        // Lightweight probe – just a HEAD request to the REST endpoint
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!url) { _supabaseReachable = false; return false; }
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch(`${url}/rest/v1/`, { method: 'HEAD', signal: ctrl.signal });
        clearTimeout(timer);
        _supabaseReachable = res.ok || res.status < 500;
    } catch {
        _supabaseReachable = false;
    }
    return _supabaseReachable;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const StrategyService = {
    // Fetch all active strategies for a wallet
    async getStrategies(walletAddress: string): Promise<ActiveStrategy[]> {
        const reachable = await isSupabaseReachable();

        if (reachable && supabase) {
            try {
                console.log('[StrategyService] Fetching kernels for:', walletAddress);
                const { data, error } = await supabase
                    .from('strategies')
                    .select('*')
                    .eq('user_id', walletAddress)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.warn('[StrategyService] Supabase fetch error, falling back to localStorage:', error.message);
                } else {
                    const remote = data.map((row: any) => ({
                        id: row.id,
                        strategy_id: row.name,
                        name: row.config?.displayName || row.name,
                        emoji: row.config?.emoji || '🤖',
                        status: row.status,
                        yield: row.config?.yield || '0%',
                        asset: (row.config?.asset as 'XLM' | 'USDC') || 'XLM',
                        tx_digest: row.config?.txDigest,
                        created_at: row.created_at,
                        config: row.config
                    }));
                    // Sync remote data back to localStorage as backup
                    lsSet(walletAddress, remote);
                    return remote;
                }
            } catch (err) {
                console.warn('[StrategyService] Network error during getStrategies, using localStorage:', err);
            }
        } else {
            console.warn('[StrategyService] Supabase unreachable – using localStorage fallback.');
        }

        // Fallback: localStorage
        return lsGet(walletAddress);
    },

    // Save a new deployed strategy (or update existing with same name)
    async deployStrategy(walletAddress: string, strategy: ActiveStrategy) {
        // Always persist to localStorage first so UI never blocks
        const local = lsGet(walletAddress);
        const existingIdx = local.findIndex(s => s.strategy_id === strategy.strategy_id);
        const entry: ActiveStrategy = {
            ...strategy,
            id: existingIdx >= 0 ? local[existingIdx].id : `local_${Date.now()}`,
            created_at: strategy.created_at || new Date().toISOString(),
        };
        if (existingIdx >= 0) {
            local[existingIdx] = entry;
        } else {
            local.unshift(entry);
        }
        lsSet(walletAddress, local);

        // Attempt Supabase (non-blocking; failures are swallowed)
        const reachable = await isSupabaseReachable();
        if (!reachable || !supabase) {
            console.warn('[StrategyService] Supabase offline – strategy saved to localStorage only.');
            return entry;
        }

        try {
            // Check if a record with the same name already exists for this user
            const { data: existing } = await supabase
                .from('strategies')
                .select('id')
                .eq('user_id', walletAddress)
                .eq('name', strategy.strategy_id)
                .single();

            if (existing) {
                const { data, error } = await (supabase
                    .from('strategies') as any)
                    .update({
                        status: strategy.status || 'RUNNING',
                        config: {
                            displayName: strategy.name,
                            emoji: strategy.emoji,
                            yield: strategy.yield,
                            asset: strategy.asset || 'XLM',
                            txDigest: strategy.tx_digest,
                            ...strategy.config
                        }
                    } as any)
                    .eq('id', (existing as any).id)
                    .select()
                    .single();

                if (error) {
                    console.warn('[StrategyService] Supabase update failed (localStorage used):', error.message);
                    return entry;
                }
                return data;
            }

            // Insert new record
            const { data, error } = await supabase
                .from('strategies')
                .insert({
                    user_id: walletAddress,
                    name: strategy.strategy_id,
                    status: strategy.status || 'RUNNING',
                    config: {
                        displayName: strategy.name,
                        emoji: strategy.emoji,
                        yield: strategy.yield,
                        asset: strategy.asset || 'XLM',
                        txDigest: strategy.tx_digest,
                        ...strategy.config
                    }
                } as any)
                .select()
                .single();

            if (error) {
                console.warn('[StrategyService] Supabase insert failed (localStorage used):', error.message);
                return entry;
            }
            return data;

        } catch (err) {
            console.warn('[StrategyService] Network error during deployStrategy (localStorage used):', err);
            return entry;
        }
    },

    // Stop (Delete/Update) a strategy
    async stopStrategy(dbId: string, walletAddress?: string) {
        // Remove from localStorage
        if (walletAddress) {
            const local = lsGet(walletAddress);
            lsSet(walletAddress, local.filter(s => s.id !== dbId));
        }

        const reachable = await isSupabaseReachable();
        if (!reachable || !supabase) {
            console.warn('[StrategyService] Supabase offline – strategy removed from localStorage only.');
            return;
        }

        try {
            const { error } = await supabase
                .from('strategies')
                .delete()
                .eq('id', dbId);

            if (error) {
                console.warn('[StrategyService] Error stopping strategy in Supabase:', error);
            }
        } catch (err) {
            console.warn('[StrategyService] Network error during stopStrategy:', err);
        }
    }
};
