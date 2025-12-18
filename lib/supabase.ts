import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = '';
const supabaseKey = '';

export const supabase = createClient(supabaseUrl, supabaseKey);
