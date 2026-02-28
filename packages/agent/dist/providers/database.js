import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseKey) {
    console.warn('[DB Provider] Supabase URL or Key missing. Database operations will fail.');
}
export const supabase = createClient(supabaseUrl, supabaseKey);
//# sourceMappingURL=database.js.map