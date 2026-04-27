import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { 
  FileText, 
  UserSquare, 
  ClipboardList, 
  History, 
  Download, 
  Search, 
  X, 
  FileCheck,
  Users,
  BarChart2,
  FileSignature,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { generateStudentRegistrationPDF, generateClassListPDF, generateTotalStudentsPDF, generateStudentLinkageStatementPDF, generateReportCardPDF, generateSchoolTranscriptPDF, generateBolsaFamiliaAttendancePDF } from '../lib/pdf';
import toast from 'react-hot-toast';
import { snakeToCamel } from '../lib/utils';

const reportsList = [
  { id: 'declaration', title: 'Declaração de Vínculo', description: 'Atestado de matrícula e frequência regular do aluno.', icon: FileCheck, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', scope: 'student' },
  { id: 'bolsa_familia', title: 'Frequência Bolsa Família', description: 'Acompanhamento de frequência mensal para condicionalidades.', icon: ClipboardList, color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', scope: 'student' },
  { id: 'registration', title: 'Ficha Individual', description: 'Dados cadastrais completos, endereço e responsáveis.', icon: UserSquare, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', scope: 'student' },
  { id: 'report', title: 'Boletim Escolar', description: 'Notas e faltas segmentadas por bimestre e disciplina.', icon: ClipboardList, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', scope: 'student' },
  { id: 'history', title: 'Histórico Escolar', description: 'Registro completo da trajetória acadêmica do aluno.', icon: History, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', scope: 'student' },
  { id: 'class_list', title: 'Alunos por Turma', description: 'Listagem completa de estudantes matriculados por sala.', icon: Users, color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', scope: 'class' },
  { id: 'total_students', title: 'Total de Alunos', description: 'Relatório consolidado com a quantidade geral de matrículas.', icon: BarChart2, color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20', scope: 'general' },
];

export function ReportsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Admin Controls
  const [userRole, setUserRole] = useState('Secretaria');
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState('Todas');
  const [schoolsList, setSchoolsList] = useState<any[]>([]);

  // Carregar Configurações
  useEffect(() => {
    const loadConfig = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         const { data: profile } = await supabase
           .from('profiles')
           .select('*, school_info(*)')
           .eq('id', user.id)
           .single();
           
         if (profile) {
             setUserRole(profile.role);
             setUserSchoolId(profile.school_id);
             if (profile.school_info) setSchool(profile.school_info);
             
             if (profile.role === 'Admin') {
                 const { data } = await supabase.from('school_info').select('*');
                 setSchoolsList(data || []);
             }
         }
      }
    };
    loadConfig();
  }, []);

  // Carregar Dados Conforme Filtros
  useEffect(() => {
    const loadData = async () => {
      let stdQuery = supabase.from('students').select('*').order('name');
      let clsQuery = supabase.from('classes').select('*').order('name');

      if (userRole !== 'Admin' && userSchoolId) {
           stdQuery = stdQuery.eq('school_id', userSchoolId);
           clsQuery = clsQuery.eq('school_id', userSchoolId);
      } else if (userRole === 'Admin' && schoolFilter !== 'Todas') {
           stdQuery = stdQuery.eq('school_id', schoolFilter);
           clsQuery = clsQuery.eq('school_id', schoolFilter);
      }

      const [{ data: stds }, { data: cls }] = await Promise.all([
           stdQuery, clsQuery
      ]);

      setStudents(snakeToCamel(stds || []));
      setClasses(snakeToCamel(cls || []));

      // Atualizar info da escola para o cabeçalho do PDF
      if (userRole === 'Admin') {
           if (schoolFilter === 'Todas') {
               const { data: schools } = await supabase.from('school_info').select('*').not('logo_url', 'is', null).limit(1);
               if (schools && schools.length > 0) setSchool(schools[0]);
           } else {
               const targetSchool = schoolsList.find(s => s.id === schoolFilter);
               if (targetSchool) setSchool(targetSchool);
           }
      }
    };
    loadData();
  }, [schoolFilter, userRole, userSchoolId]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.registration.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenReport = (report: any) => {
    setSelectedReport(report);
    setSelectedStudent(null);
    setSearchQuery('');
    setIsModalOpen(true);
  };

  const handleGenerate = async (autoSign = false) => {
    if (selectedReport.scope === 'student' && !selectedStudent) {
      return toast.error('Selecione um aluno para continuar.');
    }
    if (selectedReport.scope === 'class' && !selectedClass) {
      return toast.error('Selecione uma turma para continuar.');
    }

    setLoading(true);
    try {
      if (selectedReport.id === 'declaration') {
        generateStudentLinkageStatementPDF(selectedStudent, school);
        toast.success('Declaração de Vínculo gerada com sucesso!');
      } else if (selectedReport.id === 'registration') {
        generateStudentRegistrationPDF(selectedStudent, school);
        toast.success('Ficha Individual gerada com sucesso!');
      } else if (selectedReport.id === 'total_students') {
        generateTotalStudentsPDF(students, classes, school);
        toast.success(`Relatório: Total de Alunos (${students.length}) gerado com sucesso!`);
      } else if (selectedReport.id === 'class_list') {
        const classStudents = students.filter(s => s.class === selectedClass.name);
        generateClassListPDF(selectedClass.name, classStudents, school);
        toast.success(`Lista de Alunos da Turma ${selectedClass.name} (${classStudents.length}) gerada com sucesso!`);
      } else if (selectedReport.id === 'report') {
        const { data: grades } = await supabase.from('grades').select('*').eq('student_id', selectedStudent.id);
        generateReportCardPDF(selectedStudent, grades || [], school);
        toast.success('Boletim Escolar gerado com sucesso!');
      } else if (selectedReport.id === 'history') {
        const { data: grades } = await supabase.from('grades').select('*').eq('student_id', selectedStudent.id);
        generateSchoolTranscriptPDF(selectedStudent, grades || [], school);
        toast.success('Histórico Escolar gerado com sucesso!');
      } else if (selectedReport.id === 'bolsa_familia') {
        const { data: attendance } = await supabase.from('attendance').select('*').eq('student_id', selectedStudent.id);
        generateBolsaFamiliaAttendancePDF(selectedStudent, attendance || [], school);
        toast.success('Declaração Bolsa Família gerada com sucesso!');
      } else {
        toast.success(`Relatório "${selectedReport.title}" gerado com sucesso!`);
      }
      setIsModalOpen(false);

      if (autoSign) {
          setTimeout(() => {
              toast.success('Redirecionando para Assinaturas Gov.br...');
              setTimeout(() => {
                  window.open('https://assinador.iti.br/assinatura/index.xhtml', '_blank');
              }, 1500);
          }, 1000);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao gerar relatório: ${err.message || 'Desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Relatórios e Documentos" />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Central de Relatórios</h1>
            <p className="text-slate-500 dark:text-slate-400">Emissão de documentos oficiais, fichas e estatísticas acadêmicas.</p>
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
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
             </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reportsList.map((rep, i) => (
            <motion.div 
              key={rep.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className={`size-12 rounded-xl flex items-center justify-center border mb-4 ${rep.color}`}>
                  <rep.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{rep.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{rep.description}</p>
              </div>
              
              <button 
                onClick={() => handleOpenReport(rep)}
                className="w-full mt-6 py-2.5 rounded-xl text-sm font-bold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center gap-2 border dark:border-slate-700 transition-colors"
              >
                <Download size={16} />
                Gerar Relatório
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal SELEÇÃO */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
              
              <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-200 dark:text-white">{selectedReport?.title}</h3>
                  <p className="text-xs text-slate-500">Defina os parâmetros de emissão.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                {selectedReport?.scope === 'student' && (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Buscar aluno por nome..." 
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setSelectedStudent(null); }}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map(std => (
                          <button 
                            key={std.id}
                            type="button"
                            onClick={() => setSelectedStudent(std)}
                            className={`w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors ${selectedStudent?.id === std.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                          >
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{std.name}</p>
                              <p className="text-xs text-slate-500">Turma: {std.class || 'S/T'} • Matrícula: {std.registration}</p>
                            </div>
                            {selectedStudent?.id === std.id && <div className="size-2 rounded-full bg-blue-600" />}
                          </button>
                        ))
                      ) : (
                        <p className="p-4 text-center text-xs text-slate-400">Nenhum aluno encontrado.</p>
                      )}
                    </div>
                  </>
                )}

                {selectedReport?.scope === 'class' && (
                  <div>
                    <label className="text-xs font-bold text-slate-500">Selecione a Turma</label>
                    <select 
                      value={selectedClass?.id || ''} 
                      onChange={e => {
                        const cls = classes.find(c => c.id === e.target.value);
                        setSelectedClass(cls);
                      }}
                      className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm"
                    >
                      <option value="">Selecione...</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedReport?.scope === 'general' && (
                  <div className="py-4 text-center border border-dashed rounded-xl bg-slate-50 dark:bg-slate-800/20">
                    <p className="text-sm text-slate-500">Este relatório consolidará dados de todos os <b>{students.length} alunos</b> matriculados.</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 text-slate-700 rounded-lg text-sm transition-colors">Cancelar</button>
                
                <button 
                  disabled={loading || (selectedReport?.scope === 'student' && !selectedStudent) || (selectedReport?.scope === 'class' && !selectedClass)} 
                  onClick={() => handleGenerate(true)} 
                  className="flex items-center gap-1.5 px-4 py-2 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                >
                  <FileSignature size={16} />
                  Assinar (Gov.br)
                  <ExternalLink size={14} className="opacity-70" />
                </button>

                <button 
                  disabled={loading || (selectedReport?.scope === 'student' && !selectedStudent) || (selectedReport?.scope === 'class' && !selectedClass)} 
                  onClick={() => handleGenerate(false)} 
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Download size={16} />
                  {loading ? 'Gerando...' : 'Gerar PDF'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
