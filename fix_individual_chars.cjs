const fs = require('fs');

const filePath = 'C:\\Users\\ppaul\\Downloads\\pmj---educacional (1)\\src\\pages\\ConfiguracoesPage.tsx';

if (!fs.existsSync(filePath)) {
    console.log('File not found at: ' + filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// Define individual byte sequence corruptions that are ALWAYS wrong in words
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

let fixedCount = 0;
for (const [corrupt, correct] of Object.entries(map)) {
    if (content.includes(corrupt)) {
        content = content.split(corrupt).join(correct);
        fixedCount++;
        console.log(`Replaced sequence: "${corrupt}" -> "${correct}"`);
    }
}

if (fixedCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`\nSuccess! Fixed ${fixedCount} types of corrupted character sequences in ConfiguracoesPage.tsx`);
} else {
    console.log('No individual corruption sequences found in ConfiguracoesPage.tsx');
}
