import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Save,
  Sparkles,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'Atividade',
    description: '',
    time: ''
  });

  const [userRole, setUserRole] = useState('Secretaria');
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('role, school_id').eq('id', user.id).single();
      const activeYear = localStorage.getItem('pmj_ano_letivo') || new Date().getFullYear().toString();
      
      let query = supabase.from('events').select('*');
      
      if (profile) {
          setUserRole(profile.role);
          setUserSchoolId(profile.school_id);
          
          if (profile.role !== 'Admin' && profile.school_id) {
              query = query.eq('school_id', profile.school_id);
          }
      }

      const { data } = await query;
      // Note: If events don't have a year column yet, we could filter by date prefix.
      // But for now let's just ensure we only show events whose date starts with the current year if we want strictly year-based.
      // However, most calendars show all events.
      // Let's filter by year if the column exists or by date string.
      setEvents(data?.filter(e => e.date.startsWith(activeYear)) || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este evento?")) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      toast.success('Evento excluído com sucesso!');
      loadEvents();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir evento.');
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const calendarDays = [];
  // Slots vazios antes do primeiro dia
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push({ type: 'empty', day: 0 });
  }
  // Dias do mês
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ type: 'day', day: d });
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const eventData = {
          ...formData,
          school_id: userSchoolId
      };

      const { error } = await supabase.from('events').insert(eventData);
      if (error) throw error;
      toast.success('Evento criado com sucesso!');
      setIsModalOpen(false);
      setFormData({ title: '', date: '', type: 'Atividade', description: '', time: '' });
      loadEvents();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar evento.');
    } finally {
      setLoading(false);
    }
  };

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  return (
    <>
      <Header title="Calendário Acadêmico" />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col lg:flex-row gap-8 h-full">
          {/* Calendar View */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Calendário Escolar.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <button onClick={handlePrevMonth} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:text-white">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setCurrentDate(new Date())} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 text-sm font-bold px-4 dark:text-white">Hoje</button>
                  <button onClick={handleNextMonth} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:text-white">
                    <ChevronRight size={18} />
                  </button>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                  <Plus size={16} />
                  Novo Evento
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col flex-1">
              <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                {daysOfWeek.map(day => (
                  <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 flex-1">
                {calendarDays.map((item, i) => {
                  if (item.type === 'empty') {
                    return <div key={`empty-${i}`} className="min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10" />
                  }

                  const dateTarget = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(item.day).padStart(2,'0')}`;
                  const dayEvents = events.filter(e => e.date === dateTarget);

                  return (
                    <div key={`day-${item.day}`} className="min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-slate-800 relative cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{item.day}</span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.map((e, idx) => (
                          <div key={idx} className={cn(
                            "px-1.5 py-0.5 text-[9px] font-bold rounded border-l-2 truncate group/evt relative flex items-center justify-between gap-1",
                            e.type === 'Prova' && "bg-orange-100 text-orange-700 border-orange-500 dark:bg-orange-900/40 dark:text-orange-300",
                            e.type === 'Feriado' && "bg-red-100 text-red-700 border-red-500 dark:bg-red-900/40 dark:text-red-300",
                            e.type === 'Reunião' && "bg-purple-100 text-purple-700 border-purple-500 dark:bg-purple-900/40 dark:text-purple-300",
                            e.type === 'Atividade' && "bg-blue-100 text-blue-700 border-blue-500 dark:bg-blue-900/40 dark:text-blue-300"
                          )}>
                            <span className="truncate flex-1">{e.title}</span>
                            <button 
                              onClick={(evt) => { evt.stopPropagation(); handleDeleteEvent(e.id); }}
                              className="opacity-0 group-hover/evt:opacity-100 transition-opacity text-red-500 hover:text-red-700 shrink-0"
                              title="Excluir"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Legenda de Cores</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/30"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">Provas</p>
                    <p className="text-xs text-slate-400">Avaliações bimestrais e simulados</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-red-500 shadow-lg shadow-red-500/30"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">Feriados</p>
                    <p className="text-xs text-slate-400">Recessos e feriados municipais/nacionais</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/30"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">Reuniões Pedagógicas</p>
                    <p className="text-xs text-slate-400">Conselho de classe e reuniões docentes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-blue-600 shadow-lg shadow-blue-600/30"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">Atividades Extras</p>
                    <p className="text-xs text-slate-400">Passeios e eventos comemorativos</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Próximos Eventos</h3>
              </div>
              <div className="space-y-6">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className={`relative pl-6 border-l-2 group ${
                        event.type === 'Prova' ? 'border-orange-500/30' :
                        event.type === 'Reunião' ? 'border-purple-500/30' :
                        event.type === 'Feriado' ? 'border-red-500/30' : 'border-blue-500/30'
                      }`}>
                      <div className={`absolute -left-1.5 top-0 size-3 rounded-full ${
                          event.type === 'Prova' ? 'bg-orange-500' :
                          event.type === 'Reunião' ? 'bg-purple-500' :
                          event.type === 'Feriado' ? 'bg-red-500' : 'bg-blue-600'
                        }`}></div>
                      
                      <div className="flex items-start justify-between">
                        <div>
                          <p className={`text-xs font-bold uppercase mb-1 ${
                              event.type === 'Prova' ? 'text-orange-600' :
                              event.type === 'Reunião' ? 'text-purple-600' :
                              event.type === 'Feriado' ? 'text-red-600' : 'text-blue-600'
                            }`}>
                            {new Date(event.date).toLocaleDateString('pt-BR')} 
                            {event.time && `, ${event.time}`}
                          </p>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{event.title}</h4>
                          {event.description && <p className="text-xs text-slate-500 mt-1">{event.description}</p>}
                        </div>

                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-md transition-all text-slate-400 hover:text-red-600"
                          title="Excluir Evento"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Nenhum evento agendado.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal CREATE EVENT */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Criar Novo Evento</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500">Título do Evento</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm" placeholder="Ex: Prova de Matemática" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500">Data</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500">Tipo</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                      <option value="Atividade">Atividade</option>
                      <option value="Prova">Prova</option>
                      <option value="Reunião">Reunião</option>
                      <option value="Feriado">Feriado</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">Hora (Opcional)</label>
                    <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500">Descrição (Opcional)</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm h-20" placeholder="Anotações sobre o evento..." />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm">Cancelar</button>
                  <button disabled={loading} type="submit" className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">
                    <Save size={16} />
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
