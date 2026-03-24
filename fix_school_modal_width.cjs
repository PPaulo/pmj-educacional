const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'SchoolPage.tsx');

if (!fs.existsSync(filePath)) {
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

if (content.includes('max-w-md p-6 rounded-2xl')) {
    content = content.replace('max-w-md p-6 rounded-2xl', 'max-w-lg p-6 rounded-2xl');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Modal expandido para max-w-lg.');
}
