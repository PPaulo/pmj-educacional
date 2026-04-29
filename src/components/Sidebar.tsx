import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Wallet, 
  Megaphone, 
  Settings, 
  LogOut,
  School,
  Calendar as CalendarIcon,
  X,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  FolderPlus,
  FolderOpen,
  FileCheck,
  Soup,
  MessageCircle,
  Building2,
  Clock,
  Briefcase,
  FileText,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { supabase } from '../lib/supabase';
import { Logo } from './Logo';

// 1. Definição dos itens de navegação agrupados por departamentos (Padrão de Mercado SGE)
const navSections: any[] = [
  {
    title: 'Monitoramento',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard Inteligente', path: '/dashboard', roles: ['Admin', 'Diretor', 'Secretaria', 'Coordenador'] },
      { icon: Megaphone, label: 'Mural de Comunicados', path: '/comunicados', roles: ['Admin', 'Diretor', 'Secretaria', 'Professor', 'Coordenador'] },
    ]
  },
  {
    title: 'Gestão Pedagógica',
    items: [
      { icon: GraduationCap, label: 'Portal do Professor', path: '/professor', roles: ['Professor'] },
      { icon: FileCheck, label: 'Centro de Coordenação', path: '/coordenacao', roles: ['Admin', 'Diretor', 'Coordenador'] },
      { icon: BookOpen, label: 'Turmas', path: '/escola', roles: ['Admin', 'Diretor', 'Secretaria', 'Coordenador'] }, // Nova entrada direta
      { icon: AlertTriangle, label: 'Ocorrências', path: '/ocorrencias', roles: ['Admin', 'Diretor', 'Secretaria', 'Professor', 'Coordenador'] },
    ]
  },
  {
    title: 'Secretaria e Alunos',
    items: [
      { 
        icon: Users, 
        label: 'Gestão de Alunos', 
        roles: ['Admin', 'Diretor', 'Secretaria'],
        children: [
          { label: 'Matrículas Ativas', path: '/alunos' },
          { label: 'Pré-Matrículas Online', path: '/pre-matriculas' },
          { label: 'Arquivo Passivo', path: '/arquivos' },
          { label: 'Importação de Atas (IA)', path: '/importacao-atas' },
        ]
      },
      { icon: FileText, label: 'Relatórios e BI', path: '/relatorios', roles: ['Admin', 'Diretor', 'Secretaria', 'Coordenador'] },
    ]
  },
  {
    title: 'Recursos e Unidade',
    items: [
      { icon: Soup, label: 'Gestão de Merenda', path: '/merenda', roles: ['Admin', 'Diretor', 'Nutricionista', 'Secretaria'] },
      { icon: School, label: 'Dados da Unidade', path: '/escola-info', roles: ['Admin', 'Diretor', 'Secretaria'] },
      { icon: CalendarIcon, label: 'Calendário Escolar', path: '/calendario', roles: ['Admin', 'Diretor', 'Secretaria', 'Professor', 'Coordenador', 'Nutricionista', 'Aluno'] },
    ]
  },
  {
    title: 'Administrativo e RH',
    items: [
      { icon: Building2, label: 'Recursos Humanos', path: '/rh', roles: ['Admin', 'Diretor', 'Secretaria'] },
      { icon: Clock, label: 'Registro de Ponto', path: '/ponto', roles: ['Admin', 'Diretor', 'Secretaria', 'Professor', 'Coordenador', 'Nutricionista'] },
      { icon: Megaphone, label: 'Canais de Comunicação', path: '/comunicacao-rh', roles: ['Admin', 'Diretor', 'Secretaria', 'Professor', 'Coordenador', 'Nutricionista'] },
    ]
  },
  {
    title: 'Portais Externos',
    items: [
      { icon: Smartphone, label: 'Portal do Aluno', path: '/aluno-portal', roles: ['Aluno'] },
      { icon: MessageCircle, label: 'Portal da Família', path: '/familia', roles: ['Admin', 'Diretor', 'Secretaria', 'Professor', 'Coordenador'] },
    ]
  }
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function SubMenu({ item, setIsSidebarOpen }: { item: any, setIsSidebarOpen: (v: boolean) => void, key?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold text-blue-100 hover:bg-white/10 hover:text-white group cursor-pointer"
      >
        <item.icon size={18} className="text-blue-300 group-hover:text-white" />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown size={16} className={cn("ml-auto transition-transform duration-200 text-blue-300 group-hover:text-white", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-7 space-y-1 mt-1 border-l-2 border-white/10 ml-5"
          >
            {item.children.map((child: any) => (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-xs font-bold",
                  isActive 
                    ? "text-white bg-white/20" 
                    : "text-blue-200 hover:bg-white/10 hover:text-white"
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
    const imp = localStorage.getItem('impersonated_user');
    if (imp) {
         try {
             const { role } = JSON.parse(imp);
             setUserRole(role);
             return;
         } catch(e) {}
    }

    const studentSession = localStorage.getItem('student_session');
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

        // Admin e Administrador têm acesso total a todos os módulos
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
      "fixed inset-y-0 left-0 z-50 w-72 bg-[#1E3A8A] border-r border-white/10 flex flex-col h-screen transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 font-sans shadow-2xl",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 pb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
             <School className="text-white" size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-base font-black leading-none tracking-tight uppercase">PMJ <span className="text-blue-300 block text-[10px] tracking-widest mt-1">Educacional</span></h1>
          </div>
        </div>
        
        <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg text-blue-200 hover:bg-white/10 lg:hidden transition-all">
          <X size={20} />
        </button>
      </div>

      <div className="px-6 pb-6">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/50 mb-1.5 block">Ano Letivo de Trabalho</label>
        <select 
          className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
          value={localStorage.getItem('pmj_ano_letivo') || new Date().getFullYear().toString()}
          onChange={(e) => {
            localStorage.setItem('pmj_ano_letivo', e.target.value);
            window.location.reload();
          }}
        >
          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
            <option key={year} value={year} className="text-slate-900">{year}</option>
          ))}
        </select>
      </div>

      <nav className="flex-1 px-4 space-y-8 overflow-y-auto pb-8 scrollbar-hide">
        {navSections.map((section, idx) => {
            const visibleItems = filterItems(section.items);
            if (visibleItems.length === 0) return null;

            return (
                <div key={idx} className="space-y-2">
                    <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/50 mb-3">{section.title}</h3>
                    <div className="space-y-1">
                        {visibleItems.map((item: any) => (
                            item.children ? (
                                <SubMenu key={item.label} item={item} setIsSidebarOpen={setIsOpen} />
                            ) : (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) => cn(
                                        "group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold",
                                        isActive 
                                            ? "bg-white/10 text-white shadow-lg shadow-black/5" 
                                            : "text-blue-100 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon size={18} className={cn(
                                                "transition-colors",
                                                isActive ? "text-blue-300" : "text-blue-200/70 group-hover:text-white"
                                            )} />
                                            <span>{item.label}</span>
                                            {isActive && <div className="ml-auto size-1.5 rounded-full bg-blue-300" />}
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

      <div className="p-4 border-t border-white/5 space-y-1">
        {userRole !== 'Aluno' && (
            <NavLink
              to="/configuracoes"
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              )}
            >
              <Settings size={18} />
              <span>Configurações</span>
            </NavLink>
        )}
        <button 
          onClick={async () => {
              localStorage.removeItem('student_session');
              localStorage.removeItem('impersonated_user');
              await supabase.auth.signOut();
              navigate('/');
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-all text-sm font-semibold"
        >
          <LogOut size={18} />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
}
