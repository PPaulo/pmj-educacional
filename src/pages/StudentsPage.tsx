import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { 
  UserPlus, 
  Users,
  Filter, 
  Download, 
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Printer,
  ClipboardList,
  FileText
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { snakeToCamel, camelToSnake } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { GradesModal } from '../components/GradesModal';
import { cn, notifyWIP, sortStudents } from '../lib/utils';
import { Avatar } from '../components/Avatar';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { StudentModal } from '../components/StudentModal';
import { SchoolHistoryModal } from '../components/SchoolHistoryModal';
import { Student } from '../types';
import { 
  generateStudentRegistrationPDF, 
  generateStudentLinkageStatementPDF,
  generateStudentTransferDeclarationPDF,
  generateBolsaFamiliaAttendancePDF,
  generateTotalStudentsPDF
} from '../lib/pdf';

import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [totalStudents, setTotalStudents] = useState(0);

  const [userRole, setUserRole] = useState('Secretaria');
  const [userName, setUserName] = useState('');
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState('Todas');
  const [schoolsList, setSchoolsList] = useState<any[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);

  // Deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Registration/Edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  // School History state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [studentForHistory, setStudentForHistory] = useState<Student | null>(null);

  // Lançamento de Notas / Faltas
  const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Carga inicial do perfil
  useEffect(() => {
    const loadConfig = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('name, role, school_id').eq('id', user.id).single();
        if (profile) {
          setUserName(profile.name);
          setUserRole(profile.role);
          setUserSchoolId(profile.school_id);
          
          if (profile.school_id) {
            const { data: school } = await supabase.from('school_info').select('*').eq('id', profile.school_id).single();
            setSchoolInfo(school);
          }

          if (profile.role === 'Admin') {
              const { data } = await supabase.from('school_info').select('id, name');
              setSchoolsList(data || []);
          }
        }
      }
    };
    loadConfig();
  }, []);

  // Load students from database with Client-side Pagination and custom Sorting
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const activeYear = localStorage.getItem('pmj_ano_letivo') || new Date().getFullYear().toString();
        
        let query = supabase
          .from('students')
          .select('*')
          .neq('status', 'Arquivado')
          .eq('ano_letivo', activeYear);

        if (userRole !== 'Admin' && userSchoolId) {
            query = query.eq('school_id', userSchoolId);
        } else if (userRole === 'Admin' && schoolFilter !== 'Todas') {
            query = query.eq('school_id', schoolFilter);
        }

        if (statusFilter !== 'Todos') {
          query = query.eq('status', statusFilter);
        }

        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,registration.ilike.%${searchQuery}%,cpf.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        const allStudents = snakeToCamel(data || []) as Student[];
        
        // Custom sorting
        const sortedStudents = sortStudents(allStudents);
        
        setStudents(sortedStudents);
        setTotalStudents(sortedStudents.length);
      } catch (err) {
        console.error('Failed to load students:', err);
        toast.error('Erro ao carregar do Supabase');
      }
    };
    loadStudents();
  }, [searchQuery, statusFilter, schoolFilter, userRole, userSchoolId]);

  // Se o servidor retornar o código de registro, vamos fazer um fetch auxiliar para obter o max_id para o formulário se necessário
  const getAllStudentsForCodes = async () => {
      const { data } = await supabase.from('students').select('cod_aluno, registration').neq('status', 'Arquivado');
      return snakeToCamel(data || []) as Student[];
  };

  const handleImpersonate = (student: any, role: string) => {
       sessionStorage.setItem('student_session', JSON.stringify(student));
       sessionStorage.setItem('impersonated_user', JSON.stringify({ ...student, role }));
       toast.success(`Modo Simulação Ativado: ${student.name}`);
       navigate('/aluno-portal');
       window.location.reload();
  };

  const getNextCodAluno = async () => {
    const studentsAll = await getAllStudentsForCodes();
    const currentYear = new Date().getFullYear();
    const list = studentsAll.map(s => {
      const match = s.codAluno ? s.codAluno.match(/\d+/) : null;
      return match ? parseInt(match[0], 10) : 0;
    });
    const currentYearRegs = list.filter(r => String(r).startsWith(String(currentYear)));
    const maxReg = Math.max(0, ...currentYearRegs);
    const nextRegNum = maxReg > 0 ? (maxReg % 10000) + 1 : 1;
    return `${currentYear}${String(nextRegNum).padStart(4, '0')}`;
  };

  const getNextRegistration = async () => {
    const studentsAll = await getAllStudentsForCodes();
    const currentYear = new Date().getFullYear();
    const registrations = studentsAll.map(s => {
      const match = s.registration.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
    
    const currentYearRegs = registrations.filter(r => String(r).startsWith(String(currentYear)));
    const maxReg = Math.max(0, ...currentYearRegs);
    const nextReg = maxReg > 0 ? maxReg + 1 : parseInt(`${currentYear}001`);
    return String(nextReg);
  };

  const paginatedStudents = students.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(totalStudents / pageSize);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (studentToDelete) {
      try {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', studentToDelete.id);
        if (error) throw error;
        
        setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
        setStudentToDelete(null);
        setIsDeleteModalOpen(false);
        toast.success('Matrícula cancelada com sucesso!');

        // If we deleted the last item on the page, go back
        if (paginatedStudents.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        console.error(err);
        toast.error('Erro ao excluir no Supabase');
      }
    }
  };

  const handleAddClick = () => {
    navigate('/alunos/novo');
  };

  const handleEditClick = (student: Student) => {
    navigate(`/alunos/editar/${student.id}`);
  };

  const handleHistoryClick = (student: Student) => {
    setStudentForHistory(student);
    setIsHistoryModalOpen(true);
  };

  const handleSaveStudent = async (studentData: Omit<Student, 'id'> & { id?: string }) => {
    try {
      const mappedData = camelToSnake(studentData) as any;
      mappedData.ano_letivo = localStorage.getItem('pmj_ano_letivo') || new Date().getFullYear().toString();
      
      if (userRole !== 'Admin' && userSchoolId && !mappedData.school_id) {
          mappedData.school_id = userSchoolId;
      }
      
      if (studentData.id) {
        const { error } = await supabase
          .from('students')
          .update(mappedData)
          .eq('id', studentData.id);
        if (error) throw error;
        
        setStudents(prev => prev.map(s => s.id === studentData.id ? { ...s, ...studentData } as Student : s));
        setIsModalOpen(false);
        toast.success('Ficha atualizada com sucesso!');
      } else {
        delete mappedData.id; // Let Supabase handle UUID generation
        
        const { data, error } = await supabase
          .from('students')
          .insert(mappedData)
          .select()
          .single();
          
        if (error) throw error;
        const newStudent = snakeToCamel(data) as Student;

        setStudents(prev => [newStudent, ...prev]);
        setIsModalOpen(false);
        toast.success('Aluno matriculado com sucesso!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao salvar no Supabase: ${err.message || 'Erro desconhecido'}`);
    }
  };

  return (
    <>
      <Header title="Gestão de Alunos" />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <Breadcrumbs />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="space-y-1">
            <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Alunos</h3>
            <p className="text-slate-500 dark:text-slate-400">Gerencie matrículas, turmas e históricos acadêmicos.</p>
          </div>
          <div className="flex items-center gap-3">
            {userRole === 'Admin' && (
              <div className="relative">
                <select 
                  value={schoolFilter}
                  onChange={(e) => { setSchoolFilter(e.target.value); setCurrentPage(1); }}
                  className="appearance-none pl-10 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors dark:text-white cursor-pointer focus:ring-2 focus:ring-blue-600 outline-none max-w-[200px] truncate"
                >
                  <option value="Todas">Todas as Escolas</option>
                  {schoolsList.map(s => (
                     <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            )}

            <div className="relative">
              <select 
                value={statusFilter}
                onChange={handleStatusFilter}
                className="appearance-none pl-10 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors dark:text-white cursor-pointer focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="Todos">Todos os Status</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Pendente">Pendente</option>
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
            <button onClick={() => generateTotalStudentsPDF(snakeToCamel(students), schoolsList.find(s => s.id === schoolFilter), userName)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors dark:text-white">
              <Download size={16} />
              Exportar Resumo
            </button>
            <button 
              onClick={handleAddClick}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              <UserPlus size={16} />
              Novo Aluno
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-3 md:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-4 md:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400 dark:text-white" 
              placeholder="Pesquisar por nome, matrícula ou CPF..." 
              type="text"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Visão de Tabela para Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nome</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Matrícula</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">CPF</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Turma</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student, i) => (
                    <motion.tr 
                      key={student.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={student.avatar} name={student.name} size="md" />
                          <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">{student.name}</p>
                            <p className="text-xs text-slate-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600 dark:text-blue-400">{student.registration}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{student.cpf || '---'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {student.class}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          student.status === 'Ativo' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          student.status === 'Pendente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <div className="relative group/menu">
                              <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                                  <Printer size={16} />
                              </button>
                              <div className="absolute right-0 bottom-full mb-2 hidden group-hover/menu:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-1 w-48 animate-in fade-in slide-in-from-bottom-2">
                                  <button onClick={() => generateStudentRegistrationPDF(student, schoolsList.find(s => s.id === student.schoolId), userName)} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                      <FileText size={14} className="text-blue-500" /> Ficha de Matrícula
                                  </button>
                                  <button onClick={() => generateStudentLinkageStatementPDF(student, schoolsList.find(s => s.id === student.schoolId), userName)} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                      <ClipboardList size={14} className="text-emerald-500" /> Declaração de Vínculo
                                  </button>
                                  <button onClick={() => generateStudentTransferDeclarationPDF(student, schoolsList.find(s => s.id === student.schoolId), userName)} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                      <FileSignature size={14} className="text-indigo-500" /> Declaração de Transferência
                                  </button>
                                  <button onClick={async () => {
                                      const { data: att } = await supabase.from('attendance').select('*').eq('student_id', student.id);
                                      generateBolsaFamiliaAttendancePDF(student, att || [], schoolsList.find(s => s.id === student.schoolId), userName);
                                  }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                      <Users size={14} className="text-amber-500" /> Bolsa Família (Freq.)
                                  </button>
                              </div>
                          </div>
                          
                          <button 
                            onClick={() => handleHistoryClick(student)}
                            className="p-1 text-slate-400 hover:text-purple-600 transition-colors"
                            title="Histórico Escolar"
                          >
                            <GraduationCap size={16} />
                          </button>
                          <button 
                            onClick={() => { setSelectedStudent(student); setIsGradesModalOpen(true); }}
                            className="p-1 text-slate-400 hover:text-cyan-600 transition-colors"
                            title="Notas e Faltas"
                          >
                            <ClipboardList size={16} />
                          </button>
                          {userRole === 'Admin' && (
                            <button 
                              onClick={() => handleImpersonate(student, 'Aluno')}
                              className="p-1 text-slate-400 hover:text-emerald-500 transition-colors"
                              title="Simular Acesso do Aluno"
                            >
                              <Users size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleEditClick(student)}
                            className="p-1 text-slate-400 hover:text-blue-600"
                            title="Editar Aluno"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(student)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            title="Excluir Aluno"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Search size={40} strokeWidth={1} />
                        <p className="text-sm font-medium">
                          Nenhum aluno encontrado 
                          {searchQuery && ` para "${searchQuery}"`}
                          {statusFilter !== 'Todos' && ` com status "${statusFilter}"`}
                        </p>
                        <button 
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('Todos');
                          }}
                          className="text-xs text-blue-600 font-bold hover:underline mt-2"
                        >
                          Limpar todos os filtros
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Visão de Cards para Mobile */}
          <div className="grid grid-cols-1 gap-4 md:hidden p-4">
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student, i) => (
                <motion.div 
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar src={student.avatar} name={student.name} size="md" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-base leading-tight">{student.name}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Matrícula: {student.registration}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${
                      student.status === 'Ativo' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      student.status === 'Pendente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {student.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-slate-100 dark:border-slate-800/50">
                    <div>
                      <p className="text-slate-400 text-xs">CPF</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs mt-0.5">{student.cpf || '---'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Turma</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 mt-0.5">
                        {student.class}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                    <button onClick={() => generateStudentRegistrationPDF(student, schoolInfo, userName)} className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors" title="Imprimir Ficha"><Printer size={16} /></button>
                    <button onClick={() => handleHistoryClick(student)} className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 transition-colors" title="Histórico"><GraduationCap size={16} /></button>
                    <button onClick={() => { setSelectedStudent(student); setIsGradesModalOpen(true); }} className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 transition-colors" title="Notas e Faltas"><ClipboardList size={16} /></button>
                    <button onClick={() => handleEditClick(student)} className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors" title="Editar"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteClick(student)} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors" title="Excluir"><Trash2 size={16} /></button>
                  </div>
                </motion.div>
              ))
            ) : (
               <div className="p-6 text-center text-slate-500">Nenhum aluno encontrado</div>
            )}
          </div>
          {/* Pagination */}
          <div className="px-4 md:px-6 py-4 md:py-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{totalStudents} Alunos</span>
              </div>
              
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Exibindo:</span>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                >
                  <option value={5}>5 por página</option>
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full lg:w-auto justify-between lg:justify-end">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Página <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> de <span className="font-bold text-slate-900 dark:text-white">{totalPages || 1}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-all shadow-sm"
                  title="Página Anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Simple logic to show only a few pages if there are many
                    // For now, since we only have 3, it's fine. 
                    // But let's make it look better.
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={cn(
                          "size-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all",
                          currentPage === page 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105" 
                            : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        )}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button 
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-all shadow-sm"
                  title="Próxima Página"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Aluno"
        description={`Tem certeza que deseja excluir o aluno ${studentToDelete?.name}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      <SchoolHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        student={studentForHistory}
        issuerName={userName}
        school={schoolInfo}
      />

      {selectedStudent && (
        <GradesModal 
          isOpen={isGradesModalOpen}
          onClose={() => setIsGradesModalOpen(false)}
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
          className={selectedStudent.class}
          type="individual"
        />
      )}
    </>
  );
}
