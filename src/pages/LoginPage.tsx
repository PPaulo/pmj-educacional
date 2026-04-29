import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { School, Mail, Lock, Eye, EyeOff, LogIn, Hash, Calendar, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { cn, notifyWIP } from '../lib/utils';
import { supabase } from '../lib/supabase';

import { Logo } from '../components/Logo';
type LoginType = 'admin' | 'aluno';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginType, setLoginType] = useState<LoginType>('admin');
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type') as LoginType;
    if (type === 'admin' || type === 'aluno') {
      setLoginType(type);
    }
  }, [location.search]);

  const [showPassword, setShowPassword] = useState(false);
  
  // Admin credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Student Portal credentials
  const [registration, setRegistration] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const [loading, setLoading] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (loginType === 'admin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        if (data.user) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
          if (profile?.role === 'Jovem Aprendiz') {
            navigate('/dashboard');
            return;
          }
        }
        
        navigate('/dashboard');
      } else {
        // Aluno Portal Verification via Secure RPC
        const { data, error } = await supabase
          .rpc('verify_student_login', { 
            reg_input: registration.trim(), 
            bday_input: birthDate 
          });

        if (error || !data || data.length === 0) {
          throw new Error('Matrícula ou Data de Nascimento incorretos, ou aluno não cadastrado.');
        }

        const student = data[0];

        const greeting = student.gender === 'Feminino' ? 'Bem-vinda' : 'Bem-vindo';
        toast.success(`${greeting}, ${student.name}!`);
        sessionStorage.setItem('student_session', JSON.stringify(student));
        navigate('/aluno-portal');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          
          <div className="p-8 pb-4 flex flex-col items-center text-center">
            <Logo className="size-24 mb-4" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              PMJ - Educacional
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Gestão Escolar Inteligente
            </p>
          </div>

          {!location.search.includes('type=') && (
               <div className="flex border-b border-slate-100 dark:border-slate-800 px-8">
                    <button 
                      type="button" 
                      onClick={() => setLoginType('admin')} 
                      className={`flex-1 py-2 text-center text-xs font-black tracking-wider uppercase border-b-2 transition-all ${loginType === 'admin' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
                    >
                        Administrativo
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setLoginType('aluno')} 
                      className={`flex-1 py-2 text-center text-xs font-black tracking-wider uppercase border-b-2 transition-all ${loginType === 'aluno' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
                    >
                        Portal do Aluno
                    </button>
               </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <AnimatePresence mode="wait">
              {loginType === 'admin' ? (
                 <motion.div key="admin" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                     <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500">E-MAIL</label>
                       <div className="relative">
                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" placeholder="seu@email.com" type="email" required />
                       </div>
                     </div>
                     <div className="space-y-1">
                       <div className="flex justify-between">
                         <label className="text-xs font-bold text-slate-500">SENHA</label>
                          <button type="button" onClick={() => toast.error('A recuperação de senha deve ser solicitada formalmente ao Administrador da sua Unidade Escolar.', { duration: 5000 })} className="text-xs text-blue-600 hover:underline">Esqueceu?</button>
                       </div>
                       <div className="relative">
                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-12 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" placeholder="••••••••" type={showPassword ? "text" : "password"} required />
                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                       </div>
                     </div>
                 </motion.div>
              ) : (
                <motion.div key="aluno" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500">Nº DE MATRÍCULA</label>
                       <div className="relative">
                         <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input value={registration} onChange={e => setRegistration(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Ex: 20240001" type="text" required />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500">DATA DE NASCIMENTO</label>
                       <div className="relative">
                         <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" type="date" required />
                       </div>
                    </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button disabled={loading} className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2" type="submit">
              <span>{loading ? 'Processando...' : 'Acessar Painel'}</span>
              {!loading && <LogIn size={18} />}
            </button>
          </form>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t text-center text-xs text-slate-500">
            {loginType === 'admin' ? (
                 <span>Dúvidas? <a href="mailto:admin@pmj.gov.br" className="font-bold text-blue-600">Suporte Central</a></span>
             ) : (
                <span>Não consegue logar? <a href="mailto:secretaria@pmj.gov.br" className="font-bold text-blue-600">Suporte ao Aluno</a></span>
             )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
