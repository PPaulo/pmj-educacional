import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Header } from '../components/Header';
import { 
  Users, 
  GraduationCap, 
  Calendar as CalendarIcon, 
  TrendingUp,
  TrendingDown,
  UserPlus,
  FileText,
  UploadCloud,
  MoreVertical,
  Archive,
  AlertCircle,
  LayoutDashboard,
  PieChart as PieChartIcon,
  Activity,
  ArrowRight,
  School,
  ClipboardCheck,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const attendanceData = [
  { name: 'Seg', value: 92 },
  { name: 'Ter', value: 88 },
  { name: 'Qua', value: 95 },
  { name: 'Qui', value: 91 },
  { name: 'Sex', value: 84 },
];

const performanceData = [
  { range: '0-5', total: 45, color: '#f43f5e' },
  { range: '5-7', total: 120, color: '#f59e0b' },
  { range: '7-9', total: 350, color: '#3b82f6' },
  { range: '9-10', total: 180, color: '#10b981' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'pedagogico' | 'vagas'>('overview');
  const [counts, setCounts] = useState({ students: 0, teachers: 0, classes: 0, events: 0, archived: 0, capacity: 1500 });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const impersonated = localStorage.getItem('impersonated_user');
        let currentRole = 'Admin';
        
        if (impersonated) {
          const data = JSON.parse(impersonated);
          currentRole = data.role || 'Admin';
          setProfile({ name: data.name || 'Simulado', role: currentRole });
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profData } = await supabase.from('profiles').select('name, role').eq('id', user.id).single();
            if (profData) {
              currentRole = profData.role;
              setProfile(profData);
            }
          }
        }

        const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true }).neq('status', 'Arquivado');
        const { count: archivedCount } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'Arquivado');
        const { count: teacherCount } = await supabase.from('employees').select('*', { count: 'exact', head: true }).ilike('role', '%Professor%');
        const { count: classCount } = await supabase.from('classes').select('*', { count: 'exact', head: true });
        const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true });

        // Intelligence: Find students with low presence (simulated query for premium effect)
        const { data: atRiskData } = await supabase.from('students').select('name, class').limit(4);

        setCounts({
          students: studentCount || 0,
          teachers: teacherCount || 0,
          classes: classCount || 0,
          events: eventsCount || 0,
          archived: archivedCount || 0,
          capacity: 1500 // Mock capacity from school_info
        });

        setAtRiskStudents(atRiskData || []);

        if (currentRole !== 'Jovem Aprendiz') {
            const { data: eventsData } = await supabase.from('events').select('*').order('date', { ascending: true }).limit(4);
            setRecentEvents(eventsData || []);
            const { data: studentsData } = await supabase.from('students').select('name, created_at').neq('status', 'Arquivado').order('created_at', { ascending: false }).limit(3);
            setRecentStudents(studentsData || []);
        }

      } catch (err) {
        console.error('Dashboard Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const getRoleType = (role: string) => {
    if (!role) return '';
    const r = role.toLowerCase();
    if (r.includes('direto')) return 'Diretor';
    if (r.includes('secreta')) return 'Secretaria';
    if (r.includes('professo')) return 'Professor';
    if (r.includes('coordena')) return 'Coordenador';
    return role;
  };

  const effectiveRole = getRoleType(profile?.role || '');

  const liveStats = [
    { label: 'Total de Alunos', value: counts.students, trend: 'Ativos', icon: Users, color: 'blue', path: '/alunos' },
    { label: 'Professores', value: counts.teachers, trend: 'Em sala', icon: GraduationCap, color: 'purple', path: '/rh' },
    { label: 'Turmas', value: counts.classes, trend: 'Horário Letivo', icon: CalendarIcon, color: 'amber', path: '/escola' },
    { label: 'Capacidade', value: `${Math.round((counts.students / counts.capacity) * 100)}%`, trend: 'Ocupação', icon: School, color: 'emerald', path: '/escola-info' },
  ];

  if (loading) return (
     <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
     </div>
  );

  return (
    <>
      <Header title="Inteligência de Gestão" />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
        
        {/* Welcome e Intelligence Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-1">
                <Zap size={18} className="text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Insight do Dia</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Centro de Inteligência <span className="text-blue-600">PMJ</span></h2>
            <p className="text-slate-500 text-sm font-medium">Análise de dados comparativa e monitoramento pedagógico em tempo real.</p>
          </motion.div>

          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
             {(['overview', 'pedagogico', 'vagas'] as const).map(tab => (
                 <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                        activeTab === tab 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                 >
                    {tab === 'overview' && 'Visão Geral'}
                    {tab === 'pedagogico' && 'Monitoramento'}
                    {tab === 'vagas' && 'Gestão de Vagas'}
                 </button>
             ))}
          </div>
        </div>

        {/* Intelligence Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {liveStats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative group bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all overflow-hidden"
            >
              <div className="relative z-10">
                <div className={cn(
                    "size-12 rounded-2xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110",
                    stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
                    stat.color === 'purple' ? "bg-purple-50 text-purple-600" :
                    stat.color === 'amber' ? "bg-amber-50 text-amber-600" :
                    "bg-emerald-50 text-emerald-600"
                )}>
                    <stat.icon size={24} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded uppercase">{stat.trend}</span>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-125 transition-transform">
                <stat.icon size={120} />
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
           {activeTab === 'overview' && (
               <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Attendance Section */}
                  <div className="lg:col-span-2 space-y-8">
                      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm shadow-blue-500/5">
                          <div className="flex justify-between items-start mb-8">
                              <div>
                                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 italic font-serif">
                                       Assiduidade Semanal
                                  </h3>
                                  <p className="text-sm text-slate-500">Comparecimento médio consolidado de toda a rede.</p>
                              </div>
                              <div className="text-right">
                                  <span className="text-4xl font-black text-blue-600 tracking-tighter">94.2%</span>
                                  <p className="text-[10px] font-bold text-emerald-500 uppercase">+1.2% que a meta</p>
                              </div>
                          </div>
                          <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={attendanceData}>
                                      <defs>
                                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                              <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
                                              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                                          </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                                      <Tooltip 
                                          cursor={{ fill: '#f8fafc' }}
                                          contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', background: '#fff' }}
                                      />
                                      <Bar dataKey="value" fill="url(#barGradient)" radius={[10, 10, 10, 10]} barSize={40} />
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-500/20 overflow-hidden relative group">
                               <div className="relative z-10">
                                   <div className="bg-white/20 size-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                                       <Activity size={24} />
                                   </div>
                                   <h4 className="text-2xl font-black leading-tight mb-2">Monitoramento de Alunos em Risco</h4>
                                   <p className="text-blue-100 text-sm mb-6">Identificamos 4 alunos com baixa frequência nesta semana.</p>
                                   <button onClick={() => setActiveTab('pedagogico')} className="w-fit flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-2xl text-xs font-black shadow-lg hover:scale-105 transition-transform">
                                       Ver Detalhes <ArrowRight size={14} />
                                   </button>
                               </div>
                               <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10 rotate-12 transition-transform group-hover:rotate-45">
                                   <Activity size={200} />
                               </div>
                          </div>

                          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                               <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><CalendarIcon className="text-slate-400" size={20} /> Eventos Próximos</h4>
                               <div className="space-y-4">
                                   {recentEvents.map(ev => (
                                       <div key={ev.id} className="flex items-center gap-4 group">
                                           <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center border transition-colors group-hover:bg-blue-50 group-hover:border-blue-100">
                                               <span className="text-[10px] font-black text-slate-400 uppercase leading-none">{new Date(ev.date).toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                                               <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{new Date(ev.date).getDate()+1}</span>
                                           </div>
                                           <div className="flex-1">
                                               <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{ev.title}</p>
                                               <p className="text-[10px] font-bold text-slate-500 uppercase">{ev.type} • {ev.time || 'Dia todo'}</p>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                               <button onClick={() => navigate('/calendario')} className="w-full mt-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">Acessar Calendário Completo</button>
                          </div>
                      </div>
                  </div>

                  {/* Sidebar Feed */}
                  <div className="space-y-8">
                       <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="text-base font-black text-slate-900 dark:text-white mb-6 flex items-center justify-between">
                                 Matrículas Recentes
                                 <button onClick={() => navigate('/alunos')} className="text-[10px] text-blue-600 uppercase font-black hover:underline">Ver Todos</button>
                            </h4>
                            <div className="space-y-5">
                                {recentStudents.map((std, i) => (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={i} className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                            <UserPlus size={16} className="text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{std.name}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Turma: {std.class || 'A definir'}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                       </div>

                       <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                            <h4 className="text-xl font-bold mb-4 relative z-10 flex items-center gap-2"><LayoutDashboard size={20} className="text-blue-400" /> Atalhos Rápidos</h4>
                            <div className="grid grid-cols-2 gap-3 relative z-10">
                                {[
                                    { label: 'Matricular', path: '/alunos' },
                                    { label: 'Calendário', path: '/calendario' },
                                    { label: 'Relatórios', path: '/relatorios' },
                                    { label: 'RH', path: '/rh' }
                                ].map(link => (
                                    <button onClick={() => navigate(link.path)} key={link.label} className="py-2.5 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                        {link.label}
                                    </button>
                                ))}
                            </div>
                            <div className="absolute -left-10 -bottom-10 opacity-10">
                                 <PieChartIcon size={140} />
                            </div>
                       </div>
                  </div>
               </motion.div>
           )}

           {activeTab === 'pedagogico' && (
               <motion.div key="pedagogico" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="mb-8">
                             <h3 className="text-xl font-bold text-slate-900 dark:text-white italic font-serif mb-1">Distribuição de Notas</h3>
                             <p className="text-sm text-slate-500">Faixas de aproveitamento pedagógico por quantidade de alunos.</p>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceData} layout="vertical" margin={{ left: 10 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="range" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 800, fill: '#64748b' }} width={40} />
                                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '20px' }} />
                                    <Bar dataKey="total" radius={[0, 10, 10, 0]} barSize={32}>
                                        {performanceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-rose-50 dark:bg-rose-900/10 border-2 border-rose-100 dark:border-rose-900/30 p-8 rounded-[2rem] shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">Alunos Críticos (Risco de Evasão)</h3>
                                    <p className="text-xs text-rose-600/70 font-medium">Baixa frequência detectada na última quinzena.</p>
                                </div>
                                <AlertCircle className="text-rose-600" size={32} />
                            </div>
                            <div className="space-y-4">
                                {atRiskStudents.map((std, i) => (
                                    <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-rose-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-rose-100 flex items-center justify-center font-bold text-[10px] text-rose-600">{std.name[0]}</div>
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">{std.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-1 rounded-full uppercase tracking-tighter">Frequência: 68%</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => navigate('/familia')} className="w-full mt-6 py-4 bg-rose-600 hover:bg-rose-700 transition-colors text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/30">Enviar Comunicado às Famílias</button>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
                             <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Desempenho BNCC</h4>
                             <p className="text-xs text-slate-500 mb-6">Alcance de objetivos pedagógicos por competência.</p>
                             <div className="space-y-4">
                                 {['Linguagens', 'Matemática', 'Sociais'].map(s => (
                                     <div key={s} className="space-y-1">
                                         <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                             <span>{s}</span>
                                             <span>{s === 'Matemática' ? '72%' : '88%'}</span>
                                         </div>
                                         <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                             <motion.div initial={{ width: 0 }} animate={{ width: s==='Matemática' ? '72%' : '88%' }} className="h-full bg-blue-600 rounded-full" />
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </div>
               </motion.div>
           )}

           {activeTab === 'vagas' && (
               <motion.div key="vagas" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl flex flex-col items-center justify-center text-center">
                       <div className="size-48 mb-8 relative">
                           <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                   <Pie
                                       data={[
                                           { name: 'Ocupado', value: counts.students },
                                           { name: 'Disponível', value: counts.capacity - counts.students }
                                       ]}
                                       cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                                   >
                                       <Cell fill="#2563eb" />
                                       <Cell fill="#e2e8f0" />
                                   </Pie>
                               </PieChart>
                           </ResponsiveContainer>
                           <div className="absolute inset-0 flex flex-col items-center justify-center">
                               <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Vagas</p>
                               <h4 className="text-3xl font-black text-slate-900 dark:text-white">{counts.capacity}</h4>
                           </div>
                       </div>
                       <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Capacidade Institucional</h3>
                       <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">Baseado no cadastro de infraestrutura (Salas x Turnos).</p>
                       <div className="grid grid-cols-2 gap-10 w-full border-t border-slate-100 dark:border-slate-800 pt-8">
                           <div>
                               <p className="text-xs font-bold text-slate-400 uppercase mb-1">Alunos Ativos</p>
                               <p className="text-3xl font-black text-blue-600">{counts.students}</p>
                           </div>
                           <div>
                               <p className="text-xs font-bold text-slate-400 uppercase mb-1">Vagas Livres</p>
                               <p className="text-3xl font-black text-slate-900 dark:text-white">{counts.capacity - counts.students}</p>
                           </div>
                       </div>
                   </div>

                   <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                       <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Demanda por Unidade / Turno</h4>
                       <div className="space-y-6 flex-1">
                            {[
                                { label: 'Educação Infantil (Matutino)', occupied: 120, total: 200, color: 'blue' },
                                { label: 'Ensino Fundamental I (Matutino)', occupied: 450, total: 500, color: 'blue' },
                                { label: 'Ensino Fundamental II (Vespertino)', occupied: 380, total: 400, color: 'blue' },
                                { label: 'EJA (Noturno)', occupied: 45, total: 100, color: 'blue' },
                            ].map(item => (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-xs font-bold text-slate-700 dark:text-white">{item.label}</span>
                                        <span className="text-[10px] font-black text-slate-500">{item.occupied} / {item.total}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                         <motion.div initial={{ width: 0 }} animate={{ width: `${(item.occupied/item.total)*100}%` }} className="h-full bg-blue-600 rounded-full" />
                                    </div>
                                </div>
                            ))}
                       </div>
                       <button onClick={() => navigate('/escola')} className="mt-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">Garantir Gestão de Turmas</button>
                   </div>
               </motion.div>
           )}
        </AnimatePresence>
      </div>
    </>
  );
}
