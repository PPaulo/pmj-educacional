const fs = require('fs');

const filePath = 'C:\\Users\\ppaul\\Downloads\\pmj---educacional (1)\\src\\pages\\ConfiguracoesPage.tsx';

if (!fs.existsSync(filePath)) {
    console.log('File not found at: ' + filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

const map = {
    '1Âº Bimestre': '1º Bimestre',
    'Se nÃ£o for Admin': 'Se não for Admin',
    'usuÃ¡rios': 'usuários',
    'usuÃ¡rio': 'usuário',
    'EXCLUSÃƒO NÃƒO PODERÃ  SER DESFEITA': 'EXCLUSÃO NÃO PODERÁ SER DESFEITA',
    'UsuÃ¡rios': 'Usuários',
    'NOME DO USUÃ RIO': 'NOME DO USUÁRIO',
    'SuperusuÃ¡rio': 'Superusuário',
    'vÃ­nculo': 'vínculo',
    'NÃ£o informado': 'Não informado',
    'â†  Voltar para lista': '← Voltar para lista',
    'DIRETOR(A) RESPONSÃ VEL': 'DIRETOR(A) RESPONSÁVEL',
    'ENDEREÃ‡O': 'ENDEREÇO',
    'NÃºMERO': 'NÚMERO',
    'RefeitÃ³rio': 'Refeitório',
    'LaboratÃ³rio': 'Laboratório',
    'ParÃ¢metros': 'Parâmetros',
    'MÃ‰DIA MÃ NIMA': 'MÉDIA MÍNIMA',
    'Salvar ParÃ¢metros': 'Salvar Parâmetros',
    'funÃ§Ãµes': 'funções',
    'visualizaÃ§Ãµes': 'visualizações',
    'vocÃª': 'você',
    'UsuÃ¡rio': 'Usuário',
    'Editar UsuÃ¡rio': 'Editar Usuário',
    'Excluir UsuÃ¡rio': 'Excluir Usuário',
    'VocÃª': 'Você',
    'MÃ­nimo': 'Mínimo',
    'especÃ­fico': 'específico',
    'AlteraÃ§Ãµes': 'Alterações'
};

console.log("Analyzing file contents for literal matches...\n");

let fixedCount = 0;
for (const [corrupt, correct] of Object.entries(map)) {
    const found = content.includes(corrupt);
    console.log(`Checking "${corrupt}": ${found ? "FOUND" : "NOT FOUND"}`);
    if (found) {
        content = content.split(corrupt).join(correct);
        fixedCount++;
        console.log(`-> Replaced with: "${correct}"`);
    }
}

if (fixedCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`\nSuccess! Fixed ${fixedCount} literal corruptions in ConfiguracoesPage.tsx`);
} else {
    console.log('\nNo literal corruption fixed in this run.');
}
