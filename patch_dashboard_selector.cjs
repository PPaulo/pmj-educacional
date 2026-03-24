const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'DashboardPage.tsx');

if (!fs.existsSync(filePath)) {
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// 1. Adicionar States
if (!content.includes('const [selectedSchoolId, setSelectedSchoolId]')) {
    content = content.replace(
        `  const [chartData, setChartData] = useState<any[]>(fallbackData);`,
        `  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');\n  const [chartData, setChartData] = useState<any[]>(fallbackData);`
    );
}

// 2. Modificar loadStats para respeitar o filtro
content = content.replace(
    `        if (role !== 'Admin' && schoolId) {\n            studentQuery = studentQuery.eq('school_id', schoolId);\n            teacherQuery = teacherQuery.eq('school_id', schoolId);\n            classQuery = classQuery.eq('school_id', schoolId);\n            eventQuery = eventQuery.eq('school_id', schoolId);\n        }`,
    `        const filterId = role === 'Admin' ? currentProfile?.active_filter : schoolId;\n        if (role !== 'Admin' && schoolId) {\n            studentQuery = studentQuery.eq('school_id', schoolId);\n            teacherQuery = teacherQuery.eq('school_id', schoolId);\n            classQuery = classQuery.eq('school_id', schoolId);\n            eventQuery = eventQuery.eq('school_id', schoolId);\n        } else if (role === 'Admin' && filterId) {\n            studentQuery = studentQuery.eq('school_id', filterId);\n            teacherQuery = teacherQuery.eq('school_id', filterId);\n            classQuery = classQuery.eq('school_id', filterId);\n            eventQuery = eventQuery.eq('school_id', filterId);\n        }`
);

// 3. Modificar feeds (events/students) no loadStats
content = content.replace(
    `        if (role !== 'Admin' && schoolId) {\n            eventsFeed = eventsFeed.eq('school_id', schoolId);\n            studentsFeed = studentsFeed.eq('school_id', schoolId);\n            attQuery = attQuery.eq('school_id', schoolId);\n        }`,
    `        if (role !== 'Admin' && schoolId) {\n            eventsFeed = eventsFeed.eq('school_id', schoolId);\n            studentsFeed = studentsFeed.eq('school_id', schoolId);\n            attQuery = attQuery.eq('school_id', schoolId);\n        } else if (role === 'Admin' && filterId) {\n            eventsFeed = eventsFeed.eq('school_id', filterId);\n            studentsFeed = studentsFeed.eq('school_id', filterId);\n            attQuery = attQuery.eq('school_id', filterId);\n        }`
);

// 4. Injetar Div com Select de Escola
const welcomeWithSelect = `          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {(profile as any)?.gender === 'Feminino' || (!(profile as any)?.gender && profile?.name?.trim().split(' ')[0].toLowerCase().endsWith('a')) ? 'Bem-vinda' : 'Bem-vindo'}, {profile?.name || '...'}
          </h2>
          <p className="text-slate-500">Aqui está o resumo da sua instituição hoje.</p>

          {profile?.role === 'Admin' && (
            <div className="mt-4 flex max-w-sm">
                 <select value={selectedSchoolId} onChange={e => { setSelectedSchoolId(e.target.value); (loadStats as any)({ ...profile, active_filter: e.target.value }); }} className="w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-sm font-semibold shadow-sm text-slate-700 dark:text-slate-300">
                      <option value="">📊 Resumo Consolidado de Toda a Rede</option>
                      {schoolsList.map(s => <option key={s.id} value={s.id}>🏫 {s.name}</option>)}
                 </select>
            </div>
          )}
        </motion.div>`;

content = content.replace(
    `          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {(profile as any)?.gender === 'Feminino' || (!(profile as any)?.gender && profile?.name?.trim().split(' ')[0].toLowerCase().endsWith('a')) ? 'Bem-vinda' : 'Bem-vindo'}, {profile?.name || '...'}
          </h2>
          <p className="text-slate-500">Aqui está o resumo da sua instituição hoje.</p>
        </motion.div>`,
    welcomeWithSelect
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Dashboard atualizado com Filtro de Unidades para Administração de Rede.');
