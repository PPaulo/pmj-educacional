import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Plus, Search, Edit2, Trash2, Filter, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GradesModal } from '../components/GradesModal';
import { supabase } from '../lib/supabase';
import { AcademicClass, Employee } from '../types';
import toast from 'react-hot-toast';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { camelToSnake, snakeToCamel, cn } from '../lib/utils';

export function SchoolPage() {
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [teachers, setTeachers] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState('Todos');

  // Modal creation states
  const [userRole, setUserRole] = useState<string>('Secretaria');
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<AcademicClass | null>(null);
  const [classToDelete, setClassToDelete] = useState<AcademicClass | null>(null);

  const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<AcademicClass | null>(null);

  // Form states
  const [formData, setFormData] = useState<Omit<AcademicClass, 'id'>>({
    name: '',
    year: '2026',
    shift: 'Matutino',
    room: '',
    teacherId: '',
    course: 'Ensino Fundamental I',
    grade: '',
    capacity: 35,
    status: 'Ativa',
    minAttendance: 75,
    evaluationType: 'Nota',
    startTime: '07:00',
    endTime: '12:00',
    periodType: 'Bimestral',
    passingGrade: 6.0,
    totalHours: 800
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        let schoolId = null;
        let userRole = 'Secretaria';

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('school_id, role')
            .eq('id', user.id)
            .single();

          if (profile) {
            schoolId = profile.school_id;
            userRole = profile.role;
            setUserRole(profile.role);
            setUserSchoolId(profile.school_id);
          }
        }

        let classQuery = supabase.from('classes').select('*');
        let teacherQuery = supabase.from('employees').select('*').ilike('role', '%Professor%');

        if (userRole !== 'Admin' && schoolId) {
          classQuery = classQuery.eq('school_id', schoolId);
          teacherQuery = teacherQuery.eq('school_id', schoolId);
        }

        const [{ data: classData }, { data: teacherData }] = await Promise.all([
          classQuery,
          teacherQuery
        ]);

        setClasses(snakeToCamel(classData || []));
        setTeachers(snakeToCamel(teacherData || []));
      } catch (err) {
        console.error(err);
        toast.error('Erro ao carregar dados do Supabase');
      }
    };
    loadData();
  }, []);

  const filteredClasses = classes.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesShift = shiftFilter === 'Todos' || c.shift === shiftFilter;
    return matchesSearch && matchesShift;
  });

  const handleOpenModal = (cls?: AcademicClass) => {
    if (cls) {
      setClassToEdit(cls);
      setFormData({
        name: cls.name,
        year: cls.year,
        shift: cls.shift,
        room: cls.room || '',
        teacherId: cls.teacherId || '',
        course: cls.course || 'Ensino Fundamental I',
        grade: cls.grade || '',
        capacity: cls.capacity || 35,
        status: cls.status || 'Ativa',
        minAttendance: cls.minAttendance || 75,
        evaluationType: cls.evaluationType || 'Nota',
        startTime: cls.startTime || '07:00',
        endTime: cls.endTime || '12:00',
        periodType: cls.periodType || 'Bimestral',
        passingGrade: cls.passingGrade || 6.0,
        totalHours: cls.totalHours || 800
      });
    } else {
      setClassToEdit(null);
      setFormData({
        name: '',
        year: '2026',
        shift: 'Matutino',
        room: '',
        teacherId: '',
        course: 'Ensino Fundamental I',
        grade: '',
        capacity: 35,
        status: 'Ativa',
        minAttendance: 75,
        evaluationType: 'Nota',
        startTime: '07:00',
        endTime: '12:00',
        periodType: 'Bimestral',
        passingGrade: 6.0,
        totalHours: 800
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const mappedData = camelToSnake(formData);
      if (mappedData.teacher_id === '') mappedData.teacher_id = null;
      if (!classToEdit && userSchoolId) mappedData.school_id = userSchoolId;

      if (classToEdit) {
        const { error } = await supabase
          .from('classes')
          .update(mappedData)
          .eq('id', classToEdit.id);
        if (error) throw error;
        setClasses(prev => prev.map(c => c.id === classToEdit.id ? { ...c, ...formData } : c));
        toast.success('Turma atualizada!');
      } else {
        const { data, error } = await supabase
          .from('classes')
          .insert(mappedData)
          .select()
          .single();
        if (error) throw error;
        setClasses(prev => [...prev, snakeToCamel(data)]);
        toast.success('Turma cadastrada com sucesso!');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar os dados.');
    }
  };

  const handleDelete = async () => {
    if (!classToDelete) return;
    try {
      const { error } = await supabase.from('classes').delete().eq('id', classToDelete.id);
      if (error) throw error;
      setClasses(prev => prev.filter(c => c.id !== classToDelete.id));
      setIsDeleteModalOpen(false);
      toast.success('Turma removida!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Header title="Gestão Escolar" />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Escola</h1>
            <p className="text-slate-500 text-sm">Gerencie turmas, salas e alocações de professores.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
          >
            <Plus size={16} />
            Nova Turma
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none text-slate-900 dark:text-white"
              placeholder="Pesquisar turma..."
            />
          </div>
          <select 
            value={shiftFilter}
            onChange={e => setShiftFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm dark:text-slate-300"
          >
            <option value="Todos">Todos os Turnos</option>
            <option value="Matutino">Matutino</option>
            <option value="Vespertino">Vespertino</option>
            <option value="Noturno">Noturno</option>
            <option value="Integral">Integral</option>
          </select>
        </div>

        {/* Visão de Tabela para Desktop */}
        <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nome da Turma</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Ano Letivo</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nível/Curso</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Série</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Turno</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Sala</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Professor</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map(cls => {
                  const teacher = teachers.find(t => t.id === cls.teacherId);
                  return (
                    <tr key={cls.id} className="border-b border-slate-200 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{cls.name}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{cls.year}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{cls.course || '-'}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{cls.grade || '-'}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{cls.shift}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{cls.room || '-'}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{teacher ? teacher.name : '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => { setSelectedClass(cls); setIsGradesModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-cyan-600" title="Lançar Notas/Faltas"><ClipboardList size={16} /></button>
                          <button onClick={() => handleOpenModal(cls)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600" title="Editar Turma"><Edit2 size={16} /></button>
                          <button onClick={() => { setClassToDelete(cls); setIsDeleteModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-red-600" title="Excluir Turma"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visão de Cards para Mobile */}
        <div className="grid grid-cols-1 gap-4 md:hidden pb-6">
          {filteredClasses.map(cls => {
            const teacher = teachers.find(t => t.id === cls.teacherId);
            return (
              <div key={cls.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{cls.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Ano Letivo: {cls.year}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold"
                  )}>
                    {cls.shift}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-slate-100 dark:border-slate-800/50">
                  <div>
                    <p className="text-slate-400 text-xs">Sala</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{cls.room || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Professor</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{teacher ? teacher.name : '-'}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                  <button onClick={() => { setSelectedClass(cls); setIsGradesModalOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold">
                    <ClipboardList size={14} /> Notas
                  </button>
                  <button onClick={() => handleOpenModal(cls)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                    <Edit2 size={14} /> Editar
                  </button>
                  <button onClick={() => { setClassToDelete(cls); setIsDeleteModalOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal CREATE/EDIT */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-slate-900 w-full max-w-lg p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{classToEdit ? 'Editar Turma' : 'Cadastrar Nova Turma'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-sm font-medium">Nome da Turma</label>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm" placeholder="Ex: 1º Ano A" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-sm font-medium">Nível / Curso</label>
                      <select value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                        <option value="Educação Infantil">Educação Infantil</option>
                        <option value="Ensino Fundamental I">Ensino Fundamental I</option>
                        <option value="Ensino Fundamental II">Ensino Fundamental II</option>
                        <option value="Ensino Médio">Ensino Médio</option>
                        <option value="EJA">EJA</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Série / Etapa</label>
                      <select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm" required>
                        <option value="">Selecione...</option>
                        <optgroup label="Educação Infantil">
                          <option value="Berçário I">Berçário I</option>
                          <option value="Berçário II">Berçário II</option>
                          <option value="Maternal I">Maternal I</option>
                          <option value="Maternal II">Maternal II</option>
                          <option value="Pré I">Pré I</option>
                          <option value="Pré II">Pré II</option>
                        </optgroup>
                        <optgroup label="Ensino Fundamental I">
                          <option value="1º Ano">1º Ano</option>
                          <option value="2º Ano">2º Ano</option>
                          <option value="3º Ano">3º Ano</option>
                          <option value="4º Ano">4º Ano</option>
                          <option value="5º Ano">5º Ano</option>
                        </optgroup>
                        <optgroup label="Ensino Fundamental II">
                          <option value="6º Ano">6º Ano</option>
                          <option value="7º Ano">7º Ano</option>
                          <option value="8º Ano">8º Ano</option>
                          <option value="9º Ano">9º Ano</option>
                        </optgroup>
                        <optgroup label="Ensino Médio">
                          <option value="1º Ano (Médio)">1º Ano (Médio)</option>
                          <option value="2º Ano (Médio)">2º Ano (Médio)</option>
                          <option value="3º Ano (Médio)">3º Ano (Médio)</option>
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Capacidade Máxima</label>
                      <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ano Letivo</label>
                    <input required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm" placeholder="Ex: 2025" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Turno</label>
                    <select value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value as any})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                      <option value="Matutino">Matutino</option>
                      <option value="Vespertino">Vespertino</option>
                      <option value="Noturno">Noturno</option>
                      <option value="Integral">Integral</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Sala</label>
                    <input value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm" placeholder="Ex: Sala 102" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Professor Regente</label>
                      <select value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                        <option value="">Nenhum</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                        <option value="Ativa">Ativa</option>
                        <option value="Encerrada">Encerrada</option>
                        <option value="Trancada">Trancada</option>
                      </select>
                    </div>
                  </div>
                                    <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">Salvar</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <ConfirmationModal 
          isOpen={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(false)} 
          onConfirm={handleDelete} 
          title="Excluir Turma" 
          description="Você tem certeza que deseja excluir esta turma? Esta ação não poderá ser desfeita."
        />

        {selectedClass && (
          <GradesModal 
            isOpen={isGradesModalOpen}
            onClose={() => setIsGradesModalOpen(false)}
            classId={selectedClass.id}
            className={selectedClass.name}
            type="class"
          />
        )}
      </div>
    </>
  );
}
