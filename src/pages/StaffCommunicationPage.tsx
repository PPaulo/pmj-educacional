import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { 
  Building2, 
  Users, 
  User, 
  Send, 
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Employee } from '../types';
import { snakeToCamel } from '../lib/utils';
import { cn } from '../lib/utils';

export function StaffCommunicationPage() {
  const [activeTab, setActiveTab] = useState<'departamento' | 'individual'>('departamento');
  const [departments, setDepartments] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Mensagem
  const [message, setMessage] = useState('');
  
  // Estado para link do grupo
  const [groupLinks, setGroupLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDepartmentsAndLinks();
  }, []);

  useEffect(() => {
    if (selectedDept && activeTab === 'individual') {
      loadEmployees(selectedDept);
    }
  }, [selectedDept, activeTab]);

  const loadDepartmentsAndLinks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('school_id, role').eq('id', user.id).single();
      
      let query = supabase.from('employees').select('department');
      if (profile?.role !== 'Admin' && profile?.school_id) {
         query = query.eq('school_id', profile.school_id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Get unique departments
      const deptSet = new Set<string>();
      if (data) {
          data.forEach(d => {
              if (d.department) deptSet.add(d.department);
          });
      }
      setDepartments(Array.from(deptSet).sort());
      
      const savedLinks = localStorage.getItem('whatsapp_groups_rh');
      if (savedLinks) {
        setGroupLinks(JSON.parse(savedLinks));
      }
    } catch (err) {
      toast.error('Erro ao carregar departamentos');
    }
  };

  const loadEmployees = async (dept: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('school_id, role').eq('id', user?.id).single();
      
      let query = supabase
        .from('employees')
        .select('*')
        .eq('department', dept)
        .neq('status', 'Inativo')
        .order('name');

      if (profile && profile.role !== 'Admin' && profile.school_id) {
          query = query.eq('school_id', profile.school_id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setEmployees(data ? snakeToCamel(data) as any : []);
    } catch (err) {
      toast.error('Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGroupLink = (deptName: string, link: string) => {
    const newLinks = { ...groupLinks, [deptName]: link };
    setGroupLinks(newLinks);
    localStorage.setItem('whatsapp_groups_rh', JSON.stringify(newLinks));
    toast.success('Link do grupo salvo!');
  };

  const openWhatsAppGroup = () => {
    if (!selectedDept) return toast.error('Selecione um departamento.');
    const link = groupLinks[selectedDept];
    if (!link) return toast.error('Nenhum link configurado para este departamento.');
    
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
    if (!selectedEmployee) return toast.error('Selecione um funcionário.');
    if (!message) return toast.error('Digite uma mensagem.');
    
    const emp = employees.find(e => e.id === selectedEmployee);
    if (!emp) return;
    
    if (!emp.phone) return toast.error('Nenhum telefone cadastrado para este servidor.');
    
    const waPhone = formatPhoneForWA(emp.phone);
    if (!waPhone) return toast.error('Telefone com formato inválido.');
    
    const text = encodeURIComponent(message);
    window.open(`https://wa.me/${waPhone}?text=${text}`, '_blank');
  };

  return (
    <>
      <Header title="Comunicação Interna (RH)" />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Building2 className="text-blue-500" size={32} /> 
            Comunicação Interna
          </h2>
          <p className="text-slate-500 mt-2">Envie mensagens direcionadas pelo WhatsApp conectando a Gestão aos Profissionais da Educação.</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl max-w-md w-full mb-6 relative">
          <button
            onClick={() => setActiveTab('departamento')}
            className={cn(
               "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all z-10 relative",
               activeTab === 'departamento' ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <Users size={16} /> Grupo/Setor
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={cn(
               "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all z-10 relative",
               activeTab === 'individual' ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <Briefcase size={16} /> Servidor Específico
          </button>

          {/* Tab Indicator Animation */}
          <motion.div
            layoutId="activeTabIndicatorRH"
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 shadow-sm rounded-lg"
            initial={false}
            animate={{ left: activeTab === 'departamento' ? 4 : '50%' }}
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
                 {activeTab === 'departamento' ? 'Mensagem para Equipe' : 'Mensagem Corporativa Direta'}
               </h3>
               
               <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Selecione o Departamento/Setor</label>
                  <select 
                     value={selectedDept}
                     onChange={(e) => setSelectedDept(e.target.value)}
                     className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  >
                     <option value="">-- Escolha um setor --</option>
                     {departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                     ))}
                  </select>
               </div>

               {activeTab === 'individual' && selectedDept && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Selecione o Servidor</label>
                     <select 
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                     >
                        <option value="">-- Escolha um servidor --</option>
                        {employees.map(e => (
                           <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                        ))}
                     </select>

                     {selectedEmployee && (
                         <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold flex items-center gap-2">
                             <User size={14} /> Telefone Cadastrado: {employees.find(e => e.id === selectedEmployee)?.phone || 'Nenhum'}
                         </div>
                     )}
                  </motion.div>
               )}

               {activeTab === 'departamento' && selectedDept && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Link do Grupo do Setor</label>
                      <div className="flex gap-2">
                          <input 
                             type="url" 
                             placeholder="https://chat.whatsapp.com/..." 
                             value={groupLinks[selectedDept] || ''}
                             onChange={(e) => handleSaveGroupLink(selectedDept, e.target.value)}
                             className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                          />
                      </div>
                      <p className="text-[10px] text-slate-400">Insira o link oficial do setor. Ele ficará salvo para agilizar comunicados.</p>
                  </motion.div>
               )}
            </div>

            {/* Direita: Editor de Mensagem */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
               <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Mensagem Oficial</label>
                  <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">WhatsApp Integrado</span>
               </div>
               
               <textarea 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={activeTab === 'departamento' ? "Prezado setor, informamos que..." : "Olá! Informo que seu contracheque..."}
                  className="w-full flex-1 min-h-[150px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white resize-none"
               />

               <div className="mt-4 flex justify-end">
                   {activeTab === 'departamento' ? (
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
                           <Send size={18} /> Enviar Mensagem
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
