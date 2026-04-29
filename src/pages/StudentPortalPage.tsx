import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  FileText, 
  Download,
  Bell
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function StudentPortalPage() {
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [grades, setGrades] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  const [events] = useState([
    { title: "Conselho de Classe", date: "30/03", type: "Evento", color: "amber" },
  ]);

  const [notices] = useState([
    { text: "Lembrete: Trazer material de pintura para a aula de Artes amanhã.", date: "1h atrás" },
  ]);

  useEffect(() => {
    const sessionStr = sessionStorage.getItem('student_session');
    if (!sessionStr) {
        navigate('/');
        return;
    }
    const student = JSON.parse(sessionStr);
    setStudentInfo(student);
    loadGrades(student.id);
  }, []);

  const loadGrades = async (studentId: string) => {
    setLoading(true);
    try {
        const { data } = await supabase.from('grades').select('*').eq('student_id', studentId);
        const mapped = (data || []).map(g => ({
            subject: g.subject,
            n1: g.grade || 0,
            n2: 0, n3: 0, n4: 0, // Fallback fields to match layout structure
            avg: g.grade || 0,
            status: g.grade >= 6 ? "Aprovado" : "Em Recuperação"
        }));
        setGrades(mapped);

        setPerformanceData([
            { bimester: "1º Bim", grade: 7.8 }
        ]);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  if (!studentInfo) return null;

  return (
    <>
      <Header title="Portal do Aluno" />
      <div className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
        
        {/* BANNER DE BOAS VINDAS */}
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg overflow-hidden relative"
        >
            <div className="absolute right-0 bottom-0 opacity-10 translate-y-10">
                <BookOpen size={200} />
            </div>
            <div className="relative space-y-2">
                <p className="text-blue-100 text-sm font-semibold tracking-wider uppercase">Ambiente do Estudante</p>
                <h1 className="text-3xl font-black">
                    {studentInfo.gender === 'Feminino' ? 'Bem-vinda' : 'Bem-vindo'}, {studentInfo.name}
                </h1>
                <p className="text-blue-100 text-sm">{studentInfo.class} | Matrícula: {studentInfo.registration}</p>
            </div>
        </motion.div>

        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard icon={BookOpen} title="Média Geral" value={grades.length > 0 ? (grades.reduce((a,b) => a + b.avg, 0)/grades.length).toFixed(1) : 0} color="bg-blue-600" />
            <StatsCard icon={CheckCircle2} title="Frequência" value={studentInfo.attendance || "100%"} color="bg-green-600" />
            <StatsCard icon={AlertCircle} title="Faltas" value={studentInfo.absences || 0} color="bg-red-500" />
            <StatsCard icon={TrendingUp} title="Evolução" value="+5.4%" color="bg-indigo-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* BOLETIM E GRÁFICO (ESQUERDA) */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* GRÁFICO DE EVOLUÇÃO */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Evolução de Notas</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                                <XAxis dataKey="bimester" stroke="#94a3b8" fontSize={11} />
                                <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={11} />
                                <Tooltip />
                                <Area type="monotone" dataKey="grade" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorGrade)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* TABELA DE NOTAS (BOLETIM) */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Boletim Escolar</h3>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                            <Download size={14} /> PDF
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Disciplina</th>
                                    <th className="px-2 py-3 text-center">N1</th>
                                    <th className="px-2 py-3 text-center">N2</th>
                                    <th className="px-2 py-3 text-center">N3</th>
                                    <th className="px-2 py-3 text-center">N4</th>
                                    <th className="px-2 py-3 text-center font-bold">Média</th>
                                    <th className="px-4 py-3 text-center">Situação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {grades.map((g, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{g.subject}</td>
                                        <td className="px-2 py-3 text-center">{g.n1.toFixed(1)}</td>
                                        <td className="px-2 py-3 text-center">{g.n2.toFixed(1)}</td>
                                        <td className="px-2 py-3 text-center">{g.n3.toFixed(1)}</td>
                                        <td className="px-2 py-3 text-center">{g.n4.toFixed(1)}</td>
                                        <td className="px-2 py-3 text-center font-bold text-blue-600 dark:text-blue-400">{g.avg.toFixed(1)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                {g.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* BARRA LATERAL (DIREITA): CALENDÁRIO E AVISOS */}
            <div className="space-y-6">
                
                {/* PRÓXIMAS AVALIAÇÕES */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="text-blue-600" size={20} />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Calendário</h3>
                    </div>
                    <div className="space-y-3">
                        {events.map((e, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-800/30">
                                <div className={`px-2.5 py-1 rounded-lg font-black text-xs text-white ${e.color === 'red' ? 'bg-red-500' : e.color === 'blue' ? 'bg-blue-600' : 'bg-amber-500'}`}>
                                    {e.date}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{e.title}</p>
                                    <p className="text-xs text-slate-400">{e.type}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AVISOS / MURAL */}
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="text-amber-500" size={20} />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mural de Avisos</h3>
                    </div>
                    <div className="space-y-3">
                        {notices.map((n, idx) => (
                            <div key={idx} className="space-y-1 p-3 border-l-4 border-l-amber-400 bg-amber-50/30 dark:bg-amber-900/10 rounded-r-xl">
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{n.text}</p>
                                <p className="text-[10px] text-slate-400">{n.date}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>

      </div>
    </>
  );
}

// Subcomponente de Card de Estatísticas
function StatsCard({ icon: Icon, title, value, color }: { icon: any, title: string, value: any, color: string }) {
    return (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color} text-white`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-xs text-slate-500 font-medium">{title}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}
