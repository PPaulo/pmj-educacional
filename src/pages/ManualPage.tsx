import React, { useEffect } from 'react';
import { BookOpen, Printer, AlertCircle, Info, CheckCircle2, ArrowLeft, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function ManualPage() {
  
  // Set explicit document title for better PDF naming
  useEffect(() => {
    document.title = "Manual do Usuário - Sistema Escolar";
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 print:p-0 print:bg-white print:dark:bg-white flex justify-center">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-12 shadow-xl print:shadow-none print:border-none print:p-0 print:rounded-none">
        
        {/* Barra de Retorno - Oculta na Impressão */}
        <div className="flex items-center justify-between mb-8 print:hidden">
             <NavLink to="/dashboard" className="inline-flex items-center gap-2 p-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition font-bold text-sm">
                  <ArrowLeft size={16}/> Voltar ao Sistema
             </NavLink>
             <button 
                  onClick={() => window.print()} 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20 transition"
             >
                  <Printer size={18} /> Salvar PDF / Imprimir
             </button>
        </div>

        {/* Header do Manual */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800 print:pb-4 print:mb-6">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl print:hidden">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Manual do Usuário Escolar</h1>
            <p className="text-sm md:text-base text-slate-500 font-medium mt-1">Guia completo para Gestores, Secretários e Professores.</p>
          </div>
        </div>

        {/* Alerta Inicial - Oculto na Impressão para economizar espaço se desejar, mas vamos manter */}
        <div className="mb-10 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl flex gap-3 text-sm text-blue-800 dark:text-blue-300">
          <Info className="shrink-0 text-blue-500" size={20} />
          <p>
            <strong>Bem-vindo(a) ao seu novo sistema de gestão!</strong> Este manual foi desenhado para familiarizar você desde o seu primeiro acesso até as funcionalidades mais avançadas.
          </p>
        </div>

        {/* Índice Interativo (TOC) */}
        <div className="mb-12 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Índice Navegável</h3>
          <ul className="space-y-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
            <li><a href="#section-1" className="hover:underline flex items-center gap-1"><ChevronRight size={14}/> 1. Primeiros Passos e Visão Geral</a></li>
            <li><a href="#section-2" className="hover:underline flex items-center gap-1"><ChevronRight size={14}/> 2. Gestão de Alunos (Módulo Secretaria)</a></li>
            <li><a href="#section-3" className="hover:underline flex items-center gap-1"><ChevronRight size={14}/> 3. Central de Pré-Matrículas Online</a></li>
            <li><a href="#section-4" className="hover:underline flex items-center gap-1"><ChevronRight size={14}/> 4. Diário de Classe (Módulo Professor)</a></li>
            <li><a href="#section-5" className="hover:underline flex items-center gap-1"><ChevronRight size={14}/> 5. Recursos Humanos e Configurações</a></li>
            <li><a href="#section-tips" className="hover:underline flex items-center gap-1"><ChevronRight size={14}/> Boas práticas e Dicas de Uso</a></li>
          </ul>
        </div>

        {/* Conteúdo */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 space-y-12">
          
          {/* SEC 1: PRIMEIROS PASSOS */}
          <section id="section-1" className="scroll-mt-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="flex items-center justify-center size-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-black text-lg">1</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white m-0">Primeiros Passos e Visão Geral</h2>
            </div>
            <p>
              O sistema é acessado direto do seu navegador e foi todo desenhado para ser intuitivo. Assim que você entra, encontra o <strong>Painel Principal (Dashboard)</strong> centralizando o que importa.
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>Barra Lateral Esquerda:</strong> Onde ficam todos os módulos do sistema. Eles podem variar dependendo do seu cargo (Professor, Secretaria ou Diretor/Admin).</li>
              <li><strong>Barra Superior:</strong> Contém pesquisa, notificações em tempo real no ícone de "Sino" (para ficar de olho nas matrículas pendentes) e o botão para ativar o Modo Noturno (Escuro).</li>
              <li><strong>Estatísticas Rápidas:</strong> O painel te dá um resumo imediato de quantos alunos estão ativos, como anda a frequência e próximos eventos.</li>
            </ul>
          </section>

          {/* SEC 2: GESTÃO DE ALUNOS */}
          <section id="section-2" className="scroll-mt-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="flex items-center justify-center size-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-black text-lg">2</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white m-0">Gestão de Alunos (Módulo Secretaria)</h2>
            </div>
            <p>O módulo de alunos é o coração da Secretaria. Nele você controla documentos, matrículas em turmas e vida da criança/adolescente na escola.</p>
            
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">Cadastrando um Novo Aluno</h4>
            <ul className="list-decimal pl-5 mt-2 space-y-2">
              <li>No menu lateral, clique em <strong>"Alunos"</strong>.</li>
              <li>No canto superior direito, clique no botão azul <strong>"+ Adicionar Aluno"</strong>.</li>
              <li>Siga as etapas do formulário preenchendo com cuidado: <em>Dados Pessoais &bull; Filiação &bull; Documentos &bull; Endereço</em>.</li>
              <li><strong>Atenção ao CPF:</strong> O sistema evita CPFs duplicados. Se houver falha ao salvar, confira se o aluno já não foi matriculado.</li>
            </ul>

            <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">Matriculando e Emitindo Fichas</h4>
            <p>Após adicionar o aluno na base, localize-o na lista e clique sobre ele para abrir o seu Perfil Completo.</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Para colocar em uma sala, vá na aba <strong>Matrícula (Lápis)</strong> e defina o turno, a série e a escola em que vai estudar.</li>
              <li>Para emitir relatórios fisicamente, utilize o botão <strong>"Imprimir"</strong> dentro do perfil do aluno para gerar a Ficha de Matrícula padronizada, que já sairá pronta para assinatura do responsável.</li>
            </ul>
          </section>

          {/* SEC 3: PORTAL DE VAGAS */}
          <section id="section-3" className="scroll-mt-6 break-before-page">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="flex items-center justify-center size-8 rounded-lg bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 font-black text-lg">3</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white m-0">Central de Pré-Matrículas Online</h2>
            </div>
            <p>Para escolas que usam o portal público de vagas, as solicitações feitas pelos pais na internet chegam direto para o módulo de "Pré-Matrículas".</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Ao acessar o painel, o sino de notificação avisará sobre novas requisições <strong>Pendentes</strong>.</li>
              <li>Abra a aba "Pré-Matrículas", verifique o candidato e a série de interesse.</li>
              <li>Ao definir o status para <span className="text-green-600 font-bold bg-green-50 px-1 rounded">Aprovado</span>, o sistema gerará uma notificação automática pronta para envio rápido no <strong>WhatsApp</strong> ao número do responsável cadastrado, orientando os próximos passos e documentos necessários.</li>
            </ul>
          </section>

          {/* SEC 4: DIÁRIO DE CLASSE */}
          <section id="section-4" className="scroll-mt-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="flex items-center justify-center size-8 rounded-lg bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 font-black text-lg">4</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white m-0">Diário de Classe (Professor/Coordenação)</h2>
            </div>
            <p>Lançar diários de papel agora é coisa do passado. A lógica no sistema é simples e intuitiva:</p>
            
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">Chamada (Frequência)</h4>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Acesse a aba <strong>"Coordenação"</strong> ou <strong>"Professor"</strong>.</li>
              <li>Abra a turma desejada e vá para a aba de Frequência.</li>
              <li>Todos os alunos da pauta já vêm marcados como <em>"Presente"</em> por padrão. Apenas altere para "Ausente" ou "Justificado" os que não compareceram e salve. O Gráfico no painel principal reage na mesma hora.</li>
            </ul>

            <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">Lançamento de Notas</h4>
            <p>Na aba Notas dentro de cada turma, selecione o Bimestre vigente e lance as avaliações por disciplina. Notas menores que a média escolar serão automaticamente destacadas em vermelho para fácil visualização pelo conselho de classe escolar.</p>
          </section>

          {/* SEC 5: CONFIG E RH */}
          <section id="section-5" className="scroll-mt-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="flex items-center justify-center size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 font-black text-lg">5</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white m-0">Recursos Humanos e Ajustes (Avançado)</h2>
            </div>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong>RH:</strong> Aqui ficam o controle de dados de todos os professores, serviços gerais, secretários, entre outros. Use para cadastrar quem vai ganhar acesso ao sistema ou quem precisa ser desligado do quadro de efetivos.</li>
              <li><strong>Configurações:</strong> Módulo exclusivo para Administradores, que permite formatar os dados e endereços base da Instituição, mudar o logo da prefeitura/escola e criar os logins protegidos para acesso ao sistema.</li>
            </ul>
          </section>

          {/* DICAS RÁPIDAS */}
          <section id="section-tips" className="scroll-mt-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 p-6 rounded-2xl break-inside-avoid">
            <h2 className="text-lg font-black text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-4 mt-0">
              <CheckCircle2 size={24} /> Boas práticas e Dicas de Uso
            </h2>
            <ul className="space-y-3 text-amber-800 dark:text-amber-400/90 text-sm m-0 pl-1 leading-relaxed">
              <li className="flex gap-2 items-start"><div className="mt-1.5 w-2 h-2 rounded-full bg-amber-500 shrink-0"></div> <span><b>Atenção à Segurança:</b> Ao terminar de trabalhar em computadores compartilhados da escola, sempre use o menu lateral inferior "Sair" para evitar a exposição do banco de dados de alunos.</span></li>
              <li className="flex gap-2 items-start"><div className="mt-1.5 w-2 h-2 rounded-full bg-amber-500 shrink-0"></div> <span><b>Evite perder dados:</b> O sistema salva automaticamente com a internet ativa; caso veja alertas vermelhos de erro nas notificações de falha de conexão, verifique sua rede Wi-Fi antes de tentar reenviar os formulários.</span></li>
              <li className="flex gap-2 items-start"><div className="mt-1.5 w-2 h-2 rounded-full bg-amber-500 shrink-0"></div> <span><b>Para uma visão mais limpa:</b> Clique no botão de "Meia-lua" lá no topo da tela e aproveite a <i>Interface Escura (Dark Mode)</i> durante os plantões noturnos, ajudando a evitar a fadiga ocular em computadores.</span></li>
            </ul>
          </section>

          <footer className="pt-8 mt-12 border-t border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500 pb-12">
            <p className="text-xs font-semibold leading-relaxed">
              Este manual foi gerado digitalmente pelo sistema. <br/>A página inclui sumário interativo navegável (links compatíveis com exportação para PDF). <br/> 
              <i>© PMJ Educacional. Todos os direitos reservados.</i>
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
}
