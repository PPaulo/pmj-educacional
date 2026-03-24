const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'ConfiguracoesPage.tsx');

if (!fs.existsSync(filePath)) {
    console.log('Arquivo não encontrado:', filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// Usando Expressões Regulares (Regex) para ignorar variações invisíveis de espaços/bytes
const fixes = [
    { regex: /â†\s*/g, replace: '← ' },
    { regex: /RESPONSÃ\s*VEL/g, replace: 'RESPONSÁVEL' },
    { regex: /MÃ\s*NIMA/g, replace: 'MÍNIMA' }
];

let needsUpdate = false;

fixes.forEach(fix => {
    if (fix.regex.test(content)) {
        content = content.replace(fix.regex, fix.replace);
        needsUpdate = true;
        console.log(`Aplicada correção para: ${fix.regex}`);
    }
});

if (needsUpdate) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('\n✅ Sucesso! aba de configurações da escola corrigida localmente.');
} else {
    console.log('\nNenhum termo corrompido encontrado pelas Regexes.');
}
