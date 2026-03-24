const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
let outputText = "";

function log(msg) {
    outputText += msg + "\n";
    console.log(msg); // terminal
}

async function debugTableCount(tableName) {
    const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
        
    if (error) {
        log(`Tabela ${tableName}: Erro -> ${error.message}`);
    } else {
        log(`Tabela ${tableName}: ${count} linhas`);
    }
}

async function debugTableDetails(tableName, columns) {
    log(`\n=== Detalhes Tabela: ${tableName} ===`);
    const { data, error } = await supabase.from(tableName).select(`id, ${columns.join(',')}`).limit(5);
    if (error) {
        log(`Erro em ${tableName}: ${error.message}`);
        return;
    }
    
    data.forEach(row => {
        log(`ID: ${row.id}`);
        for (const col of columns) {
            const text = row[col];
            if (text) {
                log(` [${col}]: "${text}"`);
            } else {
                log(` [${col}]: NULL`);
            }
        }
    });
}

async function run() {
    log("--- Diagnóstico de Tabelas e Contagens ---");
    const tables = ['students', 'occurrences', 'employees', 'classes', 'profiles', 'school_info'];
    
    for (const t of tables) {
        await debugTableCount(t);
    }
    
    // Agora tenta puxar alguns perfis ou escola, já que students estava zerado
    await debugTableDetails('profiles', ['name', 'role']);
    await debugTableDetails('school_info', ['name']);
    
    fs.writeFileSync('debug_output_counts.txt', outputText, 'utf8');
}

run();
