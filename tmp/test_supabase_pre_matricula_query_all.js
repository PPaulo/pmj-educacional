import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAll() {
  console.log('Querying all rows in pre_registrations...');
  const { data, error } = await supabase
    .from('pre_registrations')
    .select('*');

  if (error) {
    console.error('Error querying all:', error);
  } else {
    console.log('Successfully queried all rows in pre_registrations. Rows found:', data.length);
    if (data.length > 0) {
      console.log('First row content:', JSON.stringify(data[0], null, 2));
    }
  }
}

checkAll();
