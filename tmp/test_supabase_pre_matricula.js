import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('Checking pre_registrations table...');
  const { data, error } = await supabase
    .from('pre_registrations')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error querying pre_registrations:', error);
  } else {
    console.log('Successfully queried pre_registrations. Rows found:', data.length);
    if (data.length > 0) {
      console.log('Columns found from row:', Object.keys(data[0]));
    } else {
      console.log('No rows to inspect columns.');
    }
  }

  // Also check if schools list loads properly
  const { data: schools, error: schoolError } = await supabase
    .from('school_info')
    .select('id, name');

  if (schoolError) {
    console.error('Error querying school_info:', schoolError);
  } else {
    console.log('Successfully queried school_info. Rows found:', schools.length);
  }
}

checkTable();
