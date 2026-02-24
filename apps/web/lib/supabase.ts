import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Ensure we only create the client if we have the keys
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;
