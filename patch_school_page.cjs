const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'SchoolPage.tsx');

if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// 1. Adicionar States de Autenticação para SchoolId
if (!content.includes('const [userRole, setUserRole]')) {
    content = content.replace(
        `const [isModalOpen, setIsModalOpen] = useState(false);`,
        `const [userRole, setUserRole] = useState<string>('Secretaria');\n  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);\n  const [isModalOpen, setIsModalOpen] = useState(false);`
    );
}

// 2. Atualizar states no loadData
content = content.replace(
    `if (profile) {\n            schoolId = profile.school_id;\n            userRole = profile.role;\n          }`,
    `if (profile) {\n            schoolId = profile.school_id;\n            userRole = profile.role;\n            setUserRole(profile.role);\n            setUserSchoolId(profile.school_id);\n          }`
);

// 3. Expandir formData State
content = content.replace(
    `  const [formData, setFormData] = useState<Omit<AcademicClass, 'id'>>({\n    name: '',\n    year: '2025',\n    shift: 'Matutino',\n    room: '',\n    teacherId: ''\n  });`,
    `  const [formData, setFormData] = useState<Omit<AcademicClass, 'id'>>({\n    name: '',\n    year: '2026',\n    shift: 'Matutino',\n    room: '',\n    teacherId: '',\n    course: 'Ensino Fundamental I',\n    grade: '',\n    capacity: 35,\n    status: 'Ativa'\n  });`
);

// 4. Expandir handleOpenModal
content = content.replace(
    `      setFormData({\n        name: cls.name,\n        year: cls.year,\n        shift: cls.shift,\n        room: cls.room || '',\n        teacherId: cls.teacherId || ''\n      });`,
    `      setFormData({\n        name: cls.name,\n        year: cls.year,\n        shift: cls.shift,\n        room: cls.room || '',\n        teacherId: cls.teacherId || '',\n        course: cls.course || 'Ensino Fundamental I',\n        grade: cls.grade || '',\n        capacity: cls.capacity || 35,\n        status: cls.status || 'Ativa'\n      });`
);

content = content.replace(
    `      setFormData({\n        name: '',\n        year: '2025',\n        shift: 'Matutino',\n        room: '',\n        teacherId: ''\n      });`,
    `      setFormData({\n        name: '',\n        year: '2026',\n        shift: 'Matutino',\n        room: '',\n        teacherId: '',\n        course: 'Ensino Fundamental I',\n        grade: '',\n        capacity: 35,\n        status: 'Ativa'\n      });`
);

// 5. Vincular school_id no handleSave
content = content.replace(
    `      const mappedData = camelToSnake(formData);\n      if (mappedData.teacher_id === '') mappedData.teacher_id = null;`,
    `      const mappedData = camelToSnake(formData);\n      if (mappedData.teacher_id === '') mappedData.teacher_id = null;\n      if (!classToEdit && userSchoolId) mappedData.school_id = userSchoolId;`
);

// 6. Expandir colunas da Tabela Desktop
content = content.replace(
    `<th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Turno</th>`,
    `<th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nível/Curso</th>\n                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Série</th>\n                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Turno</th>`
);

content = content.replace(
    `<td className="px-6 py-4 text-slate-500 dark:text-slate-400">{cls.shift}</td>`,
    `<td className="px-6 py-4 text-slate-500 dark:text-slate-400">{cls.course || '-'}</td>\n                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{cls.grade || '-'}</td>\n                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{cls.shift}</td>`
);

// 7. Adicionar Inputs no FormModal
const formInputsToReplace = `                  <div>
                    <label className="text-sm font-medium">Nome da Turma</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm" placeholder="Ex: 1º Ano A" />
                  </div>`;

const newFormInputs = `                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-sm font-medium">Nome da Turma</label>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm" placeholder="Ex: 1º Ano A" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-sm font-medium">Nível / Curso</label>
                      <select value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                        <option value="Educação Infantil">Educação Infantil</option>
                        <option value="Ensino Fundamental I">Ensino Fundamental I</option>
                        <option value="Ensino Fundamental II">Ensino Fundamental II</option>
                        <option value="Ensino Médio">Ensino Médio</option>
                        <option value="EJA">EJA</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Série / Etapa</label>
                      <input value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm" placeholder="Ex: 1º Ano, maternal II" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Capacidade Máxima</label>
                      <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm" />
                    </div>
                  </div>`;

content = content.replace(formInputsToReplace, newFormInputs);

// Form Modal 2: Adicionar status
content = content.replace(
    `                  <div>\n                    <label className="text-sm font-medium">Professor Regente</label>\n                    <select value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">\n                      <option value="">Nenhum</option>\n                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}\n                    </select>\n                  </div>`,
    `                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Professor Regente</label>
                      <select value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                        <option value="">Nenhum</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                        <option value="Ativa">Ativa</option>
                        <option value="Encerrada">Encerrada</option>
                        <option value="Trancada">Trancada</option>
                      </select>
                    </div>
                  </div>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Sucesso! Frontend (SchoolPage.tsx) atualizado para modelo ERP.');
