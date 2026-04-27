import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import {
  UserPlus,
  UserCheck,
  TrendingUp,
  Filter,
  Download,
  Edit2,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { snakeToCamel, camelToSnake } from '../lib/utils';
import { motion } from 'motion/react';
import { Avatar } from '../components/Avatar';
import { EmployeeModal } from '../components/EmployeeModal';
import { Employee } from '../types';
import { cn, notifyWIP } from '../lib/utils';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ConfirmationModal } from '../components/ConfirmationModal';

export function HRPage() {
  const navigate = useNavigate();
  
  const handleImpersonate = (emp: any) => {
       localStorage.setItem('impersonated_user', JSON.stringify({ id: emp.id, role: emp.role, name: emp.name, school_id: emp.schoolId || emp.school_id }));
       toast.success(`Modo Simulação Ativado: ${emp.name}`);
       navigate(emp.role === 'Professor' ? '/professor' : '/dashboard');
       window.location.reload();
  };

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('Todos');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [allDepartments, setAllDepartments] = useState<string[]>([]);
  const [allRoles, setAllRoles] = useState<string[]>([]);

  const [userRole, setUserRole] = useState('Secretaria');
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState('Todas');
  const [schoolsList, setSchoolsList] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  


  // Carga inicial do perfil
  useEffect(() => {
    document.title = "Recursos Humanos - Sistema Escolar"; // Set document title for HR page
    const loadConfig = async () => {
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
              const { data } = await supabase.from('school_info').select('id, name');
              setSchoolsList(data || []);
          }
        }
      }
    };
    loadConfig();
  }, []);
  
  // Edit e Delete States
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        let query = supabase
          .from('employees')
          .select('*', { count: 'exact' });

        if (userRole !== 'Admin' && userSchoolId) {
          query = query.eq('school_id', userSchoolId);
        } else if (userRole === 'Admin' && schoolFilter !== 'Todas') {
          query = query.eq('school_id', schoolFilter);
        }

        if (departmentFilter !== 'Todos') {
          query = query.eq('department', departmentFilter);
        }

        if (roleFilter !== 'Todos') {
          query = query.eq('role', roleFilter);
        }

        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,role.ilike.%${searchQuery}%,cpf.ilike.%${searchQuery}%`);
        }

        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await query
          .order('name')
          .range(from, to);

        if (error) throw error;
        setEmployees(snakeToCamel(data || []));
        setTotalEmployees(count || 0);
      } catch (err) {
        console.error('Failed to load employees:', err);
        toast.error('Erro ao carregar do Supabase');
      }
    };
    loadEmployees();
  }, [currentPage, pageSize, searchQuery, departmentFilter, roleFilter, schoolFilter, userRole, userSchoolId]);

  useEffect(() => {
    const loadUniques = async () => {
      try {
        let query = supabase.from('employees').select('department, role');
        if (userRole !== 'Admin' && userSchoolId) {
          query = query.eq('school_id', userSchoolId);
        } else if (userRole === 'Admin' && schoolFilter !== 'Todas') {
          query = query.eq('school_id', schoolFilter);
        }

        const { data } = await query;
        if (data) {
          setAllDepartments(Array.from(new Set(data.map((e: any) => e.department).filter(Boolean))));
          setAllRoles(Array.from(new Set(data.map((e: any) => e.role).filter(Boolean))));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadUniques();
  }, [schoolFilter, userRole, userSchoolId]);

  // Compute unique departments for filter dropdown
  const uniqueDepartments = allDepartments;

  const paginatedEmployees = employees;
  const totalPages = Math.ceil(totalEmployees / pageSize);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDepartmentFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepartmentFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
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

  const handleSaveEmployee = async (employeeData: Omit<Employee, 'id'> & { id?: string }) => {
    try {
      const mappedData = camelToSnake(employeeData);
      
      // Ensure empty dates or strings are sent as null to Supabase
      Object.keys(mappedData).forEach(key => {
          if (mappedData[key] === '') mappedData[key] = null;
      });
      
      if (employeeData.id) {
        // Edit 
        const { error } = await supabase
          .from('employees')
          .update(mappedData)
          .eq('id', employeeData.id);
        if (error) throw error;
        
        setEmployees(prev => prev.map(e => e.id === employeeData.id ? { ...e, ...employeeData } as Employee : e));
        toast.success('Dados do funcionário atualizados!');
      } else {
        // Create
        delete mappedData.id;
        
        const { data, error } = await supabase
          .from('employees')
          .insert(mappedData)
          .select()
          .single();
          
        if (error) throw error;
        const newEmployee = snakeToCamel(data) as Employee;

        setEmployees(prev => [newEmployee, ...prev]);
        toast.success('Funcionário adicionado com sucesso!');
      }
      setIsModalOpen(false);
      setEmployeeToEdit(null);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar no Supabase');
    }
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (employeeToDelete) {
      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('id', employeeToDelete.id);
        if (error) throw error;

        setEmployees(prev => prev.filter(e => e.id !== employeeToDelete.id));
        setIsDeleteModalOpen(false);
        setEmployeeToDelete(null);
        toast.success('Funcionário excluído!');

        if (paginatedEmployees.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        console.error(err);
        toast.error('Erro ao excluir no Supabase');
      }
    }
  };

  const handleEditClick = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEmployeeToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <Header title="Recursos Humanos" />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Recursos Humanos</h3>
              <p className="text-slate-500 mt-1 font-medium">Gestão estratégica do quadro funcional e administrativo.</p>
            </div>
              <button
                onClick={handleAddClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/25"
              >
                <UserPlus size={20} />
                Adicionar Funcionário
              </button>
          </div>



          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-1 shadow-sm">
              <span className="text-slate-500 text-sm font-medium">Total de Colaboradores</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold dark:text-white">{totalEmployees}</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full" style={{ width: employees.length > 0 ? '100%' : '0%' }}></div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-1 shadow-sm">
              <span className="text-slate-500 text-sm font-medium">Taxa de Crescimento</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold dark:text-white">Estável</span>
                <span className="text-emerald-500 text-xs font-bold flex items-center">
                  <TrendingUp size={12} className="mr-1" /> Crescimento saudavel
                </span>
              </div>
              <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full"></div>
              </div>
            </div>
          </div>


             <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">Lista de Colaboradores</h4>
              <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                {userRole === 'Admin' && (
                  <div className="relative">
                    <select 
                      value={schoolFilter}
                      onChange={(e) => { setSchoolFilter(e.target.value); setCurrentPage(1); }}
                      className="appearance-none pl-10 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors dark:text-white cursor-pointer focus:ring-2 focus:ring-blue-600 outline-none max-w-[180px] truncate"
                    >
                      <option value="Todas">Todas as Escolas</option>
                      {schoolsList.map(s => (
                         <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                )}

                <div className="relative flex-1 sm:flex-none">
                  <select 
                    value={departmentFilter}
                    onChange={handleDepartmentFilter}
                    className="appearance-none pl-10 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors dark:text-white cursor-pointer focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Todos">Todos os Departamentos</option>
                    {uniqueDepartments.map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>

                <div className="relative flex-1 sm:flex-none">
                  <select 
                    value={roleFilter}
                    onChange={handleRoleFilter}
                    className="appearance-none pl-10 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors dark:text-white cursor-pointer focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Todos">Todos os Cargos</option>
                    {allRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
                <button onClick={() => {
                   const headers = ['ID', 'Nome', 'Cargo', 'Departamento', 'CPF'];
                   const rows = employees.map(e => [e.id, e.name, e.role, e.department, e.cpf || '---']);
                   const csvContent = "data:text/csv;charset=utf-8," 
                     + headers.join(",") + "\n" 
                     + rows.map(r => r.join(",")).join("\n");
                   const encodedUri = encodeURI(csvContent);
                   const link = document.createElement("a");
                   link.setAttribute("href", encodedUri);
                   link.setAttribute("download", "lista_funcionarios.csv");
                   document.body.appendChild(link);
                   link.click();
                   toast.success('Lista de funcionários exportada!');
                }} className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors dark:text-white dark:hover:bg-slate-700">
                  <Download size={16} /> Exportar
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-slate-900 p-3 md:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400 dark:text-white" 
                  placeholder="Pesquisar por nome, cargo ou CPF..." 
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                {/* Visão de Tabela para Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Funcionário</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cargo</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Departamento</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {paginatedEmployees.length > 0 ? (
                        paginatedEmployees.map((emp, i) => (
                          <motion.tr
                            key={emp.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar src={emp.avatar} name={emp.name} size="sm" />
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{emp.name}</p>
                                  <p className="text-[10px] text-slate-500">ID: #{emp.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{emp.role}</td>
                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{emp.department}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                {userRole === 'Admin' && (
                                  <button 
                                    onClick={() => handleImpersonate(emp)}
                                    className="p-1 text-slate-400 hover:text-emerald-500 transition-colors"
                                    title="Simular Acesso do Colaborador"
                                  >
                                    <UserCheck size={16} />
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleEditClick(emp)}
                                  className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                  title="Editar Funcionário"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteClick(emp)}
                                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                  title="Excluir Funcionário"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                            <div className="flex flex-col items-center gap-2">
                              <Search size={40} strokeWidth={1} className="text-slate-400" />
                              <p className="text-sm font-medium text-slate-400">
                                Nenhum funcionário encontrado
                                {searchQuery && ` para "${searchQuery}"`}
                                {departmentFilter !== 'Todos' && ` no departamento "${departmentFilter}"`}
                              </p>
                              <button 
                                onClick={() => {
                                  setSearchQuery('');
                                  setDepartmentFilter('Todos');
                                  setRoleFilter('Todos');
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
                  {paginatedEmployees.length > 0 ? (
                    paginatedEmployees.map((emp, i) => (
                      <motion.div 
                        key={emp.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <Avatar src={emp.avatar} name={emp.name} size="md" />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-base leading-tight">{emp.name}</p>
                              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">ID: #{emp.id}</p>
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                            {emp.department}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50">
                          <p className="text-slate-400 text-xs">Cargo</p>
                          <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm mt-0.5">{emp.role}</p>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                          <button onClick={() => handleEditClick(emp)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                            <Edit2 size={14} /> Editar
                          </button>
                          <button onClick={() => handleDeleteClick(emp)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                            <Trash2 size={14} /> Excluir
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-500">Nenhum funcionário encontrado</div>
                  )}
                </div>

              {/* Pagination */}
              <div className="px-4 md:px-6 py-4 md:py-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full lg:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total:</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{totalEmployees} Funcionários</span>
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
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                      ))}
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
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Funcionário"
        description={`Tem certeza que deseja excluir o funcionário ${employeeToDelete?.name}? Todos os registros serão permanentemente apagados e não poderão ser recuperados.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        employee={employeeToEdit}
        existingCPFs={employees.map(e => e.cpf || '').filter(Boolean)}
      />
    </>
  );
}
