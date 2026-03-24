import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, LogIn, GraduationCap, School } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 flex flex-col items-center justify-center p-4">
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-1/4 -left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
           <div className="absolute top-1/3 -right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="text-center mb-12 relative z-10"
      >
           <div className="flex justify-center mb-4">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                     <School size={40} className="text-white" />
                </div>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight mb-2">Portal de Ensino</h1>
           <p className="text-blue-100/80 text-sm max-w-sm">Seja bem-vindo ao sistema de gestão escolar e central de vagas municipal.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full relative z-10">
           
           {/* Card: Pré-Matrícula (Destaque) */}
           <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex"
           >
                <NavLink to="/vagas" className="group flex-1 bg-white/10 backdrop-blur-xl border border-white/20 hover:border-rose-500/40 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:transform hover:-translate-y-1 flex flex-col justify-between">
                     <div>
                          <div className="size-12 bg-rose-500 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
                               <Heart size={24} className="animate-pulse" />
                          </div>
                          <h3 className="text-xl font-black text-white mb-2">Solicitar Vaga</h3>
                          <p className="text-blue-100/70 text-xs leading-relaxed">Faça a pré-matrícula de novos alunos na rede municipal de forma rápida.</p>
                     </div>
                     <div className="mt-6 flex items-center text-rose-400 font-bold text-xs gap-1 group-hover:underline">
                          Iniciar Cadastro <span>&rarr;</span>
                     </div>
                </NavLink>
           </motion.div>

           {/* Card: Portal do Aluno */}
           <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex"
           >
                <NavLink to="/login?type=aluno" className="group flex-1 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-emerald-500/40 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:transform hover:-translate-y-1 flex flex-col justify-between">
                     <div>
                          <div className="size-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-600/30 group-hover:scale-110 transition-transform">
                               <GraduationCap size={24} />
                          </div>
                          <h3 className="text-xl font-black text-white mb-2">Portal do Aluno</h3>
                          <p className="text-slate-400 text-xs leading-relaxed">Acesse notas, frequências, comunicados e sua rotina de estudos em tempo real.</p>
                     </div>
                     <div className="mt-6 flex items-center text-emerald-400 font-bold text-xs gap-1 group-hover:underline">
                          Acessar Espaço <span>&rarr;</span>
                     </div>
                </NavLink>
           </motion.div>

           {/* Card: Painel Administrativo */}
           <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex"
           >
                <NavLink to="/login?type=admin" className="group flex-1 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/40 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:transform hover:-translate-y-1 flex flex-col justify-between">
                     <div>
                          <div className="size-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform">
                               <LogIn size={24} />
                          </div>
                          <h3 className="text-xl font-black text-white mb-2">Administrativo</h3>
                          <p className="text-slate-400 text-xs leading-relaxed">Área para Professores, Direção e Secretaria de Ensino gerenciarem a rede.</p>
                     </div>
                     <div className="mt-6 flex items-center text-blue-400 font-bold text-xs gap-1 group-hover:underline">
                          Entrar no Painel <span>&rarr;</span>
                     </div>
                </NavLink>
           </motion.div>

      </div>

      <div className="mt-12 text-center text-[10px] text-white/40 z-10">
           &copy; {new Date().getFullYear()} - Sistema Integrado de Educação Municipal.
      </div>

    </div>
  );
}
