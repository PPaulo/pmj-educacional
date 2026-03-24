const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'ConfiguracoesPage.tsx');

if (!fs.existsSync(filePath)) {
    console.log('Arquivo não encontrado:', filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Linha 414 corresponde à index 413 do array (0-indexed)
if (lines[413] && lines[413].includes('USUÃ')) {
    lines[413] = '                            <label className="text-xs font-bold text-slate-400">NOME DO USUÁRIO</label>';
    console.log('Linha 414 (Nome do Usuário) corrigida.');
} else {
    console.log('Não achou USUÃ na linha 414. Tentando busca geral...');
    // Caso tenha mudado de linha por causa de edições anteriores
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('NOME DO USUÃ')) {
            lines[i] = '                            <label className="text-xs font-bold text-slate-400">NOME DO USUÁRIO</label>';
            console.log(`Linha ${i + 1} corrigida via busca geral.`);
            break;
        }
    }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('\n✅ Sucesso! Aba Perfil corrigida localmente.');
