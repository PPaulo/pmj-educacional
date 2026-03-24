const fs = require('fs');

const filePath = 'C:\\Users\\ppaul\\Downloads\\pmj---educacional (1)\\src\\pages\\ConfiguracoesPage.tsx';

if (!fs.existsSync(filePath)) {
    console.log('File not found at: ' + filePath);
    process.exit(1);
}

let buffer = fs.readFileSync(filePath);

// Define byte arrays for string corruptions
const replacements = [
    { corrupt: [0xC3, 0x83], correct: "Ã" }, // Ãƒ -> Ã
    { corrupt: [0xC3, 0x82], correct: "Â" }, // other corrupt prefix
    { corrupt: [0xC3, 0xBA], correct: "ú" }, // Ãº -> ú
    { corrupt: [0xC3, 0xA1], correct: "á" }, // á
    { corrupt: [0xC3, 0xA9], correct: "é" }, // é
    { corrupt: [0xC3, 0xB3], correct: "ó" }, // ó
    { corrupt: [0xC3, 0xAD], correct: "í" }, // í
    { corrupt: [0xC3, 0xA7], correct: "ç" }, // ç
    { corrupt: [0xC3, 0xA3], correct: "ã" }, // ã
    { corrupt: [0xC3, 0xB5], correct: "õ" }, // õ
    { corrupt: [0xC3, 0xAA], correct: "ê" }, // ê
    { corrupt: [0xC3, 0xB4], correct: "ô" }, // ô
    { corrupt: [0xC3, 0x89], correct: "É" }, // É
    { corrupt: [0xC3, 0x93], correct: "Ó" }, // Ó
    { corrupt: [0xC3, 0x9A], correct: "Ú" }, // Ú
    { corrupt: [0xC3, 0x87], correct: "Ç" }, // Ç
    { corrupt: [0xC3, 0xA0], correct: "à" }, // à
    { corrupt: [0xC3, 0xA2], correct: "â" }, // â
    { corrupt: [0xC2, 0xBA], correct: "º" }, // Âº -> º
    { corrupt: [0xE2, 0x86, 0x90], correct: "←" } // â†  -> ←
];

let fixedCount = 0;

replacements.forEach(rep => {
    let corruptBuf = Buffer.from(rep.corrupt);
    let correctBuf = Buffer.from(rep.correct, 'utf8');

    let index = buffer.indexOf(corruptBuf);
    while (index !== -1) {
        // Replace buffer part
        const before = buffer.subarray(0, index);
        const after = buffer.subarray(index + corruptBuf.length);
        buffer = Buffer.concat([before, correctBuf, after]);
        fixedCount++;
        index = buffer.indexOf(corruptBuf, index + correctBuf.length);
    }
});

if (fixedCount > 0) {
    fs.writeFileSync(filePath, buffer);
    console.log(`\nSuccess! Fixed ${fixedCount} corrupted byte sequences in ConfiguracoesPage.tsx`);
} else {
    console.log('No corrupted byte sequences fixed with Buffer replacement.');
}
