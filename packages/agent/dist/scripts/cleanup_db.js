import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
dotenv.config();
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
async function clean() {
    console.log("Cleaning ghost agents from db...");
    const { data: agents } = await supabase.from('nirium_swarm_agents').select('id');
    if (agents) {
        const toDelete = agents.filter(a => a.id.startsWith('G') && a.id.length > 20).map(a => a.id);
        if (toDelete.length > 0) {
            console.log("Deleting:", toDelete);
            await supabase.from('nirium_swarm_agents').delete().in('id', toDelete);
        }
        // Let's also equalize their scores briefly so it triggers a rat race!
        const toUpdate = agents.filter(a => !a.id.startsWith('G'));
        for (const a of toUpdate) {
            // Set everyone to 1400 +/- 5 txs so they rapidly overtake each other
            const baseTxt = 1400 + Math.floor(Math.random() * 5);
            await supabase.from('nirium_swarm_agents').update({
                total_txs: baseTxt,
                sdex_txs: Math.floor(baseTxt / 2),
                soroban_txs: Math.floor(baseTxt / 2)
            }).eq('id', a.id);
        }
    }
    console.log("Cleaned. Please restart your swarm script.");
}
clean();
//# sourceMappingURL=cleanup_db.js.map