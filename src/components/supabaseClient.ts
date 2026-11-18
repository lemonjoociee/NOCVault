import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cefnfselamtafpjqkint.supabase.co';
const supabaseAnonKey = 'sb_publishable_CUGe8oVpxkHLTFzx3d7NfA_i-KAsQPd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);