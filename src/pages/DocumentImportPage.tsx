import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Upload, Key, FileText, CheckCircle2, AlertCircle, Play, Database } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { camelToSnake } from '../lib/utils';
import { AcademicClass } from '../types';

interface ExtractedStudent {
  name: string;
  status: 'Aprovado' | 'Reprovado' | 'Transferido' | 'Abandono';
  grades: { [subject: string]: number };
  absences: number;
}

const subjects = ['Português', 'Matemática', 'História', 'Geografia', 'Ciências', 'Artes', 'Educação Física'];

export function DocumentImportPage() {
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedStudent[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Setup, 2: Review, 3: Success

  const activeYear = localStorage.getItem('pmj_ano_letivo') || new Date().getFullYear().toString();

  useEffect(() => {
    const fetchClasses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('school_id, role').eq('id', user.id).single();
      
      let query = supabase.from('classes').select('*').eq('year', activeYear);
      if (profile && profile.role !== 'Admin' && profile.school_id) {
        query = query.eq('school_id', profile.school_id);
      }
      
      const { data } = await query;
      setClasses(data as any || []);
    };
    fetchClasses();
  }, [activeYear]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, envie uma imagem (JPG, PNG).');
        return;
      }
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!selectedClass) return toast.error('Selecione uma turma.');
    if (!file) return toast.error('Anexe a imagem da ata.');

    setLoading(true);
    const toastId = toast.loading('Analisando documento com Inteligência Artificial...');
    
    try {
      const base64Image = previewUrl.split(',')[1];
      
      const { data, error } = await supabase.functions.invoke('process-ata', {
        body: { image: base64Image }
      });

      if (error) throw error;
      
      // The function already returns the parsed JSON or a valid JSON string
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (!Array.isArray(parsedData)) throw new Error('Formato inválido retornado pela IA');
      
      setExtractedData(parsedData);
      setStep(2);
      toast.success('Documento processado com sucesso!', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao processar: ${err.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const saveToDatabase = async () => {
    setLoading(true);
    const toastId = toast.loading('Salvando dados no sistema...');
    
    try {
      const cls = classes.find(c => c.id === selectedClass);
      if (!cls) throw new Error('Turma inválida');
      
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user?.id).single();
      const schoolId = profile?.school_id || null;

      // Pegar sequencial de matrícula
      const { data: stds } = await supabase.from('students').select('registration, cod_aluno');
      let baseReg = parseInt(`${activeYear}0000`);
      if (stds && stds.length > 0) {
        const regs = stds.map(s => parseInt(s.registration)).filter(n => !isNaN(n) && String(n).startsWith(activeYear));
        if (regs.length > 0) baseReg = Math.max(...regs);
      }

      for (let i = 0; i < extractedData.length; i++) {
        const std = extractedData[i];
        baseReg++;
        
        // 1. Inserir Aluno
        const { data: insertedStudent, error: stdError } = await supabase.from('students').insert({
          name: std.name,
          status: std.status === 'Aprovado' || std.status === 'Reprovado' ? 'Ativo' : std.status,
          class: cls.name,
          ano_letivo: activeYear,
          school_id: schoolId,
          registration: baseReg.toString(),
          cod_aluno: `${activeYear}${String(baseReg % 10000).padStart(4, '0')}`,
          exercicio: '',
          turno: cls.shift
        }).select().single();

        if (stdError) throw stdError;

        // 2. Inserir Notas (Média Final no 4º Bimestre)
        const gradesInserts = [];
        for (const sub of subjects) {
          if (std.grades && typeof std.grades[sub] === 'number') {
            gradesInserts.push({
              student_id: insertedStudent.id,
              class_id: cls.id,
              subject: sub,
              period: '4º Bimestre', // Simula como a média final para esse import
              grade: std.grades[sub],
              absences: i === 0 ? std.absences : 0 // Faltas totais atribuídas à primeira matéria
            });
          }
        }
        
        if (gradesInserts.length > 0) {
          await supabase.from('grades').insert(gradesInserts);
        }
      }

      setStep(3);
      toast.success('Todos os dados foram salvos com sucesso!', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao salvar: ${err.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Importador de Atas com IA" />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
        <Breadcrumbs />
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Database className="text-indigo-600" size={32} />
            Importação Inteligente
          </h1>
          <p className="text-slate-500 mt-2">Digitalize atas físicas e cadastre alunos e notas automaticamente com Inteligência Artificial.</p>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Indicador de Passos */}
            <div className="flex items-center justify-between mb-8 relative">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full"></div>
              <div className="absolute left-0 top-1/2 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
              
              {[1, 2, 3].map(num => (
                <div key={num} className={`size-10 rounded-full flex items-center justify-center font-bold border-4 border-slate-50 dark:border-slate-900/50 ${step >= num ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                  {num === 3 && step === 3 ? <CheckCircle2 size={20} /> : num}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="text-indigo-600" size={20} />
                    1. Informações da Importação
                  </h3>
                  
                  <div>
                    <label className="text-sm font-semibold text-slate-500 block mb-1">Ano Letivo Alvo</label>
                    <input disabled value={activeYear} className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-slate-500 cursor-not-allowed font-bold" />
                    <p className="text-xs text-slate-400 mt-1">Altere no menu lateral esquerdo se necessário.</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-500 block mb-1">Selecione a Turma*</label>
                    <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl">
                      <option value="">Selecione uma turma existente...</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.shift})</option>)}
                    </select>
                  </div>

                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                    <Upload className="text-indigo-600" size={20} />
                    2. Enviar Ata Escaneada
                  </h3>
                  
                  <div className="relative border-2 border-dashed border-indigo-200 dark:border-indigo-900/30 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition group overflow-hidden">
                    {previewUrl ? (
                      <div className="absolute inset-0 p-2">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg opacity-40 group-hover:opacity-20 transition" />
                      </div>
                    ) : (
                      <Upload className="text-indigo-300 dark:text-indigo-700 mb-4" size={48} />
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="relative z-20">
                      <p className="font-bold text-indigo-900 dark:text-indigo-400 mb-1">
                        {file ? file.name : 'Clique ou arraste a imagem aqui'}
                      </p>
                      <p className="text-sm text-slate-500">Formato aceito: JPG, PNG (Boa resolução)</p>
                    </div>
                  </div>

                  <button 
                    disabled={loading || !file || !selectedClass} 
                    onClick={processImage}
                    className="w-full mt-6 bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                  >
                    {loading ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Play size={18} fill="currentColor" />}
                    Processar Documento
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">Revisão de Dados ({extractedData.length} Alunos)</h3>
                    <p className="text-sm text-slate-500">Revise os dados extraídos pela IA antes de salvar no sistema.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">Cancelar</button>
                    <button onClick={saveToDatabase} disabled={loading} className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 shadow-lg shadow-green-600/20">
                      {loading ? 'Salvando...' : 'Confirmar e Salvar no Sistema'}
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto p-4">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <th className="p-3 font-bold rounded-l-lg">Nome do Aluno</th>
                        <th className="p-3 font-bold">Situação Final</th>
                        <th className="p-3 font-bold text-center">Faltas</th>
                        {subjects.map(s => <th key={s} className="p-3 font-bold text-center">{s.substring(0, 3)}.</th>)}
                        <th className="rounded-r-lg"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {extractedData.map((std, i) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="p-2">
                            <input value={std.name} onChange={e => {
                              const newD = [...extractedData]; newD[i].name = e.target.value; setExtractedData(newD);
                            }} className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded px-2 py-1 outline-none" />
                          </td>
                          <td className="p-2">
                            <select value={std.status} onChange={e => {
                              const newD = [...extractedData]; newD[i].status = e.target.value as any; setExtractedData(newD);
                            }} className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded px-2 py-1 outline-none">
                              <option value="Aprovado">Aprovado</option>
                              <option value="Reprovado">Reprovado</option>
                              <option value="Transferido">Transferido</option>
                              <option value="Abandono">Abandono</option>
                            </select>
                          </td>
                          <td className="p-2 text-center">
                            <input type="number" value={std.absences} onChange={e => {
                              const newD = [...extractedData]; newD[i].absences = Number(e.target.value); setExtractedData(newD);
                            }} className="w-16 bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded px-2 py-1 outline-none text-center" />
                          </td>
                          {subjects.map(sub => (
                            <td key={sub} className="p-2 text-center">
                              <input type="number" step="0.1" placeholder="-" value={std.grades?.[sub] ?? ''} onChange={e => {
                                const newD = [...extractedData]; 
                                if (!newD[i].grades) newD[i].grades = {};
                                newD[i].grades[sub] = e.target.value === '' ? null as any : Number(e.target.value); 
                                setExtractedData(newD);
                              }} className="w-14 bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded px-2 py-1 outline-none text-center" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
                <div className="size-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Importação Concluída!</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">Todos os {extractedData.length} alunos e suas notas finais foram matriculados na turma e registrados no sistema com sucesso.</p>
                <div className="flex gap-4">
                  <button onClick={() => window.location.href = '/alunos'} className="px-6 py-3 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl">Ir para Alunos</button>
                  <button onClick={() => { setStep(1); setExtractedData([]); setFile(null); setPreviewUrl(''); }} className="px-6 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/20">Importar Nova Ata</button>
                </div>
              </div>
            )}
          </div>
      </div>
    </>
  );
}
