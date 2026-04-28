import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  CalendarDays, 
  Users, 
  Trash2,
  AlertCircle,
  Clock,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { snakeToCamel, sortStudents } from '../lib/utils';

export function OccurrencesPage() {
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // States para nova ocorrência
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Informativo');
  
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [userRole, setUserRole] = useState('Secretaria');
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         const { data: profile } = await supabase.from('profiles').select('role, school_id').eq('id', user.id).single();
         if (profile) {
             setUserRole(profile.role);
             setUserSchoolId(profile.school_id);
             
             // Carregar alunos para o Select do formulário
             let studQuery = supabase.from('students').select('id, name, entry_date');
             if (profile.role !== 'Admin' && profile.school_id) {
                 studQuery = studQuery.eq('school_id', profile.school_id);
             }
             const { data: stds } = await studQuery;
             setStudentsList(sortStudents(snakeToCamel(stds || [])));
         }
      }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    loadOccurrences();
  }, [userSchoolId, userRole]);

  const loadOccurrences = async () => {
    setLoading(true);
    try {
      let query = supabase.from('occurrences').select('*, students(name)').order('created_at', { ascending: false });
      
      if (userRole !== 'Admin' && userSchoolId) {
          query = query.eq('school_id', userSchoolId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setOccurrences(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar ocorrências.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOccurrence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !title || !description) return toast.error('Preencha os campos obrigatórios.');

    setLoading(true);
    try {
      // Pega a escola do aluno selecionado para vincular correto
      const targetStudent = studentsList.find(s => s.id === studentId);
      
      const { error } = await supabase.from('occurrences').insert([{
        student_id: studentId,
        title,
        description,
        type,
        school_id: userSchoolId // ideal pegar o do student se for admin, mas aqui simplificamos para o do usuario ativo
      }]);

      if (error) throw error;
      toast.success('Ocorrência registrada!');
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setStudentId('');
      loadOccurrences();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao registrar.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir esta ocorrência?')) return;
    try {
      const { error } = await supabase.from('occurrences').delete().eq('id', id);
      if (error) throw error;
      toast.success('Ocorrência removida.');
      loadOccurrences();
    } catch (err) {
      toast.error('Erro ao remover.');
    }
  };

  const filteredOccurrences = occurrences.filter(o => 
    o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.students?.name && o.students.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <Header title="Gestão de Ocorrências" />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={32} /> Livro de Ocorrências
            </h1>
            <p className="text-slate-500 text-sm">Registro de incidentes disciplinares, alertas médicos e avisos pedagógicos.</p>
          </div>

          {(userRole === 'Admin' || userRole === 'Diretor' || userRole === 'Secretaria' || userRole === 'Professor') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-red-700 transition"
            >
              <Plus size={18} /> Registrar Ocorrência
            </button>
          )}
        </div>

        <div className="mb-6 max-w-sm">
           <div className="relative">
               <input 
                  type="text" 
                  placeholder="Pesquisar por título ou aluno..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-sm"
               />
               <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
           </div>
        </div>

        {loading ? (
             <div className="p-12 text-center text-slate-400">Carregando ocorrências...</div>
        ) : filteredOccurrences.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOccurrences.map((occ) => (
                       <motion.div 
                          key={occ.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition"
                       >
                            <div>
                                 <div className="flex justify-between items-start mb-2">
                                      <div>
                                           <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                occ.type === 'Grave' ? 'bg-red-100 text-red-700' :
                                                occ.type === 'Alerta' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                           }`}>
                                                {occ.type}
                                           </span>
                                           <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{occ.title}</h3>
                                      </div>
                                      {(userRole === 'Admin' || userRole === 'Diretor') && (
                                           <button onClick={() => handleDelete(occ.id)} className="p-1 text-slate-400 hover:text-red-500 transition"><Trash2 size={16}/></button>
                                      )}
                                 </div>
                                 <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-4">{occ.description}</p>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3 flex flex-col gap-1 text-[11px] font-bold text-slate-500">
                                 <span className="flex items-center gap-1"><User size={12}/> Aluno: <b className="text-slate-800 dark:text-slate-300">{occ.students?.name || 'Desconhecido'}</b></span>
                                 <span className="flex items-center gap-1"><Clock size={12}/> {new Date(occ.created_at).toLocaleString()}</span>
                            </div>
                       </motion.div>
                  ))}
             </div>
        ) : (
             <div className="p-12 text-center border border-dashed rounded-2xl text-slate-400">
                  <AlertCircle size={40} className="mx-auto mb-2 stroke-1" />
                  Nenhuma ocorrência registrada.
             </div>
        )}

        {/* Modal Nova Ocorrência */}
        <AnimatePresence>
          {isModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
                       <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Novo Registro</h2>
                       <form onSubmit={handleCreateOccurrence} className="space-y-4">
                            <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Aluno</label>
                                 <select value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm outline-none bg-white dark:bg-slate-800" required>
                                      <option value="">Selecione o Aluno</option>
                                      {studentsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                 </select>
                            </div>
                            <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Título / Assunto</label>
                                 <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm outline-none" placeholder="Ex: Atraso, Falta de material" required />
                            </div>
                            <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Descrição</label>
                                 <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm outline-none h-24" placeholder="Detalhes do incidente..." required />
                            </div>
                            <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Gravidade</label>
                                 <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm">
                                      <option value="Informativo">Informativo</option>
                                      <option value="Alerta">Alerta / Observação</option>
                                      <option value="Grave">Infração Grave</option>
                                 </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 rounded-xl">Cancelar</button>
                                 <button type="submit" disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-red-700 transition disabled:opacity-50">{loading ? 'Gravando...' : 'Salvar Registro'}</button>
                            </div>
                       </form>
                  </motion.div>
             </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
