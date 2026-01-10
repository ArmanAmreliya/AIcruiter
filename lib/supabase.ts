
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wirgkvdcmdspzbqzagrv.supabase.co';
const supabaseKey = 'sb_publishable_D_FwyVHTdW2TDPJLbn_ZJw_HDaVQZpX';

export const supabase = createClient(supabaseUrl, supabaseKey);
