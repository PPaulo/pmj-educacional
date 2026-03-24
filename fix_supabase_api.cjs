const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Erro: Carregue as variáveis de ambiente no arquivo .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapa de caracteres corrompidos
const map = {
    'Ãƒ': 'Ã',   // EXCLUSÃƒO -> EXCLUSÃO
    'Ã¡': 'á',   // á
    'Ã©': 'é',   // é
    'Ã³': 'ó',   // ó
    'Ãº': 'ú',   // ú
    'Ã­': 'í',   // í
    'Ã§': 'ç',   // ç
    'Ã£': 'ã',   // ã
    'Ãµ': 'õ',   // õ
    'Ãª': 'ê',   // ê
    'Ã´': 'ô',   // ô
    'Ã‰': 'É',   // É
    'Ã“': 'Ó',   // Ó
    'Ãš': 'Ú',   // Ú
    'Ã‡': 'Ç',   // Ç
    'Ã ': 'à',   // à
    'Ã¢': 'â',   // â
    'Âº': 'º',   // º
    'â† ': '←',  // ←
    'Â ': ' ',    // space replacement if corrupt
};

function fixEncoding(text) {
    if (!text || typeof text !== 'string') return text;
    let fixed = text;
    for (const [corrupt, correct] of Object.entries(map)) {
        if (fixed.includes(corrupt)) {
            fixed = fixed.split(corrupt).join(correct);
        }
    }
    return fixed;
}

// Configuração de tabelas e colunas a atualizar
const tasks = [
    {
        table: 'students',
        columns: ['name', 'mother_name', 'father_name', 'neighborhood', 'city', 'observations']
    },
    {
        table: 'employees',
        columns: ['name', 'role', 'department', 'neighborhood', 'city']
    },
    {
        table: 'occurrences',
        columns: ['title', 'description']
    },
    {
        table: 'classes',
        columns: ['name']
    },
    {
        table: 'school_info',
        columns: ['name', 'neighborhood', 'city']
    }
];

async function runFix() {
    console.log('--- Iniciando Correção de Caracteres no Supabase ---');
    
    for (const task of tasks) {
        console.log(`\nProcessando tabela: ${task.table}...`);
        
        try {
            const { data, error } = await supabase
                .from(task.table)
                .select(`id, ${task.columns.join(',')}`);
                
            if (error) {
                console.error(`Erro ao buscar dados de ${task.table}:`, error.message);
                continue;
            }
            
            console.log(`Encontradas ${data.length} linhas.`);
            let updateCount = 0;

            for (const row of data) {
                let needsUpdate = false;
                const updatePayload = {};

                for (const col of task.columns) {
                    if (row[col]) {
                        const fixedValue = fixEncoding(row[col]);
                        if (fixedValue !== row[col]) {
                            updatePayload[col] = fixedValue;
                            needsUpdate = true;
                        }
                    }
                }

                if (needsUpdate) {
                    const { error: upError } = await supabase
                        .from(task.table)
                        .update(updatePayload)
                        .eq('id', row.id);
                        
                    if (upError) {
                        console.error(`Erro ao atualizar ID ${row.id} em ${task.table}:`, upError.message);
                    } else {
                        updateCount++;
                    }
                }
            }
            console.log(`✅ Sucesso! Atualizadas ${updateCount} linhas em ${task.table}`);
            
        } catch (err) {
            console.error(`Falha inesperada em ${task.table}:`, err.message);
        }
    }
    console.log('\n--- Correção Concluída ---');
}

runFix();
