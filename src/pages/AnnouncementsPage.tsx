import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter, 
  CalendarDays, 
  Users, 
  School, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // States para novos anúncios
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('Todos');
  const [schoolId, setSchoolId] = useState(''); // Vazio = Todas
  const [schoolsList, setSchoolsList] = useState<any[]>([]);

  // Admin Controls
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         setUserId(user.id);
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

  useEffect(() => {
    loadAnnouncements();
  }, [userRole, userSchoolId]);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      let query = supabase.from('announcements').select('*, school_info(name)').order('created_at', { ascending: false });
      
      if (userRole !== 'Admin' && userSchoolId) {
          query = query.or(`school_id.eq.${userSchoolId},school_id.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar avisos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return toast.error('Preencha os campos obrigatórios.');

    setLoading(true);
    try {
      const finalSchoolId = userRole === 'Admin' ? (schoolId === '' ? null : schoolId) : userSchoolId;

      const { error } = await supabase.from('announcements').insert([{
        title,
        content,
        target_role: targetRole,
        school_id: finalSchoolId,
        author_id: userId
      }]);

      if (error) throw error;
      toast.success('Comunicado publicado com sucesso!');
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      loadAnnouncements();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao publicar.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este aviso?')) return;
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
      toast.success('Aviso removido.');
      loadAnnouncements();
    } catch (err) {
      toast.error('Erro ao remover.');
    }
  };

  const filteredAnnouncements = announcements.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header title="Mural de Comunicados" />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Megaphone className="text-blue-600" size={32} /> Mural de Avisos
            </h1>
            <p className="text-slate-500 text-sm">Publicação de circulares, alertas e avisos gerais para a comunidade.</p>
          </div>

          {(userRole === 'Admin' || userRole === 'Diretor' || userRole === 'Secretaria') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition"
            >
              <Plus size={18} /> Novo Comunicado
            </button>
          )}
        </div>

        <div className="mb-6 max-w-sm">
           <div className="relative">
               <input 
                  type="text" 
                  placeholder="Pesquisar avisos..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-sm"
               />
               <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
           </div>
        </div>

        {loading ? (
             <div className="p-12 text-center text-slate-400">Carregando avisos...</div>
        ) : filteredAnnouncements.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredAnnouncements.map((ann) => (
                       <motion.div 
                          key={ann.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition"
                       >
                            <div>
                                 <div className="flex justify-between items-start mb-2">
                                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{ann.title}</h3>
                                      {(userRole === 'Admin' || userRole === 'Diretor') && (
                                           <button onClick={() => handleDelete(ann.id)} className="p-1 text-slate-400 hover:text-red-500 transition"><Trash2 size={16}/></button>
                                      )}
                                 </div>
                                 <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{ann.content}</p>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500">
                                 <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md"><CalendarDays size={12}/> {new Date(ann.created_at).toLocaleDateString()}</span>
                                 <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-1 rounded-md"><Users size={12}/> {ann.target_role}</span>
                                 <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 px-2 py-1 rounded-md"><School size={12}/> {ann.school_info?.name || 'Todas as Escolas'}</span>
                            </div>
                       </motion.div>
                  ))}
             </div>
        ) : (
             <div className="p-12 text-center border border-dashed rounded-2xl text-slate-400">
                  <AlertCircle size={40} className="mx-auto mb-2 stroke-1" />
                  Nenhum comunicado publicado ainda.
             </div>
        )}

        {/* Modal Novo Comunicado */}
        <AnimatePresence>
          {isModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
                       <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Novo Comunicado</h2>
                       <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                            <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Título</label>
                                 <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm outline-none" placeholder="Ex: Aviso Importante" required />
                            </div>
                            <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Conteúdo</label>
                                 <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm outline-none h-24" placeholder="Escreva o aviso..." required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                 <div>
                                      <label className="block text-xs font-bold text-slate-500 mb-1">Público Alvo</label>
                                      <select value={targetRole} onChange={e => setTargetRole(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm">
                                           <option value="Todos">Todos</option>
                                           <option value="Professor">Professores</option>
                                           <option value="Aluno">Alunos</option>
                                      </select>
                                 </div>
                                 {userRole === 'Admin' && (
                                      <div>
                                           <label className="block text-xs font-bold text-slate-500 mb-1">Escola</label>
                                           <select value={schoolId} onChange={e => setSchoolId(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm">
                                                <option value="">Todas</option>
                                                {schoolsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                           </select>
                                      </div>
                                 )}
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 rounded-xl">Cancelar</button>
                                 <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition disabled:opacity-50">{loading ? 'Publicando...' : 'Publicar'}</button>
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
