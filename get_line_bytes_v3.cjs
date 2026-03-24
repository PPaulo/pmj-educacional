const fs = require('fs');

const filePath = 'C:\\Users\\ppaul\\Downloads\\pmj---educacional (1)\\src\\pages\\ConfiguracoesPage.tsx';
const content = fs.readFileSync(filePath, 'utf8');

const index = content.indexOf('USUÃ RIO');
if (index !== -1) {
    const snippet = content.substring(index - 10, index + 20);
    console.log(`Snippet around USUÃ RIO: "${snippet}"`);
    console.log("\nByte-by-byte codes:");
    for (let i = 0; i < snippet.length; i++) {
        const char = snippet[i];
        const code = char.charCodeAt(0);
        console.log(`Pos ${i}: '${char}' (Code: ${code}, Hex: 0x${code.toString(16).toUpperCase()})`);
    }
} else {
    console.log('USUÃ RIO not found in file');
}
