import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseConfigError = hasSupabaseEnv
  ? null
  : 'Faltan VITE_SUPABASE_URL y una key valida: VITE_SUPABASE_ANON_KEY o VITE_SUPABASE_PUBLISHABLE_KEY en .env.local';

export const supabase = hasSupabaseEnv ? createClient(supabaseUrl!, supabaseAnonKey!) : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? 'Supabase no esta configurado.');
  }

  return supabase;
}
