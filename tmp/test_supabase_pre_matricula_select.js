import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSelect() {
  console.log('Testing join select in pre_registrations with school_info...');
  const { data, error } = await supabase
    .from('pre_registrations')
    .select('*, school_info(name)')
    .limit(1);

  if (error) {
    console.error('Error with join query:', error);
  } else {
    console.log('Successfully queried join select with school_info. Rows found:', data.length);
    if (data.length > 0) {
      console.log('Row content:', JSON.stringify(data[0], null, 2));
    }
  }
}

checkSelect();
