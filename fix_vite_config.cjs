const fs = require('fs');

const filePath = 'C:\\Users\\ppaul\\Downloads\\pmj---educacional (1)\\vite.config.ts';

if (!fs.existsSync(filePath)) {
    console.log('File not found at: ' + filePath);
    process.exit(1);
}

let buffer = fs.readFileSync(filePath);

const replacements = [
    { corrupt: [0xE2, 0x80, 0x94], correct: "—" }, // â€” -> — (EM DASH)
    { corrupt: [0xC3, 0x83], correct: "Ã" } // any other if it existed
];

let fixedCount = 0;

replacements.forEach(rep => {
    let corruptBuf = Buffer.from(rep.corrupt);
    let correctBuf = Buffer.from(rep.correct, 'utf8');

    let index = buffer.indexOf(corruptBuf);
    while (index !== -1) {
        const before = buffer.subarray(0, index);
        const after = buffer.subarray(index + corruptBuf.length);
        buffer = Buffer.concat([before, correctBuf, after]);
        fixedCount++;
        index = buffer.indexOf(corruptBuf, index + correctBuf.length);
    }
});

if (fixedCount > 0) {
    fs.writeFileSync(filePath, buffer);
    console.log(`\nSuccess! Fixed ${fixedCount} corrupted byte sequences in vite.config.ts`);
} else {
    console.log('No corrupted byte sequences fixed in vite.config.ts');
}
