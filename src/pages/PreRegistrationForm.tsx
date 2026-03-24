import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ArrowLeft, 
  User, 
  CalendarDays, 
  Phone, 
  School, 
  GraduationCap,
  Search,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { snakeToCamel } from '../lib/utils';

const maskCPF = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2');
};

const maskPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

export function PreRegistrationForm() {
  const [activeTab, setActiveTab] = useState<'form' | 'status'>('form');
  const [loading, setLoading] = useState(false);
  const [schoolsList, setSchoolsList] = useState<any[]>([]);

  // States do formulário
  const [studentName, setStudentName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [docCpf, setDocCpf] = useState('');
  const [responsavelName, setResponsavelName] = useState('');
  const [responsavelPhone, setResponsavelPhone] = useState('');
  const [classInterest, setClassInterest] = useState('');
  const [schoolInterest, setSchoolInterest] = useState('');

  // States de Consulta
  const [searchCpf, setSearchCpf] = useState('');
  const [consultResult, setConsultResult] = useState<any[]>([]);

  useEffect(() => {
     const loadSchools = async () => {
         const { data } = await supabase.from('school_info').select('id, name');
         setSchoolsList(data || []);
     };
     loadSchools();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !birthDate || !responsavelName || !responsavelPhone || !classInterest) {
         return toast.error('Por favor, preencha todos os campos obrigatórios.');
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('pre_registrations').insert([{
         student_name: studentName,
         birth_date: birthDate,
         doc_cpf: docCpf || null,
         responsavel_name: responsavelName,
         responsavel_phone: responsavelPhone,
         class_interest: classInterest,
         school_interest: schoolInterest === '' ? null : schoolInterest
      }]);

      if (error) throw error;
      toast.success('Solicitação enviada! Aguarde contato da secretaria.');
      
      setStudentName(''); setBirthDate(''); setDocCpf('');
      setResponsavelName(''); setResponsavelPhone('');
      setClassInterest(''); setSchoolInterest('');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCpf) return toast.error('Digite o CPF cadastrado.');

    setLoading(true);
    try {
      const { data, error } = await supabase.from('pre_registrations').select('*, school_info(name)').eq('doc_cpf', searchCpf.trim());
      if (error) throw error;
      setConsultResult(snakeToCamel(data || []));
      if (data && data.length === 0) toast.error('Nenhuma inscrição encontrada para este CPF.');
    } catch (err) {
      toast.error('Erro ao consultar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
             <NavLink to="/" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition">
                  <ArrowLeft size={20}/>
             </NavLink>
             <div className="flex items-center gap-1.5 font-black text-rose-500 text-sm">
                  <Heart size={16} /> Portal de Vagas
             </div>
        </div>

        <div className="text-center mb-6">
             <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Portal de Pré-Matrícula</h1>
             <p className="text-slate-500 text-sm mt-1">Solicite vagas ou consulte o andamento da sua solicitação.</p>
        </div>

        {/* Alternador de Tabs */}
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-xl mb-6">
             <button 
                  onClick={() => setActiveTab('form')} 
                  className={`flex-1 py-2.5 text-center text-xs font-black rounded-lg transition flex items-center justify-center gap-1 ${
                       activeTab === 'form' 
                       ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/20' 
                       : 'text-slate-500 hover:text-slate-700'
                  }`}
             >
                  <Heart size={14} className={activeTab === 'form' ? 'animate-pulse' : ''} /> Solicitar Vaga
             </button>
             <button 
                  onClick={() => setActiveTab('status')} 
                  className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition ${
                       activeTab === 'status' 
                       ? 'bg-white dark:bg-slate-800 text-rose-600 shadow-sm' 
                       : 'text-slate-500 hover:text-slate-700'
                  }`}
             >
                  Consultar Andamento
             </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'form' ? (
                <motion.form key="form" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleSubmit} className="space-y-6">
                     <div className="space-y-4">
                          <h3 className="text-sm font-black text-blue-600 border-b pb-2">Informações do Candidato (Aluno)</h3>
                          <div>
                               <label className="block text-xs font-bold text-slate-500 mb-1">Nome Completo do Aluno *</label>
                               <div className="relative">
                                    <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm font-medium outline-none" required />
                                    <User className="absolute left-3 top-3 text-slate-400" size={16} />
                               </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                               <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Nascimento *</label>
                                    <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl text-sm font-medium outline-none" required />
                               </div>
                               <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">CPF (Opcional)</label>
                                    <input type="text" value={docCpf} onChange={e => setDocCpf(maskCPF(e.target.value))} maxLength={14} className="w-full px-4 py-2.5 border rounded-xl text-sm font-medium outline-none" placeholder="000.000.000-00" />
                               </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                               <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Série Desejada *</label>
                                    <select value={classInterest} onChange={e => setClassInterest(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm font-medium bg-white dark:bg-slate-800" required>
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
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Escola</label>
                                    <select value={schoolInterest} onChange={e => setSchoolInterest(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm font-medium bg-white dark:bg-slate-800">
                                         <option value="">Indiferente...</option>
                                         {schoolsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                               </div>
                          </div>
                     </div>
                     <div className="space-y-4 pt-2 border-t">
                          <h3 className="text-sm font-black text-rose-600 pb-2">Informações do Responsável</h3>
                          <div>
                               <label className="block text-xs font-bold text-slate-500 mb-1">Nome Completo *</label>
                               <input type="text" value={responsavelName} onChange={e => setResponsavelName(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl text-sm font-medium outline-none" required />
                          </div>
                          <div>
                               <label className="block text-xs font-bold text-slate-500 mb-1">Telefone / WhatsApp *</label>
                               <div className="relative">
                                    <input type="text" value={responsavelPhone} onChange={e => setResponsavelPhone(maskPhone(e.target.value))} maxLength={15} className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm font-medium outline-none" placeholder="(00) 90000-0000" required />
                                    <Phone className="absolute left-3 top-3 text-slate-400" size={16} />
                               </div>
                          </div>
                     </div>

                     <button type="submit" disabled={loading} className="w-full py-3 bg-rose-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-rose-700 transition disabled:opacity-50">
                          {loading ? 'Enviando...' : 'Enviar Solicitação de Vaga'}
                     </button>
                </motion.form>
          ) : (
                <motion.div key="status" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                     <form onSubmit={handleConsult} className="flex gap-2">
                          <div className="relative flex-1">
                                <input type="text" value={searchCpf} onChange={e => setSearchCpf(maskCPF(e.target.value))} className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none" placeholder="Digite o CPF do Aluno..." maxlength="14" />
                               <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                          </div>
                          <button type="submit" disabled={loading} className="px-4 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-900 transition flex items-center gap-1">
                               {loading ? 'Buscando...' : 'Consultar'}
                          </button>
                     </form>

                     <div className="space-y-3">
                          {consultResult.map((res: any) => (
                               <div key={res.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-2">
                                         <div>
                                              <p className="font-bold text-slate-900 dark:text-white text-sm">{res.studentName}</p>
                                              <p className="text-[10px] text-slate-400 flex items-center gap-1"><GraduationCap size={12}/> {res.classInterest}</p>
                                         </div>
                                         <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                              res.status === 'Aprovado' ? 'bg-green-100 text-green-700' :
                                              res.status === 'Reprovado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                         }`}>
                                              {res.status}
                                         </span>
                                    </div>
                                    <div className="border-t pt-2 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                                         <span className="flex items-center gap-1"><Clock size={12}/>{new Date(res.createdAt).toLocaleDateString()}</span>
                                         <span>Escola: {res.schoolInfo?.name || 'Geral (Sem preferência)'}</span>
                                    </div>
                               </div>
                          ))}
                     </div>
                </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
