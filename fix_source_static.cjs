const fs = require('fs');
const path = require('path');

// Mapeamento específico para palavras inteiras ou sequências que o grep encontrou
const map = {
    'EXCLUSÃO NÃO PODERÃ  SER DESFEITA': 'EXCLUSÃO NÃO PODERÁ SER DESFEITA',
    'NOME DO USUÃ RIO': 'NOME DO USUÁRIO',
    'DIRETOR(A) RESPONSÃ VEL': 'DIRETOR(A) RESPONSÁVEL',
    'MÉDIA MÃ NIMA': 'MÉDIA MÍNIMA',
    'PODERÃ  ': 'PODERÁ'
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
    console.log(`Buscando em ${files.length} arquivos de código...`);
    let filesFixed = 0;

    files.forEach(filePath => {
        let content = fs.readFileSync(filePath, 'utf8');
        let needsUpdate = false;

        for (const [corrupt, correct] of Object.entries(map)) {
            if (content.includes(corrupt)) {
                content = content.split(corrupt).join(correct);
                needsUpdate = true;
                console.log(`[CORREÇÃO] Em: ${path.basename(filePath)} -> "${corrupt}" para "${correct}"`);
            }
        }

        if (needsUpdate) {
            fs.writeFileSync(filePath, content, 'utf8');
            filesFixed++;
        }
    });

    console.log(`\n✅ Sucesso! Corrigido estaticamente ${filesFixed} arquivos de código.`);
}

runFix();
