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
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { cn, notifyWIP } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const data = [
  { name: 'Seg', value: 90 },
  { name: 'Ter', value: 85 },
  { name: 'Qua', value: 95 },
  { name: 'Qui', value: 80 },
  { name: 'Sex', value: 70 },
  { name: 'Sab', value: 20 },
  { name: 'Dom', value: 15 },
];

const stats = [
  { label: 'Total de Alunos', value: '1,250', trend: '+2.5%', trendType: 'up', icon: Users, color: 'blue' },
  { label: 'Professores Ativos', value: '84', trend: '-1.2%', trendType: 'down', icon: GraduationCap, color: 'purple' },
  { label: 'Turmas do Dia', value: '12', trend: '0%', trendType: 'neutral', icon: CalendarIcon, color: 'amber' },
  { label: 'Avisos Pendentes', value: '5', trend: '+3%', trendType: 'up', icon: AlertCircle, color: 'red' },
];

// Removed mock static data for events and activities

export function DashboardPage() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ students: 0, teachers: 0, classes: 0, events: 0, archived: 0 });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { count: studentCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .neq('status', 'Arquivado');

        const { count: archivedCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Arquivado');

        const { count: teacherCount } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .ilike('role', '%Professor%');

        const { count: classCount } = await supabase
          .from('classes')
          .select('*', { count: 'exact', head: true });

        const { count: eventsCount } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true });

        setCounts({
          students: studentCount || 0,
          teachers: teacherCount || 0,
          classes: classCount || 0,
          events: eventsCount || 0,
          archived: archivedCount || 0
        });

        // Carregar feeds
        const { data: eventsData } = await supabase.from('events').select('*').order('date', { ascending: true }).limit(4);
        setRecentEvents(eventsData || []);

        const { data: studentsData } = await supabase.from('students').select('name, created_at').neq('status', 'Arquivado').order('created_at', { ascending: false }).limit(3);
        setRecentStudents(studentsData || []);

      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      }
    };

    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', user.id)
          .single();
          
        if (data) {
          setProfile(data);
        } else {
          setProfile({
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Gestor',
            role: 'Admin'
          });
        }
      }
    };

    loadStats();
    loadProfile();
  }, []);

  const liveStats = [
    { label: 'Total de Alunos', value: counts.students.toLocaleString(), trend: 'Ativos', trendType: 'up', icon: Users, color: 'blue', path: '/alunos' },
    { label: 'Arquivo Passivo', value: counts.archived.toLocaleString(), trend: 'Arquivados', trendType: 'neutral', icon: Archive, color: 'slate', path: '/arquivos' },
    { label: 'Professores Ativos', value: counts.teachers.toLocaleString(), trend: 'Em exercício', trendType: 'up', icon: GraduationCap, color: 'purple', path: '/rh' },
    { label: 'Turmas Cadastradas', value: counts.classes.toLocaleString(), trend: 'Ativas', trendType: 'neutral', icon: CalendarIcon, color: 'amber', path: '/escola' },
    { label: 'Eventos do Mês', value: counts.events.toLocaleString(), trend: 'Agendados', trendType: 'up', icon: AlertCircle, color: 'red', path: '/calendario' },
  ];
  return (
    <>
      <Header title="Dashboard" />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">Bem-vindo, {profile?.name || '...'}</h2>
          <p className="text-slate-500">Aqui está o resumo da sua instituição hoje.</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
          {liveStats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              onClick={() => navigate(stat.path)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  stat.color === 'blue' && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50",
                  stat.color === 'slate' && "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700",
                  stat.color === 'purple' && "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50",
                  stat.color === 'amber' && "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50",
                  stat.color === 'red' && "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 group-hover:bg-red-200 dark:group-hover:bg-red-900/50"
                )}>
                  <stat.icon size={20} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  stat.trendType === 'up' ? 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' :
                  stat.trendType === 'down' ? 'text-rose-500 bg-rose-100 dark:bg-rose-900/30' :
                  'text-slate-500 bg-slate-100 dark:bg-slate-800'
                }`}>
                  {stat.trend}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Frequência Semanal</h3>
                <p className="text-sm text-slate-500">Média de comparecimento dos alunos</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">{counts.students > 0 ? '94%' : '0%'}</span>
                {counts.students > 0 && (
                  <span className="text-xs text-emerald-500 font-medium flex items-center">
                    <TrendingUp size={14} className="mr-1" /> 2%
                  </span>
                )}
              </div>
            </div>
            
            {counts.students > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                      dy={10}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index < 5 ? '#2563eb' : '#cbd5e1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full mb-4">
                  <Users className="text-blue-600 dark:text-blue-400" size={32} />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Painel de Frequência</h4>
                <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                  Acompanhe a média de assiduidade escolar da instituição.<br/>
                  Faça as primeiras matrículas para visualizar os dados.
                </p>
                <button
                  onClick={() => navigate('/alunos/novo')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
                >
                  <UserPlus size={16} /> Matricular Aluno
                </button>
              </div>
            )}
          </div>

          {/* Events Section */}
          <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Próximos Eventos</h3>
              <button className="text-blue-600 text-sm font-semibold hover:underline">Ver todos</button>
            </div>
            <div className="space-y-6">
              {recentEvents.length > 0 ? (
                recentEvents.map((event) => {
                  const d = new Date(event.date);
                  const day = d.getDate() + 1; // Ajuste timezone
                  const month = d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
                  
                  return (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex flex-col items-center justify-center font-bold">
                        <span className="text-[10px] leading-none">{month}</span>
                        <span className="text-lg leading-none">{day}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{event.title}</h4>
                        <p className="text-xs text-slate-500">{event.time || 'Dia todo'} • {event.type}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-slate-400">Nenhum evento agendado.</p>
              )}
            </div>
            <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              + Adicionar Novo Evento
            </button>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mt-6 md:mt-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Últimas Matrículas</h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {recentStudents.length > 0 ? (
              recentStudents.map((std, i) => {
                const date = std.created_at ? new Date(std.created_at).toLocaleDateString('pt-BR') : 'Recent';
                return (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <UserPlus className="text-slate-500" size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          Novo aluno matriculado: <span className="text-blue-600 font-bold">{std.name}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">Cadastrado em {date}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
                <p className="p-4 text-sm text-slate-400">Nenhuma matrícula recente.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
