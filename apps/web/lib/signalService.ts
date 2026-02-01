import { supabase } from './supabase';

export interface MarketSignal {
    id: string;
    type: string;
    pair: string;
    data: {
        expectedProfit: number;
        profitPercentage: number;
        urgency: string;
        confidence: number;
        timeToLive: number;
        details: string;
    };
    timestamp: string;
}

export const SignalService = {
    async getRecentSignals(limit = 10): Promise<MarketSignal[]> {
        if (!supabase) return [];

        try {
            const { data, error } = await supabase
                .from('nirium_protocol_records')
                .select('*')
                .eq('record_type', 'SIGNAL')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('[SignalService] Error fetching signals:', error.message);
                return [];
            }

            // Map and bypass TS typing issues for the unified table
            return (data || []).map((row: any) => ({
                id: row.id,
                type: row.name, // signal_type was stored in name in previous update
                pair: row.data?.pair || 'XLM-USDC',
                data: row.data,
                timestamp: row.created_at
            })) as MarketSignal[];
        } catch (err) {
            console.error('[SignalService] Network error:', err);
            return [];
        }
    }
};
