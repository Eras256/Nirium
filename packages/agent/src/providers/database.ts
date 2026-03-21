import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// ⚠️ CRITICAL: Fail loudly if Supabase credentials are missing
// Silent failures cause ALL database operations to fail, blocking requests
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '❌ FATAL: SUPABASE_URL and SUPABASE_ANON_KEY environment variables must be set. ' +
    'Get these from your Supabase project dashboard at https://app.supabase.com'
  );
}

// No fallback - only create client with valid credentials
export const supabase = createClient(supabaseUrl, supabaseKey);
