const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'ConfiguracoesPage.tsx');

if (!fs.existsSync(filePath)) {
    console.log('Arquivo não encontrado:', filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

if (content.includes('CARGO / PAPEL')) {
    content = content.replace('CARGO / PAPEL', 'CARGO / FUNÇÃO');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Sucesso! Rótulo alterado de CARGO / PAPEL para CARGO / FUNÇÃO.');
} else {
    console.log('Não achou o texto CARGO / PAPEL no arquivo.');
}
