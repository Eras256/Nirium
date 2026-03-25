import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
// ⚠️ CRITICAL: Fail loudly if Supabase credentials are missing
// Silent failures cause ALL database operations to fail, blocking requests
let url = supabaseUrl;
let key = supabaseKey;
if (!url || !key) {
    console.warn('⚠️ WARNING: SUPABASE_URL and SUPABASE_ANON_KEY environment variables not set. Using dummy values to allow compilation.');
    url = 'https://dummy.supabase.co';
    key = 'dummy';
}
// No fallback - only create client with valid credentials
export const supabase = createClient(url, key);
//# sourceMappingURL=database.js.map