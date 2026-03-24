import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, ClipboardList } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface GradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName?: string;
  classId?: string;
  className?: string;
  type: 'individual' | 'class';
}

const subjects = ['Português', 'Matemática', 'História', 'Geografia', 'Ciências', 'Artes', 'Educação Física'];
const periods = ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'];

export function GradesModal({ isOpen, onClose, studentId, studentName, classId, className, type }: GradesModalProps) {
  const [period, setPeriod] = useState('1º Bimestre');
  const [subject, setSubject] = useState(subjects[0]);

  // States for lists
  const [studentList, setStudentList] = useState<any[]>([]); // For class view
  const [gradesData, setGradesData] = useState<any>({}); // Format: { [id_or_subject]: { grade: '', absences: '' } }

  const [loading, setLoading] = useState(false);

  // 1. CARREGAR DADOS
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setLoading(true);
      try {
        if (type === 'individual' && studentId) {
          // Busca notas do Aluno específico no Bimestre selecionado
          const { data } = await supabase
            .from('grades')
            .select('*')
            .eq('student_id', studentId)
            .eq('period', period);

          const mapped: any = {};
          data?.forEach(g => {
            mapped[g.subject] = { grade: g.grade, absences: g.absences, id: g.id };
          });
          setGradesData(mapped);

        } else if (type === 'class' && classId) {
          // Busca Alunos da Turma
          const { data: students } = await supabase
            .from('students')
            .select('id, name')
            .eq('class', className); // Nota: o filtro usa o "Nome" da turma nas suas tabelas anteriores

          setStudentList(students || []);

          // Busca Notas já lançadas dessa turma nessa Matéria e Bimestre
          const { data: grades } = await supabase
            .from('grades')
            .select('*')
            .eq('class_id', classId)
            .eq('subject', subject)
            .eq('period', period);

          const mapped: any = {};
          grades?.forEach(g => {
            mapped[g.student_id] = { grade: g.grade, absences: g.absences, id: g.id };
          });
          setGradesData(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, period, subject, studentId, classId, className, type]);

  // 2. SALVAR DADOS
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const inserts = [];

      if (type === 'individual' && studentId) {
        // Individual: Roda as Matérias
        for (const sub of subjects) {
          const item = gradesData[sub] || {};
          if (item.grade !== undefined || item.absences !== undefined) {
            const row: any = {
              student_id: studentId,
              subject: sub,
              grade: item.grade ? parseFloat(item.grade) : null,
              absences: item.absences ? parseInt(item.absences) : 0,
              period: period
            };
            
            if (item.id) row.id = item.id;
            if (classId) row.class_id = classId;

            inserts.push(row);
          }
        }
      } else if (type === 'class' && classId) {
        // Turma: Roda os Alunos
        for (const std of studentList) {
          const item = gradesData[std.id] || {};
          const row: any = {
            student_id: std.id,
            class_id: classId,
            subject: subject,
            grade: item.grade ? parseFloat(item.grade) : null,
            absences: item.absences ? parseInt(item.absences) : 0,
            period: period
          };

          if (item.id) row.id = item.id;

          if (item.grade !== undefined || item.absences !== undefined) {
            inserts.push(row);
          }
        }
      }

      if (inserts.length === 0) {
        toast.error('Nenhuma alteração para salvar.');
        setLoading(false);
        return;
      }

      // Salva no Supabase (Upsert)
      const { error } = await supabase.from('grades').upsert(inserts);
      if (error) throw error;

      toast.success('Lançamentos salvos com sucesso!');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar no Supabase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ClipboardList className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Lançamento de Notas / Faltas</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><X size={20} /></button>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Bimestre</label>
                <select value={period} onChange={e => setPeriod(e.target.value)} className="w-full mt-1 px-3 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                  {periods.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {type === 'class' && (
                <div>
                  <label className="text-xs font-bold text-slate-500">Disciplina / Matéria</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full mt-1 px-3 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
            </div>

            {type === 'individual' ? (
              <p className="text-sm text-slate-600 mb-2">Aluno: <b className="text-slate-900 dark:text-white">{studentName}</b></p>
            ) : (
              <p className="text-sm text-slate-600 mb-2">Turma: <b className="text-slate-900 dark:text-white">{className}</b></p>
            )}

            <form onSubmit={handleSave}>
              <div className="max-h-80 overflow-y-auto mb-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-4 py-3">{type === 'individual' ? 'Disciplina' : 'Aluno'}</th>
                      <th className="px-4 py-3 w-24">Nota</th>
                      <th className="px-4 py-3 w-24">Faltas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {type === 'individual' ? (
                      subjects.map(sub => (
                        <tr key={sub} className="border-b border-slate-200 dark:border-slate-800/40">
                          <td className="px-4 py-2 font-medium">{sub}</td>
                          <td className="px-4 py-2">
                            <input type="number" step="0.1" min="0" max="100" placeholder="0.0" value={gradesData[sub]?.grade || ''} onChange={e => setGradesData({...gradesData, [sub]: { ...gradesData[sub], grade: e.target.value }})} className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800" />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" min="0" placeholder="0" value={gradesData[sub]?.absences || ''} onChange={e => setGradesData({...gradesData, [sub]: { ...gradesData[sub], absences: e.target.value }})} className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      studentList.map(std => (
                        <tr key={std.id} className="border-b border-slate-200 dark:border-slate-800/40">
                          <td className="px-4 py-2 font-medium">{std.name}</td>
                          <td className="px-4 py-2">
                            <input type="number" step="0.1" min="0" max="100" placeholder="0.0" value={gradesData[std.id]?.grade || ''} onChange={e => setGradesData({...gradesData, [std.id]: { ...gradesData[std.id], grade: e.target.value }})} className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800" />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" min="0" placeholder="0" value={gradesData[std.id]?.absences || ''} onChange={e => setGradesData({...gradesData, [std.id]: { ...gradesData[std.id], absences: e.target.value }})} className="w-full px-2 py-1 border rounded bg-slate-50 dark:bg-slate-800" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm">Cancelar</button>
                <button disabled={loading} type="submit" className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20">
                  <Save size={16} />
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
