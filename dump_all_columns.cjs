const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
let outputText = "";

function log(msg) {
    outputText += msg + "\n";
    console.log(msg); // terminal
}

async function dumpTable(tableName) {
    log(`\n=== DUMP TOTAL: ${tableName} ===`);
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
        log(`Erro em ${tableName}: ${error.message}`);
        return;
    }
    
    data.forEach(row => {
        log(JSON.stringify(row, null, 2));
    });
}

async function run() {
    log("--- Dumping ALL tables that have data ---");
    await dumpTable('profiles');
    await dumpTable('school_info');
    
    fs.writeFileSync('debug_output_dump.txt', outputText, 'utf8');
}

run();
