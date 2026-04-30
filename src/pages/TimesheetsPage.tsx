import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Clock, Calendar, CheckCircle, List, MapPin, FileSignature, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addReportFooter } from '../lib/pdf';

export function TimesheetsPage() {
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [userProfile, setUserProfile] = useState<any>(null);
    const [todayRecord, setTodayRecord] = useState<any>({});
    const [personalHistory, setPersonalHistory] = useState<any[]>([]);
    const [teamHistory, setTeamHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'mine' | 'team'>('mine');
    const [onlyOnePeriod, setOnlyOnePeriod] = useState(false);

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

    useEffect(() => {
        if (activeTab === 'team' && userProfile?.role !== 'Professor') {
            loadTeamHistory(dateFilter);
        }
    }, [dateFilter, activeTab]);

    const loadInitialData = async () => {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) return;

         const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
         if (profile) {
              setUserProfile(profile);
              loadTodayRecord(user.id);
              loadPersonalHistory(user.id);
         }
    };

    const loadTodayRecord = async (userId: string) => {
         const today = new Date().toISOString().split('T')[0];
         const { data, error } = await supabase.from('user_timesheets').select('*').eq('user_id', userId).eq('date', today).maybeSingle();
         if (!error) {
              setTodayRecord(data || {});
         }
    };

    const loadPersonalHistory = async (userId: string) => {
         const { data } = await supabase.from('user_timesheets').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(10);
         setPersonalHistory(data || []);
    };

    const loadTeamHistory = async (date: string) => {
         let query = supabase.from('user_timesheets').select('*, profiles(name, role)').eq('date', date).order('created_at', { ascending: false });
         
         if (userProfile?.school_id && userProfile.role !== 'Admin') {
             query = query.eq('school_id', userProfile.school_id);
         }
         
         const { data } = await query;
         setTeamHistory(data || []);
    };

    const handleClockIn = async (type: 'check_in' | 'break_out' | 'break_in' | 'check_out') => {
         if (!userProfile) return toast.error('Perfil não carregado corretamente. Recarregue a página.');
         setLoading(true);

         const id = userProfile.id;
         const schoolId = userProfile.school_id;
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
              if (coords && !todayRecord?.latitude) {
                   // Apenas registra a primeira localização do dia se não existir
                   payload.latitude = coords.lat;
                   payload.longitude = coords.lng;
              }

              const { data: existing } = await supabase.from('user_timesheets').select('id').eq('user_id', id).eq('date', today).maybeSingle();

              if (existing) {
                   await supabase.from('user_timesheets').update(payload).eq('id', existing.id);
              } else {
                   await supabase.from('user_timesheets').insert({ 
                       user_id: id, 
                       school_id: schoolId, 
                       date: today, 
                       ...payload 
                   });
              }
              
              setSuccessDetails({ type: type.replace('_', ' ').toUpperCase(), time: time });
              setShowSuccessModal(true);

              loadTodayRecord(id); 
              loadPersonalHistory(id);
         } catch (err: any) {
              toast.error('Erro ao salvar ponto: ' + err.message);
         } finally { 
              setLoading(false); 
         }
    };

    const handleExportAndSign = () => {
         if (!userProfile) return;

         try {
             const doc = new jsPDF();
             
             // Cabeçalho
             doc.setFontSize(20);
             doc.setTextColor(30, 64, 175); // blue-800
             doc.text('Relatório de Ponto', 14, 22);
             
             doc.setFontSize(12);
             doc.setTextColor(71, 85, 105); // slate-600
             doc.text(`Funcionário: ${userProfile.name}`, 14, 32);
             doc.text(`Cargo: ${userProfile.role || 'Não informado'}`, 14, 38);
             doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 44);

             // Tabela
             const tableColumn = ["Data", "Entrada", "Saída Almoço", "Volta Almoço", "Saída"];
             const tableRows: any[] = [];

             personalHistory.forEach(record => {
                 const date = record.date ? record.date.split('-').reverse().join('/') : '-';
                 tableRows.push([
                     date,
                     record.check_in || '-',
                     record.break_out || '-',
                     record.break_in || '-',
                     record.check_out || '-'
                 ]);
             });

             autoTable(doc, {
                 startY: 50,
                 head: [tableColumn],
                 body: tableRows,
                 theme: 'grid',
                 headStyles: { fillColor: [37, 99, 235] }, // blue-600
                 styles: { fontSize: 10, cellPadding: 3 },
                 alternateRowStyles: { fillColor: [248, 250, 252] } // slate-50
             });

             // Rodapé de assinatura
             const finalY = (doc as any).lastAutoTable.finalY || 50;
             doc.setFontSize(10);
             doc.setTextColor(100, 116, 139);
             doc.text('____________________________________________________', 105, finalY + 40, { align: 'center' });
             doc.text('Assinatura do Funcionário', 105, finalY + 45, { align: 'center' });
             doc.text('(Documento a ser assinado eletronicamente via Gov.br)', 105, finalY + 50, { align: 'center' });

             addReportFooter(doc, userProfile?.name);
             // Baixa o PDF
             doc.save(`folha_de_ponto_${userProfile.name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
             
             toast.success('PDF Gerado com sucesso! Redirecionando para as Assinaturas do Gov.br...');

             // Abre o assinador Gov.br
             setTimeout(() => {
                 window.open('https://assinador.iti.br/assinatura/index.xhtml', '_blank');
             }, 2000);
         } catch (error) {
             toast.error('Erro ao gerar PDF');
             console.error(error);
         }
    };

    const cardClass = "p-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl flex flex-col items-center justify-center text-center space-y-1 shadow-inner cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all";

    return (
        <div className="p-6">
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                     <div>
                          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                              <span className="p-2 bg-blue-600 rounded-xl text-white"><Clock size={24} /></span>
                              Folha de Ponto
                          </h1>
                          <p className="text-sm text-slate-500 mt-1">Registre seus horários e acessos de forma isolada.</p>
                     </div>
                     <div className="flex gap-2">
                          <button onClick={() => setActiveTab('mine')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${activeTab === 'mine' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border hover:bg-slate-50'}`}>Meu Ponto</button>
                          {userProfile?.role !== 'Professor' && userProfile?.role !== 'Aluno' && (
                               <button onClick={() => setActiveTab('team')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${activeTab === 'team' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border hover:bg-slate-50'}`}>Auditoria Equipe</button>
                          )}
                     </div>
                </div>

                {!userProfile ? (
                     <div className="w-full h-32 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
                          <p className="text-slate-500 font-bold text-sm">Carregando Identidade...</p>
                     </div>
                ) : activeTab === 'mine' ? (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* WIDGET BATER PONTO */}
                        <div className="md:col-span-1 bg-white dark:bg-slate-900 border p-6 rounded-3xl shadow-sm text-center flex flex-col justify-center items-center space-y-4">
                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Relógio Eletrônico</h4>
                             <div className="text-4xl font-black text-slate-900 dark:text-white font-mono bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-2xl shadow-inner border border-slate-200">
                                  {currentTime.toLocaleTimeString('pt-BR')}
                             </div>
                             <p className="text-xs text-slate-500">{currentTime.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

                             <label className="flex items-center gap-2 cursor-pointer mt-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl text-blue-600 border border-blue-200 dark:border-blue-800">
                                  <input type="checkbox" checked={onlyOnePeriod} onChange={e => setOnlyOnePeriod(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                                  <span className="text-[10px] font-black uppercase">Trabalho apenas 1 período</span>
                             </label>

                             <div className="grid grid-cols-2 gap-3 w-full mt-2">
                                  <button onClick={() => handleClockIn('check_in')} disabled={loading || !!todayRecord.check_in} className={`${cardClass} flex-col ${todayRecord.check_in ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600' : ''}`}>
                                       {todayRecord.check_in ? <CheckCircle size={20} /> : <Clock size={20} />}
                                       <span className="text-[10px] font-bold text-slate-400">ENTRADA</span>
                                       <span className="text-xl font-black">{todayRecord.check_in || '--:--'}</span>
                                  </button>
                                  
                                  {!onlyOnePeriod ? (
                                       <>
                                            <button onClick={() => handleClockIn('break_out')} disabled={loading || !todayRecord.check_in || !!todayRecord.break_out} className={`${cardClass} flex-col ${todayRecord.break_out ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600' : ''}`}>
                                                 {todayRecord.break_out ? <CheckCircle size={20} /> : <Clock size={20} />}
                                                 <span className="text-[10px] font-bold text-slate-400 leading-tight">SAÍDA<br/>ALMOÇO</span>
                                                 <span className="text-xl font-black">{todayRecord.break_out || '--:--'}</span>
                                            </button>
                                            <button onClick={() => handleClockIn('break_in')} disabled={loading || !todayRecord.break_out || !!todayRecord.break_in} className={`${cardClass} flex-col ${todayRecord.break_in ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600' : ''}`}>
                                                 {todayRecord.break_in ? <CheckCircle size={20} /> : <Clock size={20} />}
                                                 <span className="text-[10px] font-bold text-slate-400 leading-tight">VOLTA<br/>ALMOÇO</span>
                                                 <span className="text-xl font-black">{todayRecord.break_in || '--:--'}</span>
                                            </button>
                                       </>
                                  ) : (
                                       <div className="col-span-2 hidden"></div>
                                  )}

                                  <button onClick={() => handleClockIn('check_out')} disabled={loading || (!onlyOnePeriod ? !todayRecord.break_in : !todayRecord.check_in) || !!todayRecord.check_out} className={`${cardClass} flex-col ${todayRecord.check_out ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600' : ''}`}>
                                       {todayRecord.check_out ? <CheckCircle size={20} /> : <Clock size={20} />}
                                       <span className="text-[10px] font-bold text-slate-400">SAÍDA</span>
                                       <span className="text-xl font-black">{todayRecord.check_out || '--:--'}</span>
                                  </button>
                             </div>
                        </div>

                        {/* TABELA MEUS PONTOS */}
                        <div className="md:col-span-2 bg-white dark:bg-slate-900 border p-6 rounded-3xl shadow-sm space-y-4">
                             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                 <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                     <Calendar size={18} className="text-blue-600"/> Histórico Recente (Seu Extrato)
                                 </h3>
                                 <button onClick={handleExportAndSign} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95">
                                     <FileSignature size={16} />
                                     Assinar via Gov.br
                                     <ExternalLink size={14} className="opacity-70 ml-1" />
                                 </button>
                             </div>
                             <div className="block w-full overflow-x-auto">
                                 <table className="w-full text-left font-sans text-xs min-w-[500px]">
                                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b">
                                           <tr><th className="px-4 py-2">Data</th><th>Entrada</th><th>S. Almoço</th><th>V. Almoço</th><th>Saída</th></tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                           {personalHistory.length === 0 ? (
                                                <tr><td colSpan={5} className="p-4 text-center text-slate-400 italic">Nenhum ponto registrado no histórico.</td></tr>
                                           ) : personalHistory.map(h => (
                                                <tr key={h.id} className="hover:bg-slate-50">
                                                     <td className="px-4 py-2 font-bold">{h.date ? h.date.split('-').reverse().join('/') : '-'}</td>
                                                     <td>{h.check_in || '-'}</td><td>{h.break_out || '-'}</td><td>{h.break_in || '-'}</td><td>{h.check_out || '-'}</td>
                                                </tr>
                                           ))}
                                      </tbody>
                                 </table>
                             </div>
                        </div>
                     </div>
                ) : (
                     /* ABA AUDITORIA EQUIPE */
                     <div className="bg-white dark:bg-slate-900 border p-6 rounded-3xl shadow-sm space-y-4">
                          <div className="flex justify-between items-center gap-4">
                               <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"><List size={18} className="text-blue-600"/> Registros da Equipe Independente</h3>
                               <div className="flex gap-2">
                                    <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="bg-slate-50 border rounded-xl px-3 py-1.5 text-xs font-bold" />
                                    <input type="text" placeholder="Nome Exato..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-slate-50 border rounded-xl px-3 py-1.5 text-xs font-bold" />
                               </div>
                          </div>
                          <div className="block w-full overflow-x-auto">
                              <table className="w-full text-left font-sans text-xs min-w-[700px]">
                                   <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b">
                                        <tr><th className="px-4 py-2">Funcionário / Usuário</th><th>Entrada</th><th>S. Almoço</th><th>V. Almoço</th><th>Saída</th><th>Mapa</th></tr>
                                   </thead>
                                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {teamHistory.filter(t => !searchQuery || t.profiles?.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                             <tr><td colSpan={6} className="p-4 text-center text-slate-400">Sem registros nesta data.</td></tr>
                                        ) : teamHistory.filter(t => !searchQuery || t.profiles?.name.toLowerCase().includes(searchQuery.toLowerCase())).map(t => (
                                             <tr key={t.id} className="hover:bg-slate-50">
                                                  <td className="px-4 py-2"><p className="font-bold">{t.profiles?.name || 'Incompleto'}</p><p className="text-[10px] text-slate-400">{t.profiles?.role}</p></td>
                                                  <td>{t.check_in || '-'}</td><td>{t.break_out || '-'}</td><td>{t.break_in || '-'}</td><td>{t.check_out || '-'}</td>
                                                  <td>{t.latitude ? <a href={`https://www.google.com/maps?q=${t.latitude},${t.longitude}`} target="_blank" className="text-emerald-600 flex items-center gap-1 hover:underline font-bold"><MapPin size={12}/> Mapa</a> : '-'}</td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                          </div>
                     </div>
                )}

                <AnimatePresence>
                     {showSuccessModal && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
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
        </div>
    );
}
