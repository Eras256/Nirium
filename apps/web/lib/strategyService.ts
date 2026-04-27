import { supabase } from './supabase';
import { toast } from 'sonner';

export interface ActiveStrategy {
    id?: string;
    strategy_id: string; // The type (e.g., 'nirium-usdc-loop')
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

// Two keys exist due to historical split between dashboard & service layers.
// We unify reads from both to prevent agents disappearing after deploy.
const LS_KEY = (wallet: string) => `nirium_strategies_${wallet}`;
const LS_KEY_FLEET = (wallet: string) => `nirium-fleet-${wallet}`;  // dashboard key

function lsGet(wallet: string): ActiveStrategy[] {
    try {
        const fromService: ActiveStrategy[] = JSON.parse(localStorage.getItem(LS_KEY(wallet)) || '[]');
        const fromFleet: any[] = JSON.parse(localStorage.getItem(LS_KEY_FLEET(wallet)) || '[]');

        // Normalize fleet entries to ActiveStrategy shape
        const normalizedFleet: ActiveStrategy[] = fromFleet
            .filter((s: any) => s.status && s.status !== 'DRAFT')
            .map((s: any) => ({
                id: s.id || s.strategy_id,
                strategy_id: s.strategy_id || s.id,
                name: s.name || s.strategy_id,
                emoji: s.emoji || '🤖',
                status: s.status || 'RUNNING',
                yield: s.yield || s.yield_text || '0%',
                tx_digest: s.tx_digest,
                created_at: s.created_at,
                config: s.config,
            }));

        // Merge: service records take priority, fleet fills gaps
        const merged = new Map<string, ActiveStrategy>();
        fromService.forEach(s => { if (s.id || s.strategy_id) merged.set(s.id || s.strategy_id!, s); });
        normalizedFleet.forEach(s => {
            const key = s.id || s.strategy_id!;
            if (key && !merged.has(key)) merged.set(key, s);
        });

        return Array.from(merged.values());
    } catch {
        return [];
    }
}

function lsSet(wallet: string, strategies: ActiveStrategy[]): void {
    try {
        localStorage.setItem(LS_KEY(wallet), JSON.stringify(strategies));
        localStorage.setItem(LS_KEY_FLEET(wallet), JSON.stringify(strategies));
    } catch { /* quota exceeded – silently ignore */ }
}

// ─── Helper: check if Supabase is reachable ──────────────────────────────────

let _supabaseReachable: boolean | null = null; // cached per session

async function isSupabaseReachable(): Promise<boolean> {
    if (_supabaseReachable !== null) return _supabaseReachable;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // As long as we have the variables, we assume reachable.
    // The actual queries will handle their own try-catch errors.
    _supabaseReachable = !!(supabase && url && key && url !== "PEGA_TU_NUEVA_URL_AQUI");
    return _supabaseReachable;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const StrategyService = {
    // Fetch all active strategies for a wallet
    async getStrategies(walletAddress: string): Promise<ActiveStrategy[]> {
        const reachable = await isSupabaseReachable();

        if (reachable && supabase) {
            try {
                console.log('[StrategyService] Fetching kernels from unified records for:', walletAddress);
                const { data, error } = await supabase
                    .from('nirium_protocol_records')
                    .select('*')
                    .eq('owner_address', walletAddress)
                    .eq('record_type', 'STRATEGY')
                    .order('created_at', { ascending: false });

                if (error) {
                    toast.error(`Supabase fetch error: ${error.message}`);
                    console.warn('[StrategyService] Supabase fetch error, falling back to localStorage:', error.message);
                } else {
                    const remote = data.map((row: any) => ({
                        id: row.id,
                        strategy_id: row.name,
                        name: row.name,
                        emoji: row.emoji || '🤖',
                        status: row.status,
                        yield: row.yield_text || '0%',
                        asset: (row.asset as 'XLM' | 'USDC') || 'XLM',
                        tx_digest: row.tx_digest ?? null,
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

        // Attempt Supabase (non-blocking)
        const reachable = await isSupabaseReachable();
        if (!reachable || !supabase) {
            console.warn('[StrategyService] Supabase offline – strategy saved to localStorage only.');
            return entry;
        }

        try {
            // Check if a record with the same name already exists for this user
            const { data: existing } = await supabase
                .from('nirium_protocol_records')
                .select('id')
                .eq('owner_address', walletAddress)
                .eq('record_type', 'STRATEGY')
                .eq('name', strategy.strategy_id)
                .single();

            const payload = {
                owner_address: walletAddress,
                record_type: 'STRATEGY',
                name: strategy.strategy_id,
                emoji: strategy.emoji || '🤖',
                asset: strategy.asset || 'XLM',
                status: strategy.status || 'RUNNING',
                yield_text: strategy.yield || '0.00%',
                tx_digest: strategy.tx_digest || null,
                config: strategy.config || {},
                updated_at: new Date().toISOString()
            };

            if (existing) {
                const { data, error } = await (supabase
                    .from('nirium_protocol_records') as any)
                    .update(payload)
                    .eq('id', (existing as any).id)
                    .select()
                    .single();

                if (error) {
                    toast.error(`Update failed: ${error.message}`);
                    console.warn('[StrategyService] Supabase update failed:', error.message);
                    return entry;
                }
                return data;
            }

            // Insert new record
            const { data, error } = await (supabase
                .from('nirium_protocol_records') as any)
                .insert(payload)
                .select()
                .single();

            if (error) {
                toast.error(`Insert failed: ${error.message}`);
                console.warn('[StrategyService] Supabase insert failed:', error.message);
                return entry;
            }
            return data;

        } catch (err: any) {
            toast.error(`Strategy Fetch Error (Network): ${err?.message || 'Unknown network error'}`);
            console.warn('[StrategyService] Network error during deployStrategy:', err);
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
                .from('nirium_protocol_records')
                .delete()
                .eq('id', dbId);

            if (error) {
                console.warn('[StrategyService] Error stopping strategy in Supabase:', error);
            }
        } catch (err) {
            console.warn('[StrategyService] Network error during stopStrategy:', err);
        }
    },

    // Register an installed skill/capability
    async registerSkill(walletAddress: string, skillId: string, metadata: any = {}) {
        // Local persistence
        const localKey = `nirium_skills_${walletAddress}`;
        const skills = JSON.parse(localStorage.getItem(localKey) || '{}');
        skills[skillId] = { installed_at: new Date().toISOString(), ...metadata };
        localStorage.setItem(localKey, JSON.stringify(skills));

        const reachable = await isSupabaseReachable();
        if (!reachable || !supabase) return;

        try {
            await (supabase.from('nirium_protocol_records') as any).upsert({
                owner_address: walletAddress,
                record_type: 'SKILL',
                name: skillId,
                config: metadata,
                updated_at: new Date().toISOString()
            }, { onConflict: 'owner_address,record_type,name' });
        } catch (err) {
            console.warn('[StrategyService] Error registering skill in Supabase:', err);
        }
    },

    // Get all installed skills for a wallet
    async getInstalledSkills(walletAddress: string): Promise<Record<string, boolean>> {
        const localKey = `nirium_skills_${walletAddress}`;
        const local = JSON.parse(localStorage.getItem(localKey) || '{}');
        
        const reachable = await isSupabaseReachable();
        if (!reachable || !supabase) return local;

        try {
            const { data } = await supabase
                .from('nirium_protocol_records')
                .select('name')
                .eq('owner_address', walletAddress)
                .eq('record_type', 'SKILL');

            const remote: Record<string, boolean> = {};
            (data as any[])?.forEach(row => { remote[row.name] = true; });
            return { ...local, ...remote };
        } catch {
            return local;
        }
    }
};
