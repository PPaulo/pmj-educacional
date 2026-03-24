import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { 
  MessageCircle, 
  Users, 
  User, 
  Send, 
  Link as LinkIcon,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { AcademicClass, Student } from '../types';
import { snakeToCamel } from '../lib/utils';
import { cn } from '../lib/utils';

export function FamilyCommunicationPage() {
  const [activeTab, setActiveTab] = useState<'turma' | 'individual'>('turma');
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Mensagem
  const [message, setMessage] = useState('');
  
  // Estado para link do grupo (poderíamos salvar no BD depois, aqui fica armazenado no state local/banco)
  const [groupLinks, setGroupLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && activeTab === 'individual') {
      loadStudents(selectedClass);
    }
  }, [selectedClass, activeTab]);

  const loadClasses = async () => {
    try {
      // Carregar a escola vinculada se for diretor/secretaria
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('school_id, role').eq('id', user.id).single();
      
      let query = supabase.from('classes').select('*').order('name');
      if (profile?.role !== 'Admin' && profile?.school_id) {
         query = query.eq('school_id', profile.school_id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setClasses(data ? snakeToCamel(data) as any : []);
      
      // Load WhatsApp group links from localStorage for now (or a generic way)
      // Idealmente, adicionaríamos whatsapp_group_link na tabela classes
      const savedLinks = localStorage.getItem('whatsapp_groups');
      if (savedLinks) {
        setGroupLinks(JSON.parse(savedLinks));
      }
    } catch (err) {
      toast.error('Erro ao carregar turmas');
    }
  };

  const loadStudents = async (className: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class', className)
        .neq('status', 'Arquivado')
        .order('name');
      
      if (error) throw error;
      setStudents(data ? snakeToCamel(data) as any : []);
    } catch (err) {
      toast.error('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGroupLink = (className: string, link: string) => {
    const newLinks = { ...groupLinks, [className]: link };
    setGroupLinks(newLinks);
    localStorage.setItem('whatsapp_groups', JSON.stringify(newLinks));
    toast.success('Link do grupo salvo!');
  };

  const openWhatsAppGroup = () => {
    if (!selectedClass) return toast.error('Selecione uma turma.');
    const link = groupLinks[selectedClass];
    if (!link) return toast.error('Nenhum link configurado para esta turma.');
    
    // Copy message to clipboard before opening
    if (message) {
      navigator.clipboard.writeText(message);
      toast.success('Mensagem copiada! Cole no grupo.');
    }
    
    window.open(link.startsWith('http') ? link : `https://${link}`, '_blank');
  };

  const formatPhoneForWA = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 10) {
      return `55${digits}`;
    }
    return '';
  };

  const openWhatsAppIndividual = () => {
    if (!selectedStudent) return toast.error('Selecione um aluno.');
    if (!message) return toast.error('Digite uma mensagem.');
    
    const student = students.find(s => s.id === selectedStudent);
    if (!student) return;
    
    const phone = student.responsiblePhone || student.fatherPhoneCelular || student.motherPhoneCelular;
    if (!phone) return toast.error('Nenhum telefone celular cadastrado para este aluno.');
    
    const waPhone = formatPhoneForWA(phone);
    if (!waPhone) return toast.error('Telefone com formato inválido.');
    
    const text = encodeURIComponent(message);
    window.open(`https://wa.me/${waPhone}?text=${text}`, '_blank');
  };

  return (
    <>
      <Header title="Comunicação com Pais" />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <MessageCircle className="text-green-500" size={32} /> 
            Portal da Família
          </h2>
          <p className="text-slate-500 mt-2">Envie mensagens direcionadas pelo WhatsApp conectando a escola com as famílias.</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl max-w-md w-full mb-6 relative">
          <button
            onClick={() => setActiveTab('turma')}
            className={cn(
               "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all z-10 relative",
               activeTab === 'turma' ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <Users size={16} /> Grupo da Turma
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={cn(
               "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all z-10 relative",
               activeTab === 'individual' ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <User size={16} /> Mensagem Individual
          </button>

          {/* Tab Indicator Animation */}
          <motion.div
            layoutId="activeTabIndicator"
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 shadow-sm rounded-lg"
            initial={false}
            animate={{ left: activeTab === 'turma' ? 4 : '50%' }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          <motion.div
             key={activeTab}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             transition={{ duration: 0.2 }}
             className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Esquerda: Controles */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                 {activeTab === 'turma' ? 'Mensagem Global' : 'Mensagem Direta'}
               </h3>
               
               <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Selecione a Turma</label>
                  <select 
                     value={selectedClass}
                     onChange={(e) => setSelectedClass(e.target.value)}
                     className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white"
                  >
                     <option value="">-- Escolha uma turma --</option>
                     {classes.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                     ))}
                  </select>
               </div>

               {activeTab === 'individual' && selectedClass && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Selecione o Aluno</label>
                     <select 
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white"
                     >
                        <option value="">-- Escolha um aluno --</option>
                        {students.map(s => (
                           <option key={s.id} value={s.id}>{s.name} (Ref: {s.registration})</option>
                        ))}
                     </select>

                     {selectedStudent && (
                         <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold flex items-center gap-2">
                             <User size={14} /> Telefone Principal: {students.find(s => s.id === selectedStudent)?.responsiblePhone || 'Não cadastrado'}
                         </div>
                     )}
                  </motion.div>
               )}

               {activeTab === 'turma' && selectedClass && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Link do Grupo do WhatsApp</label>
                      <div className="flex gap-2">
                          <input 
                             type="url" 
                             placeholder="https://chat.whatsapp.com/..." 
                             value={groupLinks[selectedClass] || ''}
                             onChange={(e) => handleSaveGroupLink(selectedClass, e.target.value)}
                             className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white"
                          />
                      </div>
                      <p className="text-[10px] text-slate-400">Insira o convite do grupo. O link fica salvo no seu navegador para esta turma.</p>
                  </motion.div>
               )}
            </div>

            {/* Direita: Editor de Mensagem */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
               <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Mensagem</label>
                  <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">WhatsApp Integrado</span>
               </div>
               
               <textarea 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={activeTab === 'turma' ? "Digite aqui o aviso que deseja enviar para o grupo..." : "Digite a mensagem para os pais do aluno..."}
                  className="w-full flex-1 min-h-[150px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white resize-none"
               />

               <div className="mt-4 flex justify-end">
                   {activeTab === 'turma' ? (
                       <button 
                          onClick={openWhatsAppGroup}
                          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#25D366]/30 transition-all"
                       >
                           <Send size={18} /> Copiar e Abrir Grupo
                       </button>
                   ) : (
                       <button 
                          onClick={openWhatsAppIndividual}
                          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#25D366]/30 transition-all"
                       >
                           <Send size={18} /> Enviar no WhatsApp
                       </button>
                   )}
               </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
