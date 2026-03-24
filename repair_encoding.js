const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'ConfiguracoesPage.tsx');

if (!fs.existsSync(filePath)) {
    console.log('File not found at Absolute Path: ' + filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

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
    'Ã¢': 'â'
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
    console.log('No corruption matched inside the structure.');
}
