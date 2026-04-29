import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Megaphone, 
  Settings, 
  LogOut,
  School,
  Calendar as CalendarIcon,
  X,
  AlertTriangle,
  ChevronDown,
  FileCheck,
  Soup,
  MessageCircle,
  Building2,
  Clock,
  FileText,
  Smartphone
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { supabase } from '../lib/supabase';

// 1. Definição dos itens de navegação agrupados por departamentos
const navSections: any[] = [
  {
    title: 'Monitoramento',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['Admin', 'Diretor', 'Secretaria', 'Coordenador'] },
      { icon: Megaphone, label: 'Comunicados', path: '/comunicados', roles: ['Admin', 'Diretor', 'Secretaria', 'Professor', 'Coordenador'] },
    ]
  },
  {
    title: 'Pedagógico',
    items: [
      { icon: GraduationCap, label: 'Portal Professor', path: '/professor', roles: ['Professor'] },
      { icon: FileCheck, label: 'Coordenação', path: '/coordenacao', roles: ['Admin', 'Diretor', 'Coordenador'] },
      { icon: BookOpen, label: 'Turmas', path: '/escola', roles: ['Admin', 'Diretor', 'Secretaria', 'Coordenador'] },
      { icon: AlertTriangle, label: 'Ocorrências', path: '/ocorrencias', roles: ['Admin', 'Diretor', 'Secretaria', 'Professor', 'Coordenador'] },
    ]
  },
  {
    title: 'Secretaria',
    items: [
      { 
        icon: Users, 
        label: 'Alunos', 
        roles: ['Admin', 'Diretor', 'Secretaria'],
        children: [
          { label: 'Ativos', path: '/alunos' },
          { label: 'Pré-Matrículas', path: '/pre-matriculas' },
          { label: 'Arquivado', path: '/arquivos' },
          { label: 'Importação IA', path: '/importacao-atas' },
        ]
      },
      { icon: FileText, label: 'Relatórios', path: '/relatorios', roles: ['Admin', 'Diretor', 'Secretaria', 'Coordenador'] },
    ]
  },
  {
    title: 'Gestão',
    items: [
      { icon: Soup, label: 'Merenda', path: '/merenda', roles: ['Admin', 'Diretor', 'Nutricionista', 'Secretaria'] },
      { icon: School, label: 'Unidade', path: '/escola-info', roles: ['Admin', 'Diretor', 'Secretaria'] },
      { icon: CalendarIcon, label: 'Calendário', path: '/calendario', roles: ['Admin', 'Diretor', 'Secretaria', 'Professor', 'Coordenador', 'Nutricionista', 'Aluno'] },
    ]
  },
  {
    title: 'RH e Canais',
    items: [
      { icon: Building2, label: 'RH', path: '/rh', roles: ['Admin', 'Diretor', 'Secretaria'] },
      { icon: MessageCircle, label: 'Família', path: '/familia', roles: ['Admin', 'Diretor', 'Secretaria', 'Professor', 'Coordenador'] },
      { icon: Smartphone, label: 'Portal Aluno', path: '/aluno-portal', roles: ['Aluno'] },
    ]
  }
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function SubMenu({ item, setIsSidebarOpen }: { item: any, setIsSidebarOpen: (v: boolean) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="space-y-0.5">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold group cursor-pointer",
          isOpen ? "text-white bg-white/10" : "text-blue-100/70 hover:bg-white/5 hover:text-white"
        )}
      >
        <item.icon size={18} className={cn("transition-colors", isOpen ? "text-blue-300" : "text-blue-200/50 group-hover:text-white")} />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown size={14} className={cn("ml-auto transition-transform duration-300 text-blue-200/40 group-hover:text-blue-200", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-0.5 ml-4 pl-4 border-l border-white/10"
          >
            {item.children.map((child: any) => (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs font-bold",
                  isActive 
                    ? "text-blue-300 bg-white/5" 
                    : "text-blue-200/40 hover:text-blue-100 hover:bg-white/5"
                )}
              >
                <span>{child.label}</span>
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>('Secretaria');

  useEffect(() => {
    const imp = sessionStorage.getItem('impersonated_user');
    if (imp) {
         try {
             const { role } = JSON.parse(imp);
             setUserRole(role);
             return;
         } catch(e) {}
    }

    const studentSession = sessionStorage.getItem('student_session');
    if (studentSession) {
       setUserRole('Aluno');
       return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
         supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => {
             if (data?.role) setUserRole(data.role);
         });
      }
    });
  }, []);

  const getRoleType = (role: string) => {
    if (!role) return '';
    const r = role.toLowerCase();
    if (r.includes('admin')) return 'Admin';
    if (r.includes('direto')) return 'Diretor';
    if (r.includes('secreta')) return 'Secretaria';
    if (r.includes('professo') || r.includes('classe') || r.includes('monitor')) return 'Professor';
    if (r.includes('coordena') || r.includes('orienta')) return 'Coordenador';
    if (r.includes('merenda') || r.includes('nutri')) return 'Nutricionista';
    if (r.includes('aprendiz')) return 'Jovem Aprendiz';
    if (r.includes('aluno')) return 'Aluno';
    return role;
  };

  const effectiveRole = getRoleType(userRole);

  const filterItems = (items: any[]) => {
    return items.filter(item => {
        const itemRoles = item.roles?.map((r: string) => r.toLowerCase()) || [];
        const normalizedUserRole = userRole.toLowerCase();
        const normalizedEffectiveRole = effectiveRole.toLowerCase();

        if (normalizedUserRole === 'admin' || normalizedUserRole === 'administrador') return true;

        if (normalizedUserRole === 'jovem aprendiz') {
          return item.label.includes('Arquivado') || item.label.includes('Dashboard');
        }

        return !item.roles || 
               itemRoles.includes(normalizedEffectiveRole) || 
               itemRoles.includes(normalizedUserRole) ||
               item.roles.includes(effectiveRole) ||
               item.roles.includes(userRole);
    });
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-[#1e3a8a] border-r border-white/5 flex flex-col h-screen transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 font-sans shadow-xl",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Header com Logo */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="size-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-all">
             <School className="text-white" size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-base font-black leading-tight tracking-tight uppercase">PMJ <span className="text-blue-300 block text-[8px] tracking-[0.25em] font-medium">Educacional</span></h1>
          </div>
        </div>
        
        <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl text-blue-200 hover:bg-white/10 lg:hidden transition-all">
          <X size={18} />
        </button>
      </div>

      {/* Seletor de Ano Simplificado */}
      <div className="px-6 pb-6">
        <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
          <div className="flex items-center justify-between gap-2">
            <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-blue-200/50">Exercício</label>
            <select 
              className="bg-transparent border-none text-xs font-bold text-white outline-none cursor-pointer text-right appearance-none hover:text-blue-300 transition-colors"
              value={localStorage.getItem('pmj_ano_letivo') || new Date().getFullYear().toString()}
              onChange={(e) => {
                localStorage.setItem('pmj_ano_letivo', e.target.value);
                window.location.href = '/';
              }}
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year} className="bg-blue-900">{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto pb-8 scrollbar-hide">
        {navSections.map((section, idx) => {
            const visibleItems = filterItems(section.items);
            if (visibleItems.length === 0) return null;

            return (
                <div key={idx} className="space-y-1">
                    <h3 className="px-4 text-[8px] font-bold uppercase tracking-[0.3em] text-blue-200/40 mb-2">{section.title}</h3>
                    <div className="space-y-0.5">
                        {visibleItems.map((item: any) => (
                            item.children ? (
                                <SubMenu key={item.label} item={item} setIsSidebarOpen={setIsOpen} />
                            ) : (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) => cn(
                                        "group flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-sm font-semibold relative",
                                        isActive 
                                            ? "bg-white/10 text-white shadow-lg shadow-black/5" 
                                            : "text-blue-100/70 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon size={18} className={cn(
                                                "transition-colors",
                                                isActive ? "text-blue-300" : "text-blue-200/50 group-hover:text-white"
                                            )} />
                                            <span className="flex-1 truncate">{item.label}</span>
                                            {isActive && <div className="size-1 rounded-full bg-blue-300 shadow-[0_0_8px_rgba(147,197,253,0.6)]" />}
                                        </>
                                    )}
                                </NavLink>
                            )
                        ))}
                    </div>
                </div>
            );
        })}
      </nav>

      {/* Rodapé Slim */}
      <div className="p-4 mt-auto border-t border-white/5">
        <div className="space-y-0.5">
          {userRole !== 'Aluno' && (
              <NavLink
                to="/configuracoes"
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-xs font-semibold",
                  isActive 
                    ? "bg-white/10 text-white" 
                    : "text-blue-200/50 hover:bg-white/5 hover:text-white"
                )}
              >
                <Settings size={16} />
                <span>Configurações</span>
              </NavLink>
          )}
          <button 
            onClick={async () => {
                sessionStorage.removeItem('student_session');
                sessionStorage.removeItem('impersonated_user');
                await supabase.auth.signOut();
                navigate('/');
            }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-rose-300/60 hover:bg-rose-500/10 hover:text-rose-300 transition-all text-xs font-semibold"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
