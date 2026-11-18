import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cefnfselamtafpjqkint.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_CUGe8oVpxkHLTFzx3d7NfA_i-KAsQPd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);