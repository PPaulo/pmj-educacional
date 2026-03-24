import React, { useState, useEffect } from 'react';
import { Search, Bell, HelpCircle, Sun, Moon, Menu, Heart, Calendar, Clock } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { Avatar } from './Avatar';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { setIsSidebarOpen } = useOutletContext<{ setIsSidebarOpen: (v: boolean) => void }>();
  
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const [profile, setProfile] = useState<{ name: string; role: string; schoolName?: string; avatarUrl?: string } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('name, role, avatar_url, school_info(name)')
          .eq('id', user.id)
          .single();
          
        if (data) {
          setProfile({
              name: data.name,
              role: data.role,
              schoolName: (data.school_info as any)?.name || '',
              avatarUrl: (data as any).avatar_url || undefined
          });
        } else {
          setProfile({
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
            role: 'Admin',
            schoolName: 'Todas as Escolas'
          });
        }
      }
    };
    loadProfile();
  }, []);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const role = profileData?.role || 'Secretaria';
        const schoolId = profileData?.school_id;

        let preNotifs: any[] = [];
        if (role === 'Admin' || role === 'Secretaria' || role === 'Diretor') {
             const { data: preRegs } = await supabase
               .from('pre_registrations')
               .select('*')
               .eq('status', 'Pendente')
               .order('created_at', { ascending: false })
               .limit(4);

             if (preRegs) {
                  preNotifs = preRegs.map((p: any) => ({
                       id: `pre-${p.id}`,
                       title: 'Nova Pré-Matrícula',
                       description: `${p.student_name} aguarda aprovação para ${p.class_interest}.`,
                       type: 'pending',
                       date: p.created_at,
                       link: '/pre-matriculas'
                  }));
             }
        }

        let eventQuery = supabase.from('events').select('*').order('date', { ascending: true }).limit(4);
        const filterId = role === 'Admin' ? profileData?.active_filter : schoolId;
        
        if (role !== 'Admin' && schoolId) {
             eventQuery = eventQuery.eq('school_id', schoolId);
        } else if (role === 'Admin' && filterId) {
             eventQuery = eventQuery.eq('school_id', filterId);
        }
        
        const { data: events } = await eventQuery;

        let eventNotifs: any[] = [];
        if (events) {
             eventNotifs = events.map((e: any) => ({
                  id: `event-${e.id}`,
                  title: e.title,
                  description: `${e.type} • ${e.time || 'Dia todo'}`,
                  type: 'event',
                  date: e.date,
                  link: '/dashboard'
             }));
        }

        const merged = [...preNotifs, ...eventNotifs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNotifications(merged);
        setUnreadCount(preNotifs.length);

      } catch (err) {
        console.error('Erro ao carregar notificações:', err);
      }
    };
    loadNotifications();
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-3 md:gap-4 flex-1">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <h2 className="text-lg font-bold text-slate-900 dark:text-white hidden sm:block mr-2 md:mr-4 truncate">{title}</h2>
        
        {/* Campo de pesquisa removido */}
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div className="relative">
             <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                  className="relative text-slate-500 hover:text-blue-600 transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Notificações"
             >
               <Bell size={20} />
               {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 border-2 border-white dark:border-slate-900 text-[10px] font-black text-white flex items-center justify-center">
                         {unreadCount}
                    </span>
               )}
             </button>

             {isNotificationsOpen && (
                  <>
                       <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setIsNotificationsOpen(false)}
                       />
                       <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                 <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notificações</h3>
                                 {unreadCount > 0 && <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-black">{unreadCount} Alertas</span>}
                            </div>
                            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/60">
                                 {notifications.length > 0 ? (
                                      notifications.map(n => (
                                           <a 
                                                key={n.id} 
                                                href={n.link} 
                                                onClick={() => setIsNotificationsOpen(false)}
                                                className="p-3 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                                           >
                                                <div className={`size-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                     n.type === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                     {n.type === 'pending' ? <Heart size={16} /> : <Calendar size={16} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                     <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{n.title}</p>
                                                     <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.description}</p>
                                                     <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                                                          <Clock size={10} /> {new Date(n.date).toLocaleDateString()}
                                                     </p>
                                                </div>
                                           </a>
                                      ))
                                 ) : (
                                      <div className="p-8 text-center text-slate-400 text-xs">
                                           Nenhuma notificação relevante.
                                      </div>
                                 )}
                            </div>
                            {notifications.length > 0 && (
                                 <div className="p-2 border-t border-slate-100 dark:border-slate-700 text-center">
                                      <a href="/dashboard" className="text-xs font-semibold text-blue-600 hover:underline">Ver Painel Geral</a>
                                 </div>
                            )}
                       </div>
                  </>
             )}
        </div>
        <button 
          onClick={() => setIsDark(!isDark)}
          className="text-slate-500 hover:text-blue-600 transition-colors"
          title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <a 
             href="/manual" 
             target="_blank" 
             className="text-slate-500 hover:text-blue-600 transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
             title="Manual do Usuário"
        >
          <HelpCircle size={20} />
        </a>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-base font-bold text-slate-900 dark:text-white capitalize leading-tight">{profile?.name || 'Carregando...'}</p>
            <div className="flex flex-col items-end gap-1 mt-0.5">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{profile?.role}</p>
                {profile?.schoolName ? (
                     <p className="text-[11px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-md font-black shadow-sm">{profile.schoolName}</p>
                ) : profile?.role === 'Admin' && <p className="text-[11px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md font-black shadow-sm">Todas as Escolas</p>}
            </div>
          </div>
          <Avatar 
            name={profile?.name || 'Administrador'} 
            src={profile?.avatarUrl}
            size="md" 
            className="border border-blue-600/20"
          />
        </div>
      </div>
    </header>
  );
}
