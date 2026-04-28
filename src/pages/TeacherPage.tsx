import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { 
  LayoutDashboard, 
  ClipboardList, 
  CheckSquare, 
  BookOpen, 
  Plus, 
  Save, 
  Search, 
  CalendarCheck, 
  FileText, 
  Check, 
  X,
  Edit,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { snakeToCamel, sortStudents } from '../lib/utils';

const tabs = [
  { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
  { id: 'grades', label: 'Notas e Faltas', icon: ClipboardList },
  { id: 'attendance', label: 'Chamada Diária', icon: CheckSquare },
  { id: 'planning', label: 'Planejamentos', icon: BookOpen },
];

const subjects = ['Português', 'Matemática', 'História', 'Geografia', 'Ciências', 'Artes', 'Educação Física'];
const periods = ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'];

export function TeacherPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);

  // States for sub-modules
  const [students, setStudents] = useState<any[]>([]);
  const [gradesData, setGradesData] = useState<any>({});
  const [attendanceData, setAttendanceData] = useState<any>({});
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Planning state
  const [plannings, setPlannings] = useState<any[]>([]);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [planningForm, setPlanningForm] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    title: '', 
    content: '',
    objetivos: '',
    bncc: '', // BNCC Skills
    links: '', // Web Links
    metodologia: '',
    recursos: '',
    avaliacao: ''
  });
  const [editingPlanningId, setEditingPlanningId] = useState<string | null>(null);

  // Class Diary / Conteudo Ministrado state
  const [diaryEntry, setDiaryEntry] = useState({ id: null, topic: '', content: '', bnccCodes: '' });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadClasses = async () => {
      const { data } = await supabase.from('classes').select('*').order('name');
      setClasses(snakeToCamel(data || []));
    };
    loadClasses();
  }, []);

  // Reset state on class change
  useEffect(() => {
    if (selectedClass) {
      loadStudentsAndGrades();
      if (activeTab === 'planning') loadPlannings();
    } else {
      setStudents([]);
      setGradesData({});
    }
  }, [selectedClass, selectedSubject, selectedPeriod, activeTab]);

  useEffect(() => {
     if (selectedClass && activeTab === 'attendance') {
        loadAttendance();
     }
  }, [selectedClass, attendanceDate, activeTab]);

  const loadStudentsAndGrades = async () => {
    setLoading(true);
    try {
      const { data: stds } = await supabase
        .from('students')
        .select('id, name, registration, entry_date')
        .eq('class', selectedClass.name);

      const allStudents = snakeToCamel(stds || []);
      setStudents(sortStudents(allStudents));

      const { data: grades } = await supabase
        .from('grades')
        .select('*')
        .eq('class_id', selectedClass.id)
        .eq('subject', selectedSubject)
        .eq('period', selectedPeriod);

      const mapped: any = {};
      grades?.forEach(g => {
        mapped[g.student_id] = { grade: g.grade, absences: g.absences, id: g.id };
      });
      setGradesData(mapped);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    try {
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', selectedClass.id)
        .eq('date', attendanceDate);

      const mapped: any = {};
      data?.forEach((a: any) => {
          mapped[a.student_id] = { status: a.status, justification: a.justification, id: a.id };
      });
      setAttendanceData(mapped);

      // Load Class Diary Entry for the day
      const { data: diary } = await supabase
        .from('class_diary')
        .select('*')
        .eq('class_id', selectedClass.id)
        .eq('subject', selectedSubject)
        .eq('date', attendanceDate)
        .maybeSingle();

      if (diary) {
        setDiaryEntry({ id: diary.id, topic: diary.topic || '', content: diary.content || '', bnccCodes: diary.bncc_codes || '' });
      } else {
        setDiaryEntry({ id: null, topic: '', content: '', bnccCodes: '' });
      }
    } catch (err) {
        console.error(err);
    }
  };

  const loadPlannings = async () => {
      try {
          const { data } = await supabase
            .from('plannings')
            .select('*')
            .eq('class_id', selectedClass.id)
            .eq('subject', selectedSubject)
            .order('date', { ascending: false });

          setPlannings(data || []);
      } catch (err) {
          console.error("Erro ao carregar planejamentos");
      }
  };

  const handleSaveGrades = async () => {
    setLoading(true);
    try {
      const inserts = [];
      for (const std of students) {
        const item = gradesData[std.id] || {};
        const row: any = {
          student_id: std.id,
          class_id: selectedClass.id,
          subject: selectedSubject,
          period: selectedPeriod,
          grade: item.grade ? parseFloat(item.grade) : null,
          absences: item.absences ? parseInt(item.absences) : 0
        };
        if (item.id) row.id = item.id;
        inserts.push(row);
      }

      const { error } = await supabase.from('grades').upsert(inserts);
      if (error) throw error;
      toast.success('Notas e Faltas salvas!');
      loadStudentsAndGrades();
    } catch (err: any) {
      toast.error('Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    try {
      const inserts = [];
      for (const std of students) {
         const item = attendanceData[std.id] || { status: 'Presente' };
         const row: any = {
             student_id: std.id,
             class_id: selectedClass.id,
             date: attendanceDate,
             status: item.status
         };
         if (item.id) row.id = item.id;
         if (item.justification) row.justification = item.justification;
         inserts.push(row);
      }

      const { error } = await supabase.from('attendance').upsert(inserts);
      
      // Save Diary Entry
      const { error: diaryError } = await supabase.from('class_diary').upsert({
          id: diaryEntry.id || undefined,
          class_id: selectedClass.id,
          subject: selectedSubject,
          date: attendanceDate,
          topic: diaryEntry.topic,
          content: diaryEntry.content,
          bncc_codes: diaryEntry.bnccCodes
      });

      if (error || diaryError) throw (error || diaryError);
      toast.success('Frequência e Diário salvos!');
    } catch (err: any) {
        toast.error('Erro ao salvar frequência / diário');
    } finally {
      setLoading(false);
    }
  };

  const handleExecutePlanning = async (plan: any) => {
    if (plan.status !== 'Aprovado') {
        toast.error('Apenas planejamentos aprovados podem ser executados.');
        return;
    }
    
    setLoading(true);
    try {
        let parsed: any = {};
        try { parsed = JSON.parse(plan.content); } catch {}

        const { error } = await supabase.from('class_diary').upsert({
            class_id: plan.class_id,
            subject: plan.subject,
            date: plan.date,
            topic: plan.title,
            content: (parsed.objetivos || '') + "\n\n" + (parsed.metodologia || '') + "\n\n" + (parsed.content || ''),
            bncc_codes: parsed.bncc || ''
        });

        if (error) throw error;
        toast.success(`Planejamento "${plan.title}" migrado para o diário do dia ${new Date(plan.date).toLocaleDateString()}!`);
        setActiveTab('attendance');
        setAttendanceDate(plan.date);
    } catch (err: any) {
        toast.error('Erro ao migrar para diário.');
    } finally {
        setLoading(false);
    }
  };

  const handleEditPlanning = (plan: any) => {
      setEditingPlanningId(plan.id);
      try {
          const parsed = JSON.parse(plan.content);
          setPlanningForm({
              date: plan.date, 
              title: plan.title, 
              content: parsed.content || '',
              objetivos: parsed.objetivos || '',
              bncc: parsed.bncc || '',
              links: parsed.links || '',
              metodologia: parsed.metodologia || '',
              recursos: parsed.recursos || '',
              avaliacao: parsed.avaliacao || ''
          });
      } catch {
          setPlanningForm({ 
              date: plan.date, title: plan.title, content: plan.content, 
              objetivos: '', bncc: '', links: '', metodologia: '', recursos: '', avaliacao: '' 
          });
      }
      setIsPlanningModalOpen(true);
  };

  const handleClonePlanning = (plan: any) => {
      setEditingPlanningId(null);
      try {
          const parsed = JSON.parse(plan.content);
          setPlanningForm({
              date: new Date().toISOString().split('T')[0], 
              title: `${plan.title} (Cópia)`, 
              content: parsed.content || '',
              objetivos: parsed.objetivos || '',
              bncc: parsed.bncc || '',
              links: parsed.links || '',
              metodologia: parsed.metodologia || '',
              recursos: parsed.recursos || '',
              avaliacao: parsed.avaliacao || ''
          });
      } catch {
          setPlanningForm({ 
              date: new Date().toISOString().split('T')[0], title: `${plan.title} (Cópia)`, content: plan.content, 
              objetivos: '', bncc: '', links: '', metodologia: '', recursos: '', avaliacao: '' 
          });
      }
      setIsPlanningModalOpen(true);
      toast.success('Dados preenchidos! Selecione a nova turma se desejar.');
  };

  const handleSavePlanning = async (e: any) => {
      e.preventDefault();
      try {
          const structuredContent = JSON.stringify({
              objetivos: planningForm.objetivos,
              bncc: planningForm.bncc,
              links: planningForm.links,
              metodologia: planningForm.metodologia,
              recursos: planningForm.recursos,
              avaliacao: planningForm.avaliacao,
              content: planningForm.content 
          });

          const row: any = {
              class_id: selectedClass.id,
              subject: selectedSubject,
              date: planningForm.date,
              title: planningForm.title,
              content: structuredContent,
              status: 'Pendente',
              feedback: null
          };

          const { error } = editingPlanningId 
              ? await supabase.from('plannings').update(row).eq('id', editingPlanningId)
              : await supabase.from('plannings').insert(row);

          if (error) throw error;

          toast.success(editingPlanningId ? 'Planejamento atualizado!' : 'Planejamento adicionado!');
          setIsPlanningModalOpen(false);
          setEditingPlanningId(null);
          setPlanningForm({ date: new Date().toISOString().split('T')[0], title: '', content: '', objetivos: '', bncc: '', links: '', metodologia: '', recursos: '', avaliacao: '' });
          loadPlannings();
      } catch (err) {
          toast.error('Erro ao salvar planejamento.');
      }
  };

  return (
    <>
      <Header title="Painel do Professor" />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto font-sans">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Portal do Docente</h1>
          <p className="text-slate-500 text-sm">Registro de aulas, diário escolar e lançamentos pedagógicos.</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TOP SELECTOR BAR */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 flex flex-wrap gap-4 shadow-sm">
          <div>
            <label className="text-xs font-bold text-slate-500">Turma</label>
            <select 
              value={selectedClass?.id || ''} 
              onChange={e => setSelectedClass(classes.find(c => c.id === e.target.value))}
              className="mt-1 block px-3 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Selecione...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {(activeTab === 'grades' || activeTab === 'planning' || activeTab === 'attendance') && (
            <div>
              <label className="text-xs font-bold text-slate-500">Disciplina</label>
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="mt-1 block px-3 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-600">
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {activeTab === 'grades' && (
            <div>
              <label className="text-xs font-bold text-slate-500">Bimestre</label>
              <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="mt-1 block px-3 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-600">
                {periods.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <label className="text-xs font-bold text-slate-500">Data Letiva</label>
              <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="mt-1 block px-3 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-600" />
            </div>
          )}
        </div>

        {!selectedClass && activeTab !== 'dashboard' && (
            <div className="p-8 text-center text-slate-500">
                Selecione uma **Turma** na barra acima para continuar.
            </div>
        )}

        <AnimatePresence mode="wait">
          {/* 1. DASHBOARD INÍCIO */}
          {activeTab === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {classes.map(c => (
                     <div key={c.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:shadow-md transition">
                         <div className="flex justify-between items-start mb-4">
                             <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{c.name}</h3>
                                <p className="text-slate-500 text-xs">Ano Letivo: {c.year}</p>
                             </div>
                             <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg text-xs font-bold">{c.shift}</span>
                         </div>
                         <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-slate-100 dark:border-slate-800/50">
                             <div>
                                <p className="text-slate-400 text-xs">Sala</p>
                                <p className="font-semibold text-slate-700 dark:text-slate-300">{c.room || '-'}</p>
                             </div>
                         </div>
                         <button onClick={() => { setSelectedClass(c); setActiveTab('attendance'); }} className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-lg border dark:border-slate-700">Fazer Chamada</button>
                     </div>
                 ))}
              </div>
            </motion.div>
          )}

          {/* 2. TABELA DE NOTAS */}
          {activeTab === 'grades' && selectedClass && (
            <motion.div key="grades" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-3 font-bold text-slate-600">Alunos {selectedClass.name}</th>
                      <th className="px-6 py-3 w-32 font-bold text-slate-600">Nota</th>
                      <th className="px-6 py-3 w-32 font-bold text-slate-600">Faltas Acumuladas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(std => {
                       const item = gradesData[std.id] || {};
                       return (
                        <tr key={std.id} className="border-b border-slate-200 dark:border-slate-800/40 hover:bg-slate-50/50">
                          <td className="px-6 py-3 font-medium text-slate-800 dark:text-white">{std.name}</td>
                          <td className="px-6 py-3">
                            <input type="number" step="0.1" min="0" max="100" placeholder="0.0" value={item.grade || ''} onChange={e => setGradesData({...gradesData, [std.id]: { ...item, grade: e.target.value }})} className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800" />
                          </td>
                          <td className="px-6 py-3">
                            <input type="number" min="0" placeholder="0" value={item.absences || ''} onChange={e => setGradesData({...gradesData, [std.id]: { ...item, absences: e.target.value }})} className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800" />
                          </td>
                        </tr>
                       );
                    })}
                  </tbody>
                </table>
              </div>
              <button disabled={loading} onClick={handleSaveGrades} className="float-right flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">
                <Save size={16} /> Salvar Notas
              </button>
            </motion.div>
          )}

          {/* 3. CHAMADA / FREQUÊNCIA */}
          {activeTab === 'attendance' && selectedClass && (
            <motion.div key="attendance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* DIARIO DE CLASSE - CONTEUDO MINISTRADO */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-serif italic"><FileText className="text-blue-600" size={24} /> Diário de Classe - Conteúdo do Dia</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">Tema/Tópico da Aula</label>
                          <input type="text" value={diaryEntry.topic} onChange={e => setDiaryEntry({...diaryEntry, topic: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-bold" placeholder="Ex: Introdução à Trigonometria" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">Códigos BNCC / Habilidades</label>
                          <input type="text" value={diaryEntry.bnccCodes} onChange={e => setDiaryEntry({...diaryEntry, bnccCodes: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-blue-100 rounded-xl text-sm italic" placeholder="Ex: EF09MA13..." />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">Conteúdo Ministrado (Detalhamento)</label>
                          <textarea rows={3} value={diaryEntry.content} onChange={e => setDiaryEntry({...diaryEntry, content: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm" placeholder="Descreva o que foi trabalhado em sala..." />
                      </div>
                  </div>
              </div>

              {/* LISTA DE CHAMADA */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-3 font-bold text-slate-600">Alunos</th>
                      <th className="px-6 py-3 font-bold text-slate-600">Status</th>
                      <th className="px-6 py-3 font-bold text-slate-600">Justificativa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(std => {
                       const item = attendanceData[std.id] || { status: 'Presente' };
                       return (
                        <tr key={std.id} className="border-b border-slate-200 dark:border-slate-800/40 hover:bg-slate-50/50">
                          <td className="px-6 py-3 font-medium">{std.name}</td>
                          <td className="px-6 py-3">
                            <select value={item.status} onChange={e => setAttendanceData({...attendanceData, [std.id]: { ...item, status: e.target.value }})} className={`px-2 py-1 border rounded text-xs font-bold ${item.status==='Ausente' ? 'bg-red-50 text-red-600':'bg-emerald-50 text-emerald-600'}`}>
                              <option value="Presente">Presente</option>
                              <option value="Ausente">Ausente</option>
                              <option value="Justificado">Justificado</option>
                            </select>
                          </td>
                          <td className="px-6 py-3">
                             <input type="text" placeholder="Caso houver..." value={item.justification || ''} onChange={e => setAttendanceData({...attendanceData, [std.id]: { ...item, justification: e.target.value }})} className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800 text-xs" />
                          </td>
                        </tr>
                       );
                    })}
                  </tbody>
                </table>
              </div>
              <button disabled={loading} onClick={handleSaveAttendance} className="float-right flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold shadow-lg">
                <CalendarCheck size={16} /> Salvar Frequência e Diário
              </button>
            </motion.div>
          )}

          {/* 4. PLANEJAMENTOS */}
          {activeTab === 'planning' && selectedClass && (
              <motion.div key="planning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex justify-between items-center">
                     <h3 className="font-bold text-lg text-slate-900 dark:text-white">Planejamento Pedagógico - {selectedSubject}</h3>
                     <button onClick={() => { setEditingPlanningId(null); setIsPlanningModalOpen(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"><Plus size={14} /> Novo Planejamento</button>
                  </div>
                  <div className="space-y-4">
                      {plannings.length > 0 ? (
                          plannings.map(plan => (
                              <div key={plan.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                                  <div className="flex justify-between items-start">
                                      <div className="space-y-1 flex-1">
                                           <h4 className="font-bold text-slate-900 dark:text-white flex items-center flex-wrap gap-2">
                                                {plan.title}
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                                                     plan.status === 'Aprovado' ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border border-emerald-100' :
                                                     plan.status === 'Devolvido' ? 'bg-red-50 dark:bg-red-900/10 text-red-600 border border-red-100' :
                                                     'bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200'
                                                }`}>
                                                     {plan.status || 'Pendente'}
                                                </span>
                                           </h4>
                                           <span className="text-xs text-slate-400 font-medium">{new Date(plan.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                      </div>
                                      <div className="flex gap-1.5 items-center">
                                           <button onClick={() => handleClonePlanning(plan)} className="flex items-center gap-1 px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800" title="Copiar plano para outra data">
                                                <Plus size={12} /> Clonar
                                           </button>
                                           {(plan.status === 'Devolvido' || !plan.status || plan.status === 'Pendente') && (
                                                <button onClick={() => handleEditPlanning(plan)} className="flex items-center gap-1 px-2 py-1 border border-blue-100 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Corrigir ou Editar">
                                                     <Edit size={12} /> Editar
                                                </button>
                                           )}
                                           {plan.status === 'Aprovado' && (
                                                <button onClick={() => handleExecutePlanning(plan)} className="flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-md" title="Migrar este plano para o Diário de Classe do dia">
                                                     <CalendarCheck size={12} /> Executar
                                                </button>
                                           )}
                                      </div>
                                  </div>
                                  
                                  {(() => {
                                        try {
                                            const parsed = JSON.parse(plan.content);
                                            return (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 text-sm">
                                                    {parsed.bncc && (
                                                        <div className="sm:col-span-2 border-b border-slate-200 dark:border-slate-700 pb-2 mb-1">
                                                            <p className="font-bold text-[9px] text-blue-600 uppercase tracking-widest mb-1">🏛️ BNCC / Habilidades</p>
                                                            <p className="text-slate-800 dark:text-slate-200 text-xs font-bold">{parsed.bncc}</p>
                                                        </div>
                                                    )}
                                                    {parsed.objetivos && <div><p className="font-bold text-[9px] text-slate-400 uppercase tracking-widest mb-1">🎯 OBJETIVOS</p><p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{parsed.objetivos}</p></div>}
                                                    {parsed.metodologia && <div><p className="font-bold text-[9px] text-slate-400 uppercase tracking-widest mb-1">🛠️ METODOLOGIA</p><p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{parsed.metodologia}</p></div>}
                                                    {parsed.recursos && <div><p className="font-bold text-[9px] text-slate-400 uppercase tracking-widest mb-1">📚 RECURSOS</p><p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{parsed.recursos}</p></div>}
                                                    {parsed.avaliacao && <div><p className="font-bold text-[9px] text-slate-400 uppercase tracking-widest mb-1">✍️ AVALIAÇÃO</p><p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{parsed.avaliacao}</p></div>}
                                                    {parsed.links && (
                                                        <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                                            <p className="font-bold text-[9px] text-slate-400 uppercase tracking-widest mb-1">🔗 LINKS E APOIO</p>
                                                            <a href={parsed.links.startsWith('http') ? parsed.links : `https://${parsed.links}`} target="_blank" rel="noreferrer" className="text-blue-600 text-[10px] underline truncate flex items-center gap-1 transition-all hover:text-blue-700">
                                                                <ExternalLink size={10} /> {parsed.links}
                                                            </a>
                                                        </div>
                                                    )}
                                                    {parsed.content && <div className="sm:col-span-2 border-t border-slate-200 dark:border-slate-700 pt-2"><p className="font-bold text-[9px] text-slate-400 uppercase tracking-widest mb-1">📝 OUTROS / OBSERVACÕES</p><p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{parsed.content}</p></div>}
                                                </div>
                                            );
                                        } catch {
                                            return <p className="text-sm text-slate-500 mt-2 whitespace-pre-wrap">{plan.content}</p>;
                                        }
                                   })()}
                                   
                                   {plan.status === 'Devolvido' && plan.feedback && (
                                        <div className="mt-3 p-3 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-400 space-y-1">
                                             <div className="font-bold flex items-center gap-1"><RotateCcw size={12}/> Feedback da Coordenação:</div>
                                             <div className="italic">"{plan.feedback}"</div>
                                        </div>
                                   )}
                              </div>
                          ))
                      ) : (
                          <div className="p-8 text-center text-slate-400 text-sm border border-dashed rounded-xl">
                              Nenhum planejamento encontrado para esta matéria. Cadastre um novo!
                          </div>
                      )}
                  </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Modal PLANNING */}
        {isPlanningModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                 <div onClick={() => setIsPlanningModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                 <form onSubmit={handleSavePlanning} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl p-6 rounded-3xl shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800">
                     <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Lançar Planejamento Pedagógico</h3>
                        <button type="button" onClick={() => setIsPlanningModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
                     </div>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Data da Aula</label>
                             <input type="date" required value={planningForm.date} onChange={e => setPlanningForm({...planningForm, date: e.target.value})} className="w-full mt-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:ring-2 focus:ring-blue-600" />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Título do Tema</label>
                             <input type="text" required value={planningForm.title} onChange={e => setPlanningForm({...planningForm, title: e.target.value})} className="w-full mt-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:ring-2 focus:ring-blue-600" placeholder="Ex: Adição de Frações" />
                         </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="sm:col-span-2">
                             <label className="text-xs font-bold text-blue-600 uppercase tracking-widest">🏛️ BNCC / Habilidades Vinculadas</label>
                             <input type="text" value={planningForm.bncc} onChange={e => setPlanningForm({...planningForm, bncc: e.target.value})} className="w-full mt-1.5 px-4 py-2 bg-blue-50/20 border border-blue-100 rounded-xl text-sm italic font-bold placeholder:italic placeholder:font-normal" placeholder="Ex: EF01MA01, EF02LP05..." />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">🎯 Objetivos de Aprendizagem</label>
                             <textarea rows={2} value={planningForm.objetivos} onChange={e => setPlanningForm({...planningForm, objetivos: e.target.value})} className="w-full mt-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:ring-2 focus:ring-blue-600" placeholder="O que os alunos devem aprender..." />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">🛠️ Metodologia e Estratégias</label>
                             <textarea rows={2} value={planningForm.metodologia} onChange={e => setPlanningForm({...planningForm, metodologia: e.target.value})} className="w-full mt-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:ring-2 focus:ring-blue-600" placeholder="Como a aula será ministrada..." />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">📚 Recursos Didáticos</label>
                             <textarea rows={2} value={planningForm.recursos} onChange={e => setPlanningForm({...planningForm, recursos: e.target.value})} className="w-full mt-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:ring-2 focus:ring-blue-600" placeholder="Ex: Quadro, Projetor, Livro..." />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">✍️ Avaliação de Resultados</label>
                             <textarea rows={2} value={planningForm.avaliacao} onChange={e => setPlanningForm({...planningForm, avaliacao: e.target.value})} className="w-full mt-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:ring-2 focus:ring-blue-600" placeholder="Como medirá o aprendizado..." />
                         </div>
                         <div className="sm:col-span-1">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">🔗 Links de Apoio / Materiais</label>
                             <input type="text" value={planningForm.links} onChange={e => setPlanningForm({...planningForm, links: e.target.value})} className="w-full mt-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:ring-2 focus:ring-blue-600" placeholder="URL do YouTube ou GDrive..." />
                         </div>
                         <div className="sm:col-span-1">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">📝 Outros / Notas Extras</label>
                             <textarea rows={1} value={planningForm.content} onChange={e => setPlanningForm({...planningForm, content: e.target.value})} className="w-full mt-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:ring-2 focus:ring-blue-600" placeholder="Complementos..." />
                         </div>
                     </div>
                     <div className="flex justify-end gap-3 pt-3">
                         <button type="button" onClick={() => setIsPlanningModalOpen(false)} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition-all">Cancelar</button>
                         <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"><Save size={18}/> {editingPlanningId ? 'Atualizar Plano' : 'Salvar Planejamento'}</button>
                     </div>
                 </form>
             </div>
        )}
      </div>
    </>
  );
}
