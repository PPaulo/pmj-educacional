import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Clock, CheckCircle, AlertCircle, Calendar, List, Search, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export function TimesheetsPage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [employeeData, setEmployeeData] = useState<any>(null);
    
    const [todayRecord, setTodayRecord] = useState<any>({
        check_in: null, break_out: null, break_in: null, check_out: null
    });

    const [personalHistory, setPersonalHistory] = useState<any[]>([]);
    const [teamHistory, setTeamHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'mine' | 'team'>('mine');

    // Admin filters
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

    // Success Modal Customizado
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successDetails, setSuccessDetails] = useState({ type: '', time: '' });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) return;

         const { data: profile } = await supabase.from('profiles').select('id, name, role, school_id').eq('id', user.id).single();
         if (profile) {
              setUserProfile(profile);
              
              const { data: emp } = await supabase.from('employees').select('*').eq('cpf', user.user_metadata?.cpf || profile.name).maybeSingle();
              if (emp) setEmployeeData(emp);

              loadTodayRecord(emp?.id || profile.id);
              loadPersonalHistory(emp?.id || profile.id);

              if (profile.role === 'Admin' || profile.role === 'Diretor' || profile.role === 'Secretaria') {
                   loadTeamHistory(profile.school_id);
              }
         }
    };

    const loadTodayRecord = async (id: string) => {
         const today = new Date().toISOString().split('T')[0];
         const { data } = await supabase.from('employee_timesheets').select('*').eq('employee_id', id).eq('date', today).maybeSingle();
         if (data) setTodayRecord(data);
    };

    const loadPersonalHistory = async (id: string) => {
         const { data } = await supabase.from('employee_timesheets').select('*').eq('employee_id', id).order('date', { ascending: false }).limit(10);
         setPersonalHistory(data || []);
    };

    const loadTeamHistory = async (schoolId: string | null) => {
         let query = supabase.from('employee_timesheets').select('*, employees(name, role)').order('date', { ascending: false });
         if (schoolId) query = query.eq('school_id', schoolId);
         const { data } = await query;
         setTeamHistory(data || []);
    };

    const handleClockIn = async (type: 'check_in' | 'break_out' | 'break_in' | 'check_out') => {
         if (!employeeData && !userProfile) return toast.error('Perfil não identificado.');
         setLoading(true);

         const id = employeeData?.id || userProfile?.id;
         const schoolId = employeeData?.school_id || userProfile?.school_id;
         const today = new Date().toISOString().split('T')[0];
         const time = currentTime.toLocaleTimeString('pt-BR', { hour12: false });

         const getCoords = () => new Promise<{lat: string, lng: string} | null>((resolve) => {
             if (!navigator.geolocation) return resolve(null);
             navigator.geolocation.getCurrentPosition(
                 (p) => resolve({ lat: p.coords.latitude.toString(), lng: p.coords.longitude.toString() }),
                 () => resolve(null),
                 { enableHighAccuracy: true, timeout: 5000 }
             );
         });

         try {
              const coords = await getCoords();
              const payload: any = { [type]: time };
              if (coords) {
                   payload.latitude = coords.lat;
                   payload.longitude = coords.lng;
              }

              const { data: existing } = await supabase.from('employee_timesheets').select('id').eq('employee_id', id).eq('date', today).maybeSingle();

              if (existing) {
                   await supabase.from('employee_timesheets').update(payload).eq('id', existing.id);
              } else {
                   await supabase.from('employee_timesheets').insert({ employee_id: id, school_id: schoolId, date: today, ...payload });
              }
              
              setSuccessDetails({ type: type.replace('_', ' ').toUpperCase(), time: time });
              setShowSuccessModal(true);

              loadTodayRecord(id); loadPersonalHistory(id);
         } catch (err: any) {
              toast.error(err.message);
         } finally { setLoading(false); }
    };

    const cardClass = "p-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl flex flex-col items-center justify-center text-center space-y-1 shadow-inner cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all";

    return (
        <>
            <Header title="Folha de Ponto" />
            <div className="flex-1 p-6 space-y-6 overflow-y-auto h-full">
                
                {/* TABS HEADER ADMIN */}
                {(userProfile?.role === 'Admin' || userProfile?.role === 'Diretor' || userProfile?.role === 'Secretaria') && (
                     <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 gap-2">
                        <button onClick={() => setActiveTab('mine')} className={`flex items-center gap-2 px-4 py-2 border-b-2 font-semibold text-sm ${activeTab === 'mine' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}><UserCheck size={16} /> Meu Ponto</button>
                        <button onClick={() => setActiveTab('team')} className={`flex items-center gap-2 px-4 py-2 border-b-2 font-semibold text-sm ${activeTab === 'team' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}><List size={16} /> Auditoria da Equipe</button>
                     </div>
                )}

                {activeTab === 'mine' ? (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* WIDGET BATER PONTO */}
                        <div className="md:col-span-1 bg-white dark:bg-slate-900 border p-6 rounded-3xl shadow-sm text-center flex flex-col justify-center items-center space-y-4">
                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Relógio Eletrônico</h4>
                             <div className="text-4xl font-black text-slate-900 dark:text-white font-mono bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-2xl shadow-inner border">
                                  {currentTime.toLocaleTimeString('pt-BR')}
                             </div>
                             <p className="text-xs text-slate-500">{currentTime.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

                             <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                  <button onClick={() => handleClockIn('check_in')} disabled={loading || !!todayRecord.check_in} className={`${cardClass} ${todayRecord.check_in ? 'border-emerald-500 text-emerald-600' : ''}`}>
                                       {todayRecord.check_in ? <CheckCircle size={18} /> : <Clock size={18} />}
                                       <span className="text-[10px] font-bold">ENTRADA</span>
                                       <span className="text-xs font-black">{todayRecord.check_in || '--:--'}</span>
                                  </button>
                                  <button onClick={() => handleClockIn('break_out')} disabled={loading || !todayRecord.check_in || !!todayRecord.break_out} className={cardClass}>
                                       {todayRecord.break_out ? <CheckCircle size={18} /> : <Clock size={18} />}
                                       <span className="text-[10px] font-bold">SAÍDA ALMOÇO</span>
                                       <span className="text-xs font-black">{todayRecord.break_out || '--:--'}</span>
                                  </button>
                                  <button onClick={() => handleClockIn('break_in')} disabled={loading || !todayRecord.break_out || !!todayRecord.break_in} className={cardClass}>
                                       {todayRecord.break_in ? <CheckCircle size={18} /> : <Clock size={18} />}
                                       <span className="text-[10px] font-bold">VOLTA ALMOÇO</span>
                                       <span className="text-xs font-black">{todayRecord.break_in || '--:--'}</span>
                                  </button>
                                  <button onClick={() => handleClockIn('check_out')} disabled={loading || !todayRecord.break_in || !!todayRecord.check_out} className={cardClass}>
                                       {todayRecord.check_out ? <CheckCircle size={18} /> : <Clock size={18} />}
                                       <span className="text-[10px] font-bold">SAÍDA</span>
                                       <span className="text-xs font-black">{todayRecord.check_out || '--:--'}</span>
                                  </button>
                             </div>
                        </div>

                        {/* TABELA MEUS PONTOS */}
                        <div className="md:col-span-2 bg-white dark:bg-slate-900 border p-6 rounded-3xl shadow-sm space-y-4">
                             <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"><Calendar size={18} className="text-blue-600"/> Histórico Recente (Seu Extrato)</h3>
                             <table className="w-full text-left font-sans text-xs">
                                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b">
                                       <tr><th className="px-4 py-2">Data</th><th>Entrada</th><th>S. Almoço</th><th>V. Almoço</th><th>Saída</th></tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                       {personalHistory.map(h => (
                                            <tr key={h.id} className="hover:bg-slate-50">
                                                 <td className="px-4 py-2 font-bold">{new Date(h.date).toLocaleDateString()}</td>
                                                 <td>{h.check_in || '-'}</td><td>{h.break_out || '-'}</td><td>{h.break_in || '-'}</td><td>{h.check_out || '-'}</td>
                                            </tr>
                                       ))}
                                  </tbody>
                             </table>
                        </div>
                     </div>
                ) : (
                     /* ABA AUDITORIA EQUIPE */
                     <div className="bg-white dark:bg-slate-900 border p-6 rounded-3xl shadow-sm space-y-4">
                          <div className="flex justify-between items-center gap-4">
                               <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"><List size={18} className="text-blue-600"/> Registros da Equipe</h3>
                               <div className="flex gap-2">
                                    <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="bg-slate-50 border rounded-xl px-3 py-1.5 text-xs font-bold" />
                                    <input type="text" placeholder="Pesquisar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-slate-50 border rounded-xl px-3 py-1.5 text-xs font-bold" />
                               </div>
                          </div>
                          <table className="w-full text-left font-sans text-xs">
                               <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b">
                                    <tr><th className="px-4 py-2">Funcionário</th><th>Data</th><th>Entrada</th><th>S. Almoço</th><th>V. Almoço</th><th>Saída</th><th>Mapa</th></tr>
                               </thead>
                               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {teamHistory.filter(t => !searchQuery || t.employees?.name.toLowerCase().includes(searchQuery.toLowerCase())).map(t => (
                                         <tr key={t.id} className="hover:bg-slate-50">
                                              <td className="px-4 py-2"><p className="font-bold">{t.employees?.name || 'Incompleto'}</p><p className="text-[10px] text-slate-400">{t.employees?.role}</p></td>
                                              <td className="font-bold">{new Date(t.date).toLocaleDateString()}</td>
                                              <td>{t.check_in || '-'}</td><td>{t.break_out || '-'}</td><td>{t.break_in || '-'}</td><td>{t.check_out || '-'}</td>
                                              <td>{t.latitude ? <a href={`https://www.google.com/maps?q=${t.latitude},${t.longitude}`} target="_blank" className="text-blue-600 hover:underline font-bold">Ver Local</a> : '-'}</td>
                                         </tr>
                                    ))}
                               </tbody>
                          </table>
                     </div>
                )}

                <AnimatePresence>
                     {showSuccessModal && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 border border-slate-200 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
                                    <div className="size-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto"><CheckCircle size={28} /></div>
                                    <h2 className="font-black text-slate-900 dark:text-white text-base">Ponto Registrado com Sucesso!</h2>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border">
                                         <p className="text-[10px] font-bold text-slate-400 uppercase">{successDetails.type}</p>
                                         <p className="text-2xl font-black text-slate-800 dark:text-white font-mono">{successDetails.time}</p>
                                    </div>
                                    <button onClick={() => setShowSuccessModal(false)} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/20 transition-all">Entendido</button>
                               </motion.div>
                          </motion.div>
                     )}
                </AnimatePresence>

            </div>
        </>
    );
}
