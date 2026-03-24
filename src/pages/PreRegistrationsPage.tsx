import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { 
  FolderPlus, 
  Search, 
  Check, 
  X, 
  Clock, 
  Phone, 
  CalendarDays,
  User,
  Heart,
  Trash
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { snakeToCamel } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { ConfirmationModal } from '../components/ConfirmationModal';



export function PreRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [regToDelete, setRegToDelete] = useState<any | null>(null);


  useEffect(() => {
    const checkAuth = async () => {
         const { data } = await supabase.auth.getUser();
         if (!data.user) {
              toast.error('Acesso restrito. Por favor, faça login.');
              navigate('/login');
         } else {
              loadRegistrations();
         }
    };
    checkAuth();
  }, []);


  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('pre_registrations').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setRegistrations(snakeToCamel(data || []));
    } catch (err) {
      toast.error('Erro ao carregar pré-matrículas.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (reg: any) => {
    setRegToDelete(reg);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (regToDelete) {
      try {
        const { error } = await supabase.from('pre_registrations').delete().eq('id', regToDelete.id);
        if (error) throw error;
        toast.success('Pré-matrícula excluída com sucesso!');
        setRegToDelete(null);
        setIsDeleteModalOpen(false);
        loadRegistrations();
      } catch (err) {
        toast.error('Erro ao excluir.');
      }
    }
  };



  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('pre_registrations').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast.success(`Matrícula ${newStatus === 'Aprovado' ? 'Aprovada' : 'Reprovada'}!`);

      if (newStatus === 'Aprovado') {
           const reg = registrations.find(r => r.id === id);
           if (reg && reg.responsavelPhone) {
                const cleanPhone = reg.responsavelPhone.replace(/\D/g, '');
                const msg = `Olá *${reg.responsavelName}*, a pré-matrícula de *${reg.studentName}* para a série *${reg.classInterest}* foi *APROVADA*! 🎉%0A%0APor favor, compareça à escola portando os seguintes documentos para efetivação da matrícula:%0A-%20Certidão%20de%20Nascimento%0A-%20CPF%20e%20RG%20do%20Aluno%20e%20Responsável%0A-%20Comprovante%20de%20Residência%0A-%20Carteira%20de%20Vacinação%0A%0AAtenciosamente,%20Secretaria%20Escolar.`;
                window.open(`https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${msg}`, '_blank');
           }
      }

      loadRegistrations();
    } catch (err) {
      toast.error('Erro ao atualizar status.');
    }
  };

  const filteredRegistrations = registrations.filter(r => 
    r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.responsavelName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header title="Pré-Matrículas Online" />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Heart className="text-pink-500" size={32} /> Central de Vagas
          </h1>
          <p className="text-slate-500 text-sm">Aprovação, triagem e controle de solicitações de novas matrículas da rede.</p>
        </div>

        <div className="mb-6 max-w-sm">
           <div className="relative">
               <input 
                  type="text" 
                  placeholder="Pesquisar por candidato ou responsável..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-sm outline-none"
               />
               <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
           </div>
        </div>

        {loading ? (
             <div className="p-12 text-center text-slate-400">Carregando lista de candidatos...</div>
        ) : filteredRegistrations.length > 0 ? (
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-sm">
                       <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                 <th className="px-6 py-4 font-bold text-slate-600">Candidato / Responsável</th>
                                 <th className="px-6 py-4 font-bold text-slate-600">Série Desejada</th>
                                 <th className="px-6 py-4 font-bold text-slate-600">Data de Solicitação</th>
                                 <th className="px-6 py-4 font-bold text-slate-600">Status</th>
                                 <th className="px-6 py-4 font-bold text-slate-600 text-right">Ações</th>
                            </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {filteredRegistrations.map((reg) => (
                                 <tr key={reg.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                      <td className="px-6 py-4">
                                           <div>
                                                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1"><User size={14} className="text-slate-400"/> {reg.studentName}</p>
                                                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><Phone size={11}/> {reg.responsavelName} ({reg.responsavelPhone})</p>
                                           </div>
                                      </td>
                                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-400">{reg.classInterest}</td>
                                      <td className="px-6 py-4 text-slate-500 text-xs flex items-center gap-1 mt-4"><CalendarDays size={14}/> {new Date(reg.createdAt).toLocaleDateString()}</td>
                                      <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded text-[10px] font-black uppercase ${
                                                 reg.status === 'Aprovado' ? 'bg-green-100 text-green-700' :
                                                 reg.status === 'Reprovado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                 {reg.status}
                                            </span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                           <div className="flex justify-end gap-2">
                                                {reg.status === 'Pendente' && (
                                                     <>
                                                          <button onClick={() => handleStatusUpdate(reg.id, 'Aprovado')} className="p-1 px-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-md font-bold text-xs flex items-center gap-1"><Check size={14}/></button>
                                                          <button onClick={() => handleStatusUpdate(reg.id, 'Reprovado')} className="p-1 px-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md font-bold text-xs flex items-center gap-1"><X size={14}/></button>
                                                     </>
                                                )}
                                                <button onClick={() => handleDeleteClick(reg)} className="p-1 px-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-md font-bold text-xs flex items-center gap-1"><Trash size={14}/></button>
                                           </div>
                                      </td>

                                 </tr>
                            ))}
                       </tbody>
                  </table>
             </div>
        ) : (
             <div className="p-12 text-center border border-dashed rounded-2xl text-slate-400">Nenhuma pré-matrícula pendente.</div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setRegToDelete(null); }}
        onConfirm={confirmDelete}
        title="Excluir Pré-Matrícula"
        description={`Tem certeza que deseja excluir a pré-matrícula de ${regToDelete?.studentName}? Esta ação não poderá ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </>

  );
}
