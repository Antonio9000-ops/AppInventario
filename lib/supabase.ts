import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://apybslnnavrcwsaohgfy.supabase.co';
const supabaseKey = 'sb_publishable_llcxzWjFhYkfC2B6WOGESw_4k7kf9gD';

export const supabase = createClient(supabaseUrl, supabaseKey);
