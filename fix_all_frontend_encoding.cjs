const fs = require('fs');
const path = require('path');

// Dicionário de Correção EXATO que você usou anteriormente
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
    'Ã ': 'Á'    // map Ã space occasionally -> Á
};

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

function runFix() {
    const srcDir = path.join(__dirname, 'src');
    if (!fs.existsSync(srcDir)) {
        console.log('Diretório src não encontrado.');
        return;
    }

    const files = getAllFiles(srcDir);
    console.log(`Verificando e corrigindo ${files.length} arquivos frontend...`);
    let filesFixed = 0;

    files.forEach(filePath => {
        let content = fs.readFileSync(filePath, 'utf8');
        let needsUpdate = false;

        for (const [corrupt, correct] of Object.entries(map)) {
            if (content.includes(corrupt)) {
                content = content.split(corrupt).join(correct);
                needsUpdate = true;
                console.log(`[CORRIGIDO] ${path.basename(filePath)} -> Substituto: "${corrupt}" para "${correct}"`);
            }
        }

        if (needsUpdate) {
            fs.writeFileSync(filePath, content, 'utf8');
            filesFixed++;
        }
    });

    console.log(`\n✅ Sucesso! Total de ${filesFixed} arquivos frontend corrigidos.`);
}

runFix();
