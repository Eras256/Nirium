import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[DB Provider] Supabase URL or Key missing. Database operations will fail.');
}

// Fallback to a dummy URL so we don't crash the whole agent if the user doesn't have Supabase configured
export const supabase = createClient(
  supabaseUrl || 'https://dummy-nirium-project.supabase.co',
  supabaseKey || 'dummy_key'
);
