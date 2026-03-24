const fs = require('fs');

const filePath = 'C:\\Users\\ppaul\\Downloads\\pmj---educacional (1)\\src\\pages\\ConfiguracoesPage.tsx';

if (!fs.existsSync(filePath)) {
    console.log('File not found at: ' + filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// Use literal strings that correspond to the broken multi-byte representations
const map = {
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã­': 'í',
    'Ã§': 'ç',
    'Ã£': 'ã',
    'Ãµ': 'õ',
    'Ãª': 'ê',
    'Ã´': 'ô',
    'Ã‰': 'É',
    'Ã“': 'Ó',
    'Ãš': 'Ú',
    'Ã‡': 'Ç',
    'Ã ': 'à',
    'Ã¢': 'â',
    'Ãƒ': 'ã',
    'Ã•': 'õ',
    'Ã‘': 'ñ',
    'Ã±': 'ñ',
    'Â ': ' '
};

let fixedCount = 0;
for (const [corrupt, correct] of Object.entries(map)) {
    if (content.includes(corrupt)) {
        content = content.split(corrupt).join(correct);
        fixedCount++;
    }
}

if (fixedCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Success! Fixed ${fixedCount} types of corrupt characters in ConfiguracoesPage.tsx`);
} else {
    console.log('No corruption found or matched in address file.');
}
