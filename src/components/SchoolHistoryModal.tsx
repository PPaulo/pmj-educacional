import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, GraduationCap, FileText, FileSignature, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { Student, SchoolHistory, SubjectRecord } from '../types';
import { supabase } from '../lib/supabase';
import { camelToSnake, snakeToCamel } from '../lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addReportFooter, addReportHeader } from '../lib/pdf';
import { formatYear } from '../lib/utils';

const SUBJECT_GROUPS = {
  'Ensino Fundamental': [
    'Português',
    'Matemática',
    'Ciências',
    'História',
    'Geografia',
    'Arte',
    'Educação Física',
    'Inglês',
    'Ensino Religioso'
  ],
  'Ensino Médio': [
    'Biologia',
    'Física',
    'Química',
    'Filosofia',
    'Sociologia',
    'Literatura',
    'Redação'
  ],
  'Outros': [
    'Espanhol',
    'Projeto de Vida',
    'Informática',
    'Robótica',
    'Empreendedorismo'
  ]
};

interface SchoolHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  issuerName?: string;
  school?: any;
}

export function SchoolHistoryModal({ isOpen, onClose, student, issuerName, school }: SchoolHistoryModalProps) {
  const [history, setHistory] = useState<SchoolHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SchoolHistory | null>(null);
  
  const [formData, setFormData] = useState<Omit<SchoolHistory, 'id' | 'studentId'>>({
    schoolName: '',
    academicYear: '',
    grade: '',
    result: 'Aprovado',
    attendance: '',
    workload: '',
    observations: '',
    subjects: []
  });

  const studentHistory = history.sort((a, b) => Number(b.academicYear) - Number(a.academicYear));

  useEffect(() => {
    if (isOpen && student) {
      loadHistory();
    } else {
      setHistory([]);
      setIsFormOpen(false);
      setEditingRecord(null);
    }
  }, [isOpen, student]);

  const loadHistory = async () => {
    if (!student?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('school_history')
        .select('*')
        .eq('student_id', student.id)
        .order('academic_year', { ascending: false });

      if (error) throw error;
      setHistory(snakeToCamel(data || []));
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      toast.error('Erro ao carregar histórico escolar.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (record?: SchoolHistory) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        schoolName: record.schoolName,
        academicYear: record.academicYear,
        grade: record.grade,
        result: record.result,
        attendance: record.attendance,
        workload: record.workload,
        observations: record.observations || '',
        subjects: record.subjects || []
      });
    } else {
      setEditingRecord(null);
      setFormData({
        schoolName: '',
        academicYear: new Date().getFullYear().toString(),
        grade: '',
        result: 'Aprovado',
        attendance: '',
        workload: '',
        observations: '',
        subjects: []
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [
        ...(prev.subjects || []),
        { id: Math.random().toString(36).substr(2, 9), name: '', grade: '', absences: '' }
      ]
    }));
  };

  const handleRemoveSubject = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects?.filter(sub => sub.id !== id) || []
    }));
  };

  const handleSubjectChange = (id: string, field: keyof SubjectRecord, value: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects?.map(sub => sub.id === id ? { ...sub, [field]: value } : sub) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    try {
      const payload = {
        student_id: student.id,
        school_name: formData.schoolName,
        academic_year: formData.academicYear,
        grade: formData.grade,
        result: formData.result,
        attendance: formData.attendance,
        workload: formData.workload,
        observations: formData.observations,
        subjects: formData.subjects
      };

      if (editingRecord) {
        const { error } = await supabase
          .from('school_history')
          .update(payload)
          .eq('id', editingRecord.id);
        
        if (error) throw error;
        toast.success('Registro atualizado!');
      } else {
        const { error } = await supabase
          .from('school_history')
          .insert(payload);
        
        if (error) throw error;
        toast.success('Novo registro adicionado!');
      }
      
      loadHistory();
      handleCloseForm();
    } catch (err) {
      console.error('Erro ao salvar histórico:', err);
      toast.error('Erro ao salvar registro.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        const { error } = await supabase
          .from('school_history')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        toast.success('Registro excluído!');
        loadHistory();
      } catch (err) {
        console.error('Erro ao excluir histórico:', err);
        toast.error('Erro ao excluir registro.');
      }
    }
  };

  const handleGeneratePDF = async (autoSign = false) => {
    if (!student) return;
    const doc = new jsPDF() as any;
    const pgWidth = doc.internal.pageSize.width;

    await addReportHeader(doc, school);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('HISTÓRICO ACADÊMICO', pgWidth / 2, 60, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`ALUNO(A): ${(student.name || '').toUpperCase()}`, 14, 72);
    doc.text(`Matrícula: ${student.registration || '---'} | Inep: ${student.inepId || '---'}`, 14, 77);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pgWidth - 14, 72, { align: 'right' });

    let currentY = 85;

    if (studentHistory.length === 0) {
      doc.text('Nenhum registro acadêmico encontrado.', 14, currentY);
    } else {
      // Sort history chronologically (oldest to newest)
      const sortedHistory = [...studentHistory].sort((a, b) => Number(a.academicYear) - Number(b.academicYear));

      // 1. Summary Table
      autoTable(doc, {
        startY: currentY,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        head: [['Ano/Série', 'Escola', 'C.H.', 'Freq.', 'Resultado']],
        body: sortedHistory.map(record => [
          `${formatYear(record.academicYear)} - ${record.grade}`,
          record.schoolName,
          record.workload,
          record.attendance,
          record.result
        ]),
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;

      // 2. Subjects Table (Years as columns)
      const allSubjects = new Set<string>();
      sortedHistory.forEach(record => {
        record.subjects?.forEach(sub => allSubjects.add(sub.name));
      });
      const uniqueSubjects = Array.from(allSubjects).sort();

      if (uniqueSubjects.length > 0) {
        const head = [['Disciplina', ...sortedHistory.map(h => `${formatYear(h.academicYear)}\n${h.grade}`)]];
        const body = uniqueSubjects.map(subjectName => {
          const row = [subjectName];
          sortedHistory.forEach(record => {
            const subjectRecord = record.subjects?.find(s => s.name.toLowerCase() === subjectName.toLowerCase());
            if (subjectRecord) {
              row.push(`N: ${subjectRecord.grade} | F: ${subjectRecord.absences}`);
            } else {
              row.push('-');
            }
          });
          return row;
        });

        autoTable(doc, {
          startY: currentY,
          theme: 'striped',
          headStyles: { fillColor: [100, 116, 139], halign: 'center' },
          columnStyles: { 0: { fontStyle: 'bold', halign: 'left' } },
          bodyStyles: { halign: 'center' },
          head: head,
          body: body,
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;
      }

      // 3. Condensed Observations
      const observations = sortedHistory
        .filter(h => h.observations && h.observations.trim() !== '')
        .map(h => `${formatYear(h.academicYear)} (${h.grade}): ${h.observations}`);

      if (observations.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(37, 99, 235);
        doc.text('Observações Gerais', 14, currentY);
        currentY += 6;

        doc.setFontSize(10);
        doc.setTextColor(60);
        observations.forEach(obs => {
          const splitObs = doc.splitTextToSize(obs, 180);
          doc.text(splitObs, 14, currentY);
          currentY += (splitObs.length * 5) + 2;
        });
      }
    }

    addReportFooter(doc, issuerName);
    window.open(doc.output('bloburl'), '_blank');
    
    if (autoSign) {
        toast.success('PDF Gerado. Redirecionando para Assinaturas Gov.br...');
        setTimeout(() => {
            window.open('https://assinador.iti.br/assinatura/index.xhtml', '_blank');
        }, 1500);
    } else {
        toast.success('Histórico gerado com sucesso!');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Histórico Escolar
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {student.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isFormOpen ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-2 bg-blue-600 rounded-full"></div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {editingRecord ? 'Editar Registro' : 'Novo Registro'}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Escola*</label>
                      <input
                        required
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                        placeholder="Nome da instituição de ensino"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ano Letivo*</label>
                      <input
                        required
                        type="number"
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                        placeholder="Ex: 2023"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Série/Ano*</label>
                      <input
                        required
                        name="grade"
                        value={formData.grade}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                        placeholder="Ex: 8º Ano"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resultado*</label>
                      <select
                        required
                        name="result"
                        value={formData.result}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                      >
                        <option value="Aprovado">Aprovado</option>
                        <option value="Reprovado">Reprovado</option>
                        <option value="Transferido">Transferido</option>
                        <option value="Cursando">Cursando</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Frequência (%)*</label>
                      <input
                        required
                        name="attendance"
                        value={formData.attendance}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                        placeholder="Ex: 95%"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Carga Horária*</label>
                      <input
                        required
                        name="workload"
                        value={formData.workload}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                        placeholder="Ex: 800h"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Observações</label>
                    <textarea
                      name="observations"
                      value={formData.observations}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white resize-none"
                      placeholder="Observações adicionais (opcional)"
                    />
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Disciplinas e Notas</label>
                      <button 
                        type="button" 
                        onClick={handleAddSubject} 
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold flex items-center gap-1"
                      >
                        <Plus size={14} /> Adicionar Disciplina
                      </button>
                    </div>
                    
                    {formData.subjects && formData.subjects.length > 0 ? (
                      <div className="space-y-2">
                        {formData.subjects.map((subject) => (
                          <div key={subject.id} className="flex gap-2 items-start">
                            <select 
                              value={subject.name} 
                              onChange={e => handleSubjectChange(subject.id, 'name', e.target.value)} 
                              className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white" 
                            >
                              <option value="">Selecione a disciplina...</option>
                              {Object.entries(SUBJECT_GROUPS).map(([group, subjects]) => (
                                <optgroup key={group} label={group}>
                                  {subjects.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                  ))}
                                </optgroup>
                              ))}
                              {subject.name && !Object.values(SUBJECT_GROUPS).flat().includes(subject.name) && (
                                <optgroup label="Personalizada">
                                  <option value={subject.name}>{subject.name}</option>
                                </optgroup>
                              )}
                            </select>
                            <input 
                              placeholder="Nota" 
                              value={subject.grade} 
                              onChange={e => handleSubjectChange(subject.id, 'grade', e.target.value)} 
                              className="w-20 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white" 
                            />
                            <input 
                              placeholder="Faltas" 
                              value={subject.absences} 
                              onChange={e => handleSubjectChange(subject.id, 'absences', e.target.value)} 
                              className="w-20 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white" 
                            />
                            <button 
                              type="button" 
                              onClick={() => handleRemoveSubject(subject.id)} 
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma disciplina adicionada.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                    >
                      Salvar Registro
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Registros Acadêmicos</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGeneratePDF(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg text-sm font-bold transition-colors"
                      >
                        <FileSignature size={16} />
                        Assinar (Gov.br)
                        <ExternalLink size={14} className="opacity-70" />
                      </button>
                      <button
                        onClick={() => handleGeneratePDF(false)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <FileText size={16} />
                        Gerar PDF
                      </button>
                      <button
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <Plus size={16} />
                        Adicionar
                      </button>
                    </div>
                  </div>

                  {studentHistory.length > 0 ? (
                    <div className="space-y-4">
                      {studentHistory.map((record) => (
                        <div key={record.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 group">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-bold text-slate-900 dark:text-white">{formatYear(record.academicYear)}</span>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">• {record.grade}</span>
                              </div>
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{record.schoolName}</p>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleOpenForm(record)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDelete(record.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Resultado</p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                record.result === 'Aprovado' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                record.result === 'Reprovado' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                record.result === 'Cursando' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                              }`}>
                                {record.result}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Frequência</p>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{record.attendance}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Carga Horária</p>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{record.workload}</p>
                            </div>
                          </div>
                          
                          {record.observations && (
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Observações</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300">{record.observations}</p>
                            </div>
                          )}

                          {record.subjects && record.subjects.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Disciplinas e Notas</p>
                              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <table className="w-full text-left text-sm">
                                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                      <th className="px-3 py-2 font-medium text-slate-500 dark:text-slate-400">Disciplina</th>
                                      <th className="px-3 py-2 font-medium text-slate-500 dark:text-slate-400">Nota</th>
                                      <th className="px-3 py-2 font-medium text-slate-500 dark:text-slate-400">Faltas</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {record.subjects.map(sub => (
                                      <tr key={sub.id}>
                                        <td className="px-3 py-2 text-slate-900 dark:text-white font-medium">{sub.name}</td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{sub.grade}</td>
                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{sub.absences}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <div className="size-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <GraduationCap className="text-slate-400" size={24} />
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Nenhum registro encontrado</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Este aluno ainda não possui histórico escolar cadastrado.</p>
                      <button
                        onClick={() => handleOpenForm()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        <Plus size={16} />
                        Adicionar Primeiro Registro
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
