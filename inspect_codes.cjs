const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
let out = "--- DUMP TOTAL SCHOOL_INFO COLUMNS ---\n\n";

async function run() {
    const { data, error } = await supabase.from('school_info').select('*');
    if (error) {
        out += `Erro: ${error.message}\n`;
    } else {
        data.forEach(row => {
            out += `\nID: ${row.id}\n`;
            for (const [key, value] of Object.entries(row)) {
                if (value && typeof value === 'string') {
                    out += ` [${key}]: "${value}"\n`;
                    // Diagnostica se tem Ã ou Â
                    if (value.includes('Ã') || value.includes('Â')) {
                        out += `  --> SUSPEITA DE CORRUPÇÃO ENCONTRADA!\n`;
                    }
                }
            }
        });
    }
    fs.writeFileSync('school_info_dump_all.txt', out, 'utf8');
}

run();
