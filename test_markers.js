const fs = require('fs');
let file = fs.readFileSync('src/pages/ConfiguracoesPage.tsx', 'utf8');

const startMarker = '<label className="text-xs font-bold text-slate-400">NOME DO USUÁRIO</label>';
console.log("Start marker index:", file.indexOf(startMarker));

const match = file.match(/<\/div>\s*<\/div>\s*\)\s*:\s*\(/);
console.log("End marker match:", match ? match.index : 'NOT FOUND');
