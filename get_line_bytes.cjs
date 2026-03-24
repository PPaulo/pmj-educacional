const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\ppaul\\Downloads\\pmj---educacional (1)\\src\\pages\\ConfiguracoesPage.tsx';

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const line352 = lines[351]; // 0-indexed
console.log(`Line 352: "${line352}"\n`);

console.log("Character codes around corruption:");
for (let i = 0; i < line352.length; i++) {
    const char = line352[i];
    const code = char.charCodeAt(0);
    if (code > 127 || char === ' ' || line352.substring(i, i+6).includes('PODER')) {
         console.log(`Pos ${i}: '${char}' (Code: ${code}, Hex: 0x${code.toString(16).toUpperCase()})`);
    }
}
