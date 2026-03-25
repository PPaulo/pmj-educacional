import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNames: Record<string, string> = {
  dashboard: 'Painel',
  alunos: 'Alunos',
  'pre-matriculas': 'Pré-Matrículas',
  arquivos: 'Arquivo Passivo',
  escola: 'Turmas',
  'escola-info': 'Dados da Unidade',
  rh: 'Recursos Humanos',
  merenda: 'Gestão de Merenda',
  relatorios: 'Relatórios e BI',
  calendario: 'Calendário',
  professor: 'Portal do Professor',
  coordenacao: 'Coordenação',
  ocorrencias: 'Ocorrências',
  comunicados: 'Mural de Avisos',
  familia: 'Portal da Família',
  'comunicacao-rh': 'Canais de RH',
  configuracoes: 'Configurações',
  ponto: 'Registro de Ponto',
  'aluno-portal': 'Portal do Aluno',
  novo: 'Novo Cadastro',
  editar: 'Editar'
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0 || pathnames[0] === 'dashboard') return null;

  return (
    <nav className="flex items-center gap-2 text-xs font-bold mb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <Link 
        to="/dashboard" 
        className="text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
      >
        <Home size={14} />
        Painel
      </Link>
      
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const name = routeNames[value] || value.charAt(0).toUpperCase() + value.slice(1);

        // Skip IDs in breadcrumbs
        if (value.length > 20) return null;

        return (
          <React.Fragment key={to}>
            <ChevronRight size={14} className="text-slate-300 dark:text-slate-700" />
            {last ? (
              <span className="text-slate-800 dark:text-slate-200 font-extrabold">{name}</span>
            ) : (
              <Link to={to} className="text-slate-400 hover:text-blue-600 transition-colors">
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
