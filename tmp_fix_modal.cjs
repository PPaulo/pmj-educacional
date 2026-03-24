const fs = require('fs');
const file = 'c:\\Users\\ppaul\\Downloads\\pmj---educacional (1)\\src\\pages\\ConfiguracoesPage.tsx';
let txt = fs.readFileSync(file, 'utf8');

// replace Admin option
txt = txt.replace(
  /<option value="Admin">Admin<\/option>/g, 
  "{userRole === 'Admin' && <option value=\"Admin\">Admin</option>}"
);

// replace School select
const schoolRegex = /<select value=\{newUserSchoolId\} onChange=\{e => setNewUserSchoolId\(e\.target\.value\)\} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm">[\s\S]*?<option value="">Sem vínculo específico<\/option>[\s\S]*?\{schools\.map\(sch => \([\s\S]*?<option key=\{sch\.id\} value=\{sch\.id\}>\{sch\.name\}<\/option>[\s\S]*?\)\)\}[\s\S]*?<\/select>/;

const schoolReplace = `<select value={newUserSchoolId} onChange={e => setNewUserSchoolId(e.target.value)} disabled={userRole !== 'Admin'} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm">
                      {userRole === 'Admin' ? (
                          <>
                              <option value="">Sem vínculo específico</option>
                              {schools.map(sch => (
                                  <option key={sch.id} value={sch.id}>{sch.name}</option>
                              ))}
                          </>
                      ) : (
                          <option value={selectedSchool?.id || ''}>{selectedSchool?.name || 'Sua Unidade'}</option>
                      )}
                  </select>`;

txt = txt.replace(schoolRegex, schoolReplace);

fs.writeFileSync(file, txt, 'utf8');
console.log('Script Executado com Sucesso!');
