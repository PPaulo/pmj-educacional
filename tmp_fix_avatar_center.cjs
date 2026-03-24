const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'ConfiguracoesPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the relative div to add w-fit and mx-auto
const target = `<div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>`;
const replacement = `<div className="relative group cursor-pointer w-fit mx-auto" onClick={() => document.getElementById('avatar-upload')?.click()}>`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Avatar center style configuration applied successfully!');
} else {
    console.log('Target string not found in file directly.');
    // Try without spacing just in case
    const approx = `className="relative group cursor-pointer"`;
    if (content.includes(approx)) {
        content = content.replace(approx, `className="relative group cursor-pointer w-fit mx-auto"`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Applied using approximate match!');
    } else {
        console.log('Approximate target also not found.');
    }
}
