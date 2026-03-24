import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatusColumn() {
  console.log('Testing insert in pre_registrations with status...');
  const testData = {
    student_name: 'Teste Aluno Status',
    birth_date: '2015-01-01',
    doc_cpf: '12345678902',
    responsavel_name: 'Teste Responsavel',
    responsavel_phone: '11999999999',
    class_interest: 'Maternal I',
    school_interest: null,
    status: 'Aprovado' // testing if this column exists
  };

  const { data, error } = await supabase
    .from('pre_registrations')
    .insert([testData]);

  if (error) {
    console.error('Error inserting with status:', error);
  } else {
    console.log('Successfully inserted with status column!', data);
  }
}

checkStatusColumn();
