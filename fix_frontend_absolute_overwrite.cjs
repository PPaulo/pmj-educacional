const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'ConfiguracoesPage.tsx');

if (!fs.existsSync(filePath)) {
    console.log('Arquivo não encontrado:', filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Linhas a serem substituídas (0-indexed do array)
// 498 corresponde à linha 499 (0-indexed)
if (lines[498] && lines[498].includes('Voltar')) {
    lines[498] = '                                     <button onClick={() => { setSelectedSchool(null); setIsCreatingSchool(false); }} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold">← Voltar para lista</button>';
    console.log('Linha 499 corrigida.');
}

if (lines[540] && lines[540].includes('DIRETOR')) {
    lines[540] = '                                                <label className="text-xs font-bold text-slate-400">DIRETOR(A) RESPONSÁVEL</label>';
    console.log('Linha 541 corrigida.');
}

if (lines[649] && lines[649].includes('MÉDIA')) {
    lines[649] = '                                          <label className="text-xs font-bold text-slate-400">MÉDIA MÍNIMA (NOTA)</label>';
    console.log('Linha 650 corrigida.');
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('\n✅ Sucesso! Linhas específicas da aba Escola substituídas com sucesso.');
