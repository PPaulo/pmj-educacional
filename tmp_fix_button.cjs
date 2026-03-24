const fs = require('fs');
const file = 'c:\\Users\\ppaul\\Downloads\\pmj---educacional (1)\\src\\pages\\ConfiguracoesPage.tsx';
let txt = fs.readFileSync(file, 'utf8');

const btnRegex = /<button onClick=\{\(\) => setShowCreateModal\(true\)\} className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md">/;

const btnReplace = `<button onClick={() => { 
                               if (userRole !== 'Admin' && selectedSchool?.id) {
                                   setNewUserSchoolId(selectedSchool.id);
                               }
                               setShowCreateModal(true); 
                           }} className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md">`;

txt = txt.replace(btnRegex, btnReplace);

fs.writeFileSync(file, txt, 'utf8');
console.log('Script 2 Executado!');
