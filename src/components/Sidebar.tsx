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
  Building2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { supabase } from '../lib/supabase';

import { Logo } from './Logo';
// 1. Defina quais cargos podem ver cada item (Vazio = Público para Administradores/Secretaria)
const navItems: any[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['Admin', 'Diretor', 'Secretaria'] },
  { icon: GraduationCap, label: 'Painel Professor', path: '/professor', roles: ['Professor'] },
  { icon: FileCheck, label: 'Coordenação', path: '/coordenacao', roles: ['Admin', 'Diretor'] },
  { icon: Soup, label: 'Merenda', path: '/merenda', roles: ['Admin', 'Diretor', 'Nutricionista'] },
  { icon: AlertTriangle, label: 'Ocorrências', path: '/ocorrencias', roles: ['Admin', 'Diretor', 'Secretaria', 'Professor'] },
  { icon: Users, label: 'Portal do Aluno', path: '/aluno-portal', roles: ['Aluno'] },
  { icon: MessageCircle, label: 'Portal da Família', path: '/familia', roles: ['Admin', 'Diretor', 'Secretaria', 'Professor'] },
  { icon: Building2, label: 'Comunicação RH', path: '/comunicacao-rh', roles: ['Admin', 'Diretor', 'Secretaria'] },
  { icon: FolderOpen, label: 'Documentos Arquivados', path: '/arquivos', roles: ['Secretaria'] },
  { 
    icon: FolderPlus, 
    label: 'Cadastros', 
    roles: ['Admin', 'Diretor', 'Secretaria'],
    children: [
      { label: 'Dados da Escola', path: '/escola-info' },
      { label: 'Alunos', path: '/alunos' },
      { label: 'Funcionários (RH)', path: '/rh' },
      { label: 'Gestão de Turmas', path: '/escola' },
      { label: 'Pré-Matrículas', path: '/pre-matriculas' },
    ]
  },
  { icon: CalendarIcon, label: 'Calendário', path: '/calendario' },
  { icon: BookOpen, label: 'Relatórios', path: '/relatorios', roles: ['Admin', 'Diretor', 'Secretaria'] },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function SubMenu({ item, setIsSidebarOpen }: { item: any, setIsSidebarOpen: (v: boolean) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
      >
        <item.icon size={18} />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown size={16} className={cn("ml-auto transition-transform duration-200 text-slate-400", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-7 space-y-1 mt-1"
          >
            {item.children.map((child: any) => (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold",
                  isActive 
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <div className="w-1 size-1 rounded-full bg-slate-400" />
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
    // 1. Simulação do Admin
    const imp = localStorage.getItem('impersonated_user');
    if (imp) {
         try {
             const { role } = JSON.parse(imp);
             setUserRole(role);
             return;
         } catch(e) {}
    }

    // 2. Verificar se é um login de Aluno
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

  // 2. Filtre os itens de navegação baseados no Cargo e ordene alfabeticamente
  const visibleItems = navItems
    .filter(item => !item.roles || item.roles.includes(userRole));

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="size-12 shrink-0" />
          <div className="flex flex-col">
            <h1 className="text-slate-900 dark:text-white text-sm font-bold leading-none">PMJ - Educacional</h1>
            {userRole && <p className="text-blue-500 font-bold text-[10px] mt-0.5">{userRole}</p>}
          </div>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => (
          item.children ? (
            <div key={item.label}>
              <SubMenu item={item} setIsSidebarOpen={setIsOpen} />
            </div>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          )
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        {userRole !== 'Aluno' && (
            <NavLink
              to="/configuracoes"
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium mb-1",
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Settings size={18} />
              <span>Configurações</span>
            </NavLink>
        )}
        <button 
          onClick={async () => {
              localStorage.removeItem('student_session');
              await supabase.auth.signOut();
              navigate('/');
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
