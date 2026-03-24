const fs = require('fs');
const path = require('path');

const typesPath = path.join(__dirname, 'src', 'types.ts');
const schoolPagePath = path.join(__dirname, 'src', 'pages', 'SchoolPage.tsx');
const sqlPath = path.join(__dirname, 'update_classes_erp.sql');

// 1. ATUALIAR TYPES.TS
if (fs.existsSync(typesPath)) {
    let typesContent = fs.readFileSync(typesPath, 'utf8');
    typesContent = typesContent.replace(
        `  course?: string;\n  grade?: string;\n  capacity?: number;\n  status?: 'Ativa' | 'Encerrada' | 'Trancada';`,
        `  course?: string;\n  grade?: string;\n  capacity?: number;\n  status?: 'Ativa' | 'Encerrada' | 'Trancada';\n  minAttendance?: number;\n  evaluationType?: 'Nota' | 'Conceito' | 'Parecer';\n  startTime?: string;\n  endTime?: string;\n  periodType?: 'Bimestral' | 'Trimestral';\n  passingGrade?: number;\n  totalHours?: number;`
    );
    fs.writeFileSync(typesPath, typesContent, 'utf8');
    console.log('✅ types.ts atualizado.');
}

// 2. ATUALIZAR SCHOOLPAGE.TSX (FORMULÁRIO E STATES)
if (fs.existsSync(schoolPagePath)) {
    let pageContent = fs.readFileSync(schoolPagePath, 'utf8');

    // Expandir default formData
    pageContent = pageContent.replace(
        `    course: 'Ensino Fundamental I',\n    grade: '',\n    capacity: 35,\n    status: 'Ativa'`,
        `    course: 'Ensino Fundamental I',\n    grade: '',\n    capacity: 35,\n    status: 'Ativa',\n    minAttendance: 75,\n    evaluationType: 'Nota',\n    startTime: '07:00',\n    endTime: '12:00',\n    periodType: 'Bimestral',\n    passingGrade: 6.0,\n    totalHours: 800`
    );

    // Expandir loading modal edit
    pageContent = pageContent.replace(
        `        course: cls.course || 'Ensino Fundamental I',\n        grade: cls.grade || '',\n        capacity: cls.capacity || 35,\n        status: cls.status || 'Ativa'`,
        `        course: cls.course || 'Ensino Fundamental I',\n        grade: cls.grade || '',\n        capacity: cls.capacity || 35,\n        status: cls.status || 'Ativa',\n        minAttendance: cls.minAttendance || 75,\n        evaluationType: cls.evaluationType || 'Nota',\n        startTime: cls.startTime || '07:00',\n        endTime: cls.endTime || '12:00',\n        periodType: cls.periodType || 'Bimestral',\n        passingGrade: cls.passingGrade || 6.0,\n        totalHours: cls.totalHours || 800`
    );

    // Expandir loading modal create
    pageContent = pageContent.replace(
        `        course: 'Ensino Fundamental I',\n        grade: '',\n        capacity: 35,\n        status: 'Ativa'`,
        `        course: 'Ensino Fundamental I',\n        grade: '',\n        capacity: 35,\n        status: 'Ativa',\n        minAttendance: 75,\n        evaluationType: 'Nota',\n        startTime: '07:00',\n        endTime: '12:00',\n        periodType: 'Bimestral',\n        passingGrade: 6.0,\n        totalHours: 800`
    );

    // Injetar novos inputs no formulário (Acima do botões div)
    const extraInputs = `                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Freq. Mínima (%)</label>
                      <input type="number" value={formData.minAttendance} onChange={e => setFormData({...formData, minAttendance: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Avaliação</label>
                      <select value={formData.evaluationType} onChange={e => setFormData({...formData, evaluationType: e.target.value as any})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                        <option value="Nota">Por Notas</option>
                        <option value="Conceito">Por Conceito</option>
                        <option value="Parecer">Parecer Descritivo</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Início Aula</label>
                      <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Término Aula</label>
                      <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Período</label>
                      <select value={formData.periodType} onChange={e => setFormData({...formData, periodType: e.target.value as any})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                        <option value="Bimestral">Bimestral</option>
                        <option value="Trimestral">Trimestral</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Média Ap.</label>
                      <input type="number" step="0.5" value={formData.passingGrade} onChange={e => setFormData({...formData, passingGrade: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Total Horas</label>
                      <input type="number" value={formData.totalHours} onChange={e => setFormData({...formData, totalHours: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm" />
                    </div>
                  </div>\n\n                  <div className="flex justify-end gap-2 pt-4">`;

    if (pageContent.includes('<div className="flex justify-end gap-2 pt-4">')) {
        pageContent = pageContent.replace('<div className="flex justify-end gap-2 pt-4">', extraInputs);
        fs.writeFileSync(schoolPagePath, pageContent, 'utf8');
        console.log('✅ SchoolPage.tsx atualizado com campos ERP avançados.');
    }
}

// 3. ATUALIZAR SQL
if (fs.existsSync(sqlPath)) {
    let sqlContent = fs.readFileSync(sqlPath, 'utf8');
    sqlContent = sqlContent.replace(
        `ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Ativa' CHECK (status IN ('Ativa', 'Encerrada', 'Trancada'));`,
        `ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Ativa' CHECK (status IN ('Ativa', 'Encerrada', 'Trancada'));\nALTER TABLE public.classes ADD COLUMN IF NOT EXISTS min_attendance INTEGER DEFAULT 75;\nALTER TABLE public.classes ADD COLUMN IF NOT EXISTS evaluation_type TEXT DEFAULT 'Nota' CHECK (evaluation_type IN ('Nota', 'Conceito', 'Parecer'));\nALTER TABLE public.classes ADD COLUMN IF NOT EXISTS start_time TIME DEFAULT '07:00';\nALTER TABLE public.classes ADD COLUMN IF NOT EXISTS end_time TIME DEFAULT '12:00';\nALTER TABLE public.classes ADD COLUMN IF NOT EXISTS period_type TEXT DEFAULT 'Bimestral' CHECK (period_type IN ('Bimestral', 'Trimestral'));\nALTER TABLE public.classes ADD COLUMN IF NOT EXISTS passing_grade NUMERIC DEFAULT 6.0;\nALTER TABLE public.classes ADD COLUMN IF NOT EXISTS total_hours INTEGER DEFAULT 800;`
    );
    fs.writeFileSync(sqlPath, sqlContent, 'utf8');
    console.log('✅ update_classes_erp.sql atualizado.');
}
