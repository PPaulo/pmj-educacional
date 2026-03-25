import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  CheckSquare, 
  Search, 
  Filter, 
  CheckCircle,
  AlertCircle,
  Check,
  X,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { snakeToCamel } from '../lib/utils';
import toast from 'react-hot-toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const tabs = [
  { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'plannings', label: 'Planejamentos', icon: BookOpen },
  { id: 'grades', label: 'Notas / Boletins', icon: ClipboardList },
];

export function CoordinationPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [classes, setClasses] = useState<any[]>([]);
  const [plannings, setPlannings] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  
  const [classesMap, setClassesMap] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('Todos');

  // Planning Approvals
  const [currentFeedbackId, setCurrentFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Admin and State controllers
  const [userRole, setUserRole] = useState('Secretaria');
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState('Todas');
  const [schoolsList, setSchoolsList] = useState<any[]>([]);

  // Configurações mestre
  useEffect(() => {
    const loadConfigs = async () => {
      // 1. Check for impersonation from localStorage
      const impersonated = localStorage.getItem('impersonated_user');
      if (impersonated) {
          const data = JSON.parse(impersonated);
          setUserRole(data.role || 'Admin');
          setUserSchoolId(data.school_id || null);
          return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role, school_id').eq('id', user.id).single();
        if (profile) {
          setUserRole(profile.role);
          setUserSchoolId(profile.school_id);
          if (profile.role === 'Admin') {
             const { data: schoolsData } = await supabase.from('school_info').select('id, name');
             setSchoolsList(schoolsData || []);
          }
        }
      }
    };
    loadConfigs();
  }, []);

  useEffect(() => {
    loadAllData();
  }, [schoolFilter, userRole, userSchoolId]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Builders
      let classesQuery = supabase.from('classes').select('*').order('name');
      let planningsQuery = supabase.from('plannings').select('*').order('date', { ascending: false });
      let gradesQuery = supabase.from('grades').select('*');
      let attendQuery = supabase.from('attendance').select('*').limit(1000);

      if (userRole !== 'Admin' && userSchoolId) {
           classesQuery = classesQuery.eq('school_id', userSchoolId);
           planningsQuery = planningsQuery.eq('school_id', userSchoolId);
           gradesQuery = gradesQuery.eq('school_id', userSchoolId);
           attendQuery = attendQuery.eq('school_id', userSchoolId);
      } else if (userRole === 'Admin' && schoolFilter !== 'Todas') {
           classesQuery = classesQuery.eq('school_id', schoolFilter);
           planningsQuery = planningsQuery.eq('school_id', schoolFilter);
           gradesQuery = gradesQuery.eq('school_id', schoolFilter);
           attendQuery = attendQuery.eq('school_id', schoolFilter);
      }

      const [{ data: classesData }, { data: planningsData }, { data: gradesData }, { data: attendData }] = await Promise.all([
           classesQuery, planningsQuery, gradesQuery, attendQuery
      ]);

      const camelClasses = snakeToCamel(classesData || []);
      setClasses(camelClasses);

      const map: any = {};
      camelClasses.forEach((c: any) => { map[c.id] = c.name; });
      setClassesMap(map);

      setPlannings(planningsData || []);
      setGrades(gradesData || []);
      setAttendance(attendData || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePlanning = async (id: string) => {
       try {
           const { error } = await supabase.from('plannings').update({ status: 'Aprovado', feedback: null }).eq('id', id);
           if (error) throw error;
           toast.success('Planejamento aprovado!');
           loadAllData();
       } catch (err: any) {
           toast.error(err.message);
       }
  };

  const handleOpenFeedbackModal = (id: string) => {
       setCurrentFeedbackId(id);
       setFeedbackText('');
       setIsFeedbackModalOpen(true);
  };

  const handleReturnPlanning = async (e: React.FormEvent) => {
       e.preventDefault();
       if (!currentFeedbackId) return;
       try {
           const { error } = await supabase.from('plannings').update({ status: 'Devolvido', feedback: feedbackText }).eq('id', currentFeedbackId);
           if (error) throw error;
           toast.success('Planejamento devolvido!');
           setIsFeedbackModalOpen(false);
           setCurrentFeedbackId(null);
           loadAllData();
       } catch (err: any) {
           toast.error(err.message);
       }
  };

  // Metrics for Dashboard Tab
  const recentPlannings = plannings.slice(0, 5);
  const totalPlannings = plannings.length;
  const totalAbsences = attendance.filter(a => a.status === 'Ausente').length;
  const lowGrades = grades.filter(g => g.grade !== null && g.grade < 6.0).length;

  // Chart Data: Plannings by Class (Top 5)
  const planningChartData = classes.map(c => ({
    name: c.name,
    count: plannings.filter(p => p.class_id === c.id).length
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  const filteredPlannings = plannings.filter(p => {
    const className = classesMap[p.class_id] || '';
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === 'Todos' || p.class_id === classFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <>
      <Header title="Coordenação Pedagógica" />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Supervisão Curricular</h1>
            <p className="text-slate-500 text-sm">Acompanhamento de planos de aula, diários de classe e rendimento.</p>
          </div>
          {userRole === 'Admin' && (
             <div className="relative">
                <select 
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors dark:text-white cursor-pointer focus:ring-2 focus:ring-blue-600 outline-none max-w-[220px] truncate"
                >
                  <option value="Todas">Todas as Escolas</option>
                  {schoolsList.map(s => (
                     <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
             </div>
          )}
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

        <AnimatePresence mode="wait">
          {loading ? (
             <div className="p-8 text-center text-slate-400">Carregando painel da coordenação...</div>
          ) : (
            <>
              {/* 1. ABA DASHBOARD */}
              {activeTab === 'dashboard' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                         <div className="p-2 w-fit rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 mb-2"><BookOpen size={20} /></div>
                         <p className="text-xs font-bold text-slate-500">Planejamentos Lançados</p>
                         <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalPlannings}</h3>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                         <div className="p-2 w-fit rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 mb-2"><CheckSquare size={20} /></div>
                         <p className="text-xs font-bold text-slate-500">Total de Faltas Diárias</p>
                         <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalAbsences}</h3>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                         <div className="p-2 w-fit rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 mb-2"><AlertCircle size={20} /></div>
                         <p className="text-xs font-bold text-slate-500">Notas em Alerta (&lt; 6.0)</p>
                         <h3 className="text-2xl font-black text-slate-900 dark:text-white text-red-600">{lowGrades}</h3>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                         <h3 className="font-bold text-slate-900 dark:text-white mb-4">Planejamentos por Turma</h3>
                         <div className="h-64">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={planningChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                </BarChart>
                             </ResponsiveContainer>
                         </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                         <h3 className="font-bold text-slate-900 dark:text-white mb-4">Feeds de Atualizações</h3>
                         <div className="space-y-4">
                             {recentPlannings.map((p: any) => (
                                 <div key={p.id} className="p-3 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                     <div className="flex justify-between items-center">
                                         <span className="text-[10px] font-bold text-blue-600">{p.subject}</span>
                                         <span className="text-[10px] text-slate-400">{new Date(p.date).toLocaleDateString('pt-BR')}</span>
                                     </div>
                                     <p className="text-xs font-medium text-slate-700 dark:text-white mt-1">{p.title}</p>
                                     <p className="text-[10px] text-slate-400 mt-1">Turma: {classesMap[p.class_id] || '---'}</p>
                                 </div>
                             ))}
                         </div>
                      </div>
                  </div>
                </motion.div>
              )}

              {/* 2. ABA PLANEJAMENTOS */}
              {activeTab === 'plannings' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="flex gap-4 mb-4">
                        <div className="relative flex-1">
                             <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                             <input type="text" placeholder="Pesquisar por conteúdo..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                        </div>
                        <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="border rounded-lg px-2 py-1 text-sm">
                            <option value="Todos">Todas as Turmas</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-3">
                        {filteredPlannings.length > 0 ? (
                            filteredPlannings.map((p: any) => (
                                <div key={p.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-1">
                                         <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30">{p.subject}</span>
                                            <span className="text-xs font-medium text-slate-400">Turma: {classesMap[p.class_id] || '---'}</span>
                                         </div>
                                         <h3 className="font-bold text-slate-900 dark:text-white text-lg">{p.title}</h3>
                                         {(() => {
                                              try {
                                                  const parsed = JSON.parse(p.content);
                                                  return (
                                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 text-sm mt-3">
                                                          {parsed.objetivos && <div><p className="font-bold text-[10px] text-slate-400">🎯 OBJETIVOS</p><p className="text-slate-600 dark:text-slate-300 text-xs">{parsed.objetivos}</p></div>}
                                                          {parsed.metodologia && <div><p className="font-bold text-[10px] text-slate-400">🛠️ METODOLOGIA</p><p className="text-slate-600 dark:text-slate-300 text-xs">{parsed.metodologia}</p></div>}
                                                          {parsed.recursos && <div><p className="font-bold text-[10px] text-slate-400">📚 RECURSOS</p><p className="text-slate-600 dark:text-slate-300 text-xs">{parsed.recursos}</p></div>}
                                                          {parsed.avaliacao && <div><p className="font-bold text-[10px] text-slate-400">✍️ AVALIAÇÃO</p><p className="text-slate-600 dark:text-slate-300 text-xs">{parsed.avaliacao}</p></div>}
                                                          {parsed.content && <div className="sm:col-span-2 border-t pt-2 mt-1"><p className="font-bold text-[10px] text-slate-400">📝 OUTROS</p><p className="text-slate-600 dark:text-slate-300 text-xs">{parsed.content}</p></div>}
                                                      </div>
                                                  );
                                              } catch {
                                                  return <p className="text-sm text-slate-500 whitespace-pre-wrap mt-2">{p.content}</p>;
                                              }
                                         })()}
                                    </div>
                                    <div className="flex flex-col md:items-end justify-between gap-2">
                                         <div className="text-right text-xs text-slate-400">
                                              {new Date(p.date).toLocaleDateString('pt-BR')}
                                         </div>
                                         <div className="flex flex-col items-end gap-1.5 mt-auto">
                                              <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                                                   p.status === 'Aprovado' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' :
                                                   p.status === 'Devolvido' ? 'bg-red-50 dark:bg-red-900/30 text-red-600' : 
                                                   'bg-slate-50 dark:bg-slate-800 text-slate-500'
                                              }`}>{p.status || 'Pendente'}</span>
                                              
                                              {(!p.status || p.status === 'Pendente') && (
                                                   <div className="flex gap-1.5 mt-2">
                                                        <button onClick={() => handleApprovePlanning(p.id)} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"><Check size={12} /> Aprovar</button>
                                                        <button onClick={() => handleOpenFeedbackModal(p.id)} className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"><X size={12} /> Devolver</button>
                                                   </div>
                                              )}
                                         </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl">Nenhum planejamento encontrado.</div>
                        )}
                    </div>
                </motion.div>
              )}

              {/* 3. ABA NOTAS E BOLETINS */}
              {activeTab === 'grades' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Visão Geral de Avaliações</h3>
                        <p className="text-sm text-slate-500 mb-6">Acompanhe se as notas e médias estão sendo devidamente lançadas pelos professores.</p>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                     <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-6 py-3 font-bold text-slate-600">Turma</th>
                                        <th className="px-6 py-3 font-bold text-slate-600">Total Lançamentos (Notas)</th>
                                        <th className="px-6 py-3 font-bold text-slate-600">Média Notas</th>
                                        <th className="px-6 py-3 font-bold text-slate-600">Status Lançamentos</th>
                                     </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                     {classes.map(c => {
                                         const classGrades = grades.filter(g => g.class_id === c.id);
                                         const avg = classGrades.length > 0 
                                            ? (classGrades.reduce((acc, curr) => acc + (curr.grade || 0), 0) / classGrades.length).toFixed(1)
                                            : '---';

                                         return (
                                             <tr key={c.id} className="hover:bg-slate-50/50">
                                                 <td className="px-6 py-3 font-medium text-slate-800 dark:text-white">{c.name}</td>
                                                 <td className="px-6 py-3">{classGrades.length} notas</td>
                                                 <td className={`px-6 py-3 font-bold ${avg !== '---' && parseFloat(avg) < 6 ? 'text-red-500' : 'text-emerald-500'}`}>{avg}</td>
                                                 <td className="px-6 py-3">
                                                    {classGrades.length > 0 ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold"><CheckCircle size={14}/> Em dia</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-bold"><AlertCircle size={14}/> Sem lançamentos</span>
                                                    )}
                                                 </td>
                                             </tr>
                                         )
                                     })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
              )}

            </>
          )}
        </AnimatePresence>

        {isFeedbackModalOpen && (
             <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-900 w-full max-w-sm p-6 rounded-2xl shadow-xl space-y-4 border border-slate-200 dark:border-slate-800">
                       <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2"><RotateCcw size={18} className="text-red-600" /> Devolver Planejamento</h3>
                       <p className="text-xs text-slate-500">Deixe um feedback para o docente ajustando o que for necessário para aprovação.</p>
                       
                       <form onSubmit={handleReturnPlanning} className="space-y-3">
                            <textarea required value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows={4} className="w-full text-sm p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Ex: Favor adicionar os objetivos do bimestre..." />
                            <div className="flex justify-end gap-2">
                                 <button type="button" onClick={() => setIsFeedbackModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold">Cancelar</button>
                                 <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm">Confirmar Devolução</button>
                            </div>
                       </form>
                  </div>
             </div>
        )}
      </div>
    </>
  );
}
