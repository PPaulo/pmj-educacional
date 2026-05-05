import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { 
  Search, 
  Folder, 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  User, 
  Plus, 
  FolderOpen,
  X,
  Eye,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { snakeToCamel } from '../lib/utils';
import { SchoolHistoryModal } from '../components/SchoolHistoryModal';

export function ArchivePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Storage states
  const [files, setFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [customFileName, setCustomFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<{ url: string, name: string, type: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  // Manual creation state
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', birthDate: '', motherName: '', fatherName: '' });

  // School History state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  const [userName, setUserName] = useState('');









  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadFiles();
    } else {
      setFiles([]);
    }
  }, [selectedStudent]);

  const loadStudents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('school_id, role').eq('id', user.id).single();
      let query = supabase
        .from('students')
        .select('id, name, birth_date, mother_name, father_name, registration')
        .neq('status', 'Ativo')
        .order('name');
      
      if (profile && profile.role !== 'Admin' && profile.school_id) {
        query = query.eq('school_id', profile.school_id);
        
        const { data: schoolData } = await supabase.from('schools').select('*').eq('id', profile.school_id).single();
        setSchoolInfo(schoolData);
      }

      setUserName(profile?.name || user.email?.split('@')[0] || 'Usuário');
      
      const { data, error } = await query;
      if (!error) setStudents(snakeToCamel(data || []));
    } catch (err) {
      console.error(err);
    }
  };

  const loadFiles = async () => {
    if (!selectedStudent) return;
    setLoadingFiles(true);
    try {
      const { data, error } = await supabase.storage
        .from('student-documents')
        .list(selectedStudent.id);

      if (error) {
         if (error.message.includes("not found")) {
            toast.error("Crie o bucket 'student-documents' no seu painel Supabase!", { duration: 5000 });
         }
         throw error;
      }
      setFiles(data || []);
    } catch (err) {
      console.error(err);
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const { data, error } = await supabase
          .from('students')
          .insert({
              name: newStudent.name,
              birth_date: newStudent.birthDate ? newStudent.birthDate : null,
              mother_name: newStudent.motherName,
              father_name: newStudent.fatherName,
              status: 'Arquivado',
              registration: 'ARQ' + Date.now().toString().slice(-4)
          })
          .select()
          .single();

        if (error) throw error;
        toast.success('Aluno gravado!');
        setStudents(prev => [snakeToCamel(data), ...prev]);
        setSelectedStudent(snakeToCamel(data));
        setNewStudent({ name: '', birthDate: '', motherName: '', fatherName: '' });
        setIsAddStudentModalOpen(false);
    } catch (err: any) {
        console.error(err);
        toast.error('Erro ao cadastrar aluno.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setCustomFileName(file.name.split('.')[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedFile) return;

    setUploading(true);
    try {
      const extension = selectedFile.name.split('.').pop() || 'jpg';
      const finalName = customFileName.trim().replace(/\s+/g, '_') + '.' + extension;
      const path = `${selectedStudent.id}/${finalName}`;

      const { error } = await supabase.storage
        .from('student-documents')
        .upload(path, selectedFile, { upsert: true });

      if (error) throw error;

      toast.success('Arquivo arquivado com sucesso!');
      setSelectedFile(null);
      setCustomFileName('');
      loadFiles();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro no upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (name: string) => {
      try {
          const { error } = await supabase.storage
            .from('student-documents')
            .remove([`${selectedStudent.id}/${name}`]);
          if (error) throw error;
          toast.success('Arquivo removido!');
          loadFiles();
      } catch (err) {
          console.error(err);
          toast.error('Erro ao excluir arquivo.');
      }
  };

  const handleDownloadFile = async (name: string) => {
      try {
          const { data, error } = await supabase.storage
            .from('student-documents')
            .download(`${selectedStudent.id}/${name}`);
          if (error) throw error;

          const url = URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          a.download = name;
          document.body.appendChild(a);
          a.click();
          a.remove();
      } catch (err) {
          console.error(err);
          toast.error('Erro ao baixar arquivo.');
      }
  };

  const handlePreviewFile = async (name: string) => {
      try {
          const { data, error } = await supabase.storage
            .from('student-documents')
            .download(`${selectedStudent.id}/${name}`);
          if (error) throw error;

          const url = URL.createObjectURL(data);
          setPreviewFile({ url, name, type: data.type || 'application/octet-stream' });
      } catch (err) {
          console.error(err);
          toast.error('Erro ao processar visualização do arquivo.');
      }
  };

  const handleOpenDelete = (id: string) => {
       setStudentToDelete(id);
       setIsDeleteModalOpen(true);
  };

  const handleDeleteStudent = async () => {
      if (!studentToDelete) return;

      try {
          const id = studentToDelete;
          // 1. Delete all files in storage for this student
          const { data: filesToDelete, error: listError } = await supabase.storage
            .from('student-documents')
            .list(id);
          
          if (!listError && filesToDelete && filesToDelete.length > 0) {
              const filePaths = filesToDelete.map(f => `${id}/${f.name}`);
              await supabase.storage.from('student-documents').remove(filePaths);
          }

          // 2. Delete from database
          const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id);

          if (error) throw error;

          toast.success('Cadastro excluído!');
          setStudents(prev => prev.filter(s => s.id !== id));
          if (selectedStudent?.id === id) setSelectedStudent(null);
      } catch (err) {
          console.error(err);
          toast.error('Erro ao excluir cadastro do aluno.');
      } finally {
          setIsDeleteModalOpen(false);
          setStudentToDelete(null);
      }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.registration && s.registration.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <Header title="Prontuário de Alunos" />
      <div className="flex-1 p-4 md:p-8 overflow-hidden flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Documentos Arquivados</h1>
          <p className="text-slate-500 text-sm">Organize, envie e gerencie a documentação oficial dos estudantes de forma digital.</p>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
          {/* PAINEL ESQUERDO: LISTA DE ALUNOS */}
          <div className="w-full md:w-1/3 flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por aluno..." 
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <button onClick={() => setIsAddStudentModalOpen(true)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm" title="Cadastrar Aluno para Arquivo">
                <Plus size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredStudents.map(std => (
                <div
                  key={std.id}
                  onClick={() => setSelectedStudent(std)}
                  className={`w-full text-left p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group ${selectedStudent?.id === std.id ? 'bg-blue-50/70 dark:bg-blue-900/20 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
                >
                  <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <User size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{std.name}</p>
                    <p className="text-xs text-slate-400">Matrícula: {std.registration || '---'}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); handleOpenDelete(std.id); }} 
                    className="p-1 px-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg md:opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Excluir Aluno"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {filteredStudents.length === 0 && (
                <p className="p-4 text-center text-slate-400 text-sm">Nenhum aluno encontrado.</p>
              )}
            </div>
          </div>

          {/* PAINEL DIREITO: DOCUMENTOS */}
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col">
            {selectedStudent ? (
              <>
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <FolderOpen className="text-blue-600" size={24} />
                       <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedStudent.name}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-500 pt-1">
                      <p><b>Data Nasc:</b> {selectedStudent.birthDate ? selectedStudent.birthDate.split('-').reverse().join('/') : '---'}</p>
                      <p><b>Filiação:</b> {selectedStudent.motherName || '---'} / {selectedStudent.fatherName || '---'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsHistoryModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-md shadow-blue-600/20"
                    >
                      <GraduationCap size={18} />
                      <span>Histórico Escolar</span>
                    </button>
                  </div>

                  {/* ACTION BAR PARA ARQUIVOS */}
                  <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                      <input 
                        type="file" 
                        id="attach-file" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                      
                      <div className="flex gap-1.5 justify-center">
                        <label 
                          htmlFor="attach-file" 
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed rounded-lg text-xs font-bold text-slate-500 hover:text-blue-600 hover:border-blue-600 border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
                        >
                          <Plus size={14} /> Selecionar
                        </label>




                      </div>
                      
                      {selectedFile && (
                          <div className="flex gap-2">
                              <input 
                                type="text"
                                value={customFileName}
                                onChange={e => setCustomFileName(e.target.value)}
                                placeholder="Nome do arquivo"
                                className="px-2 py-1.5 border rounded-lg bg-white text-xs"
                              />
                              <button 
                                type="submit" 
                                disabled={uploading || !customFileName.trim()} 
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                              >
                                {uploading ? 'Salvando...' : 'Salvar'}
                              </button>
                          </div>
                      )}
                  </form>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    {loadingFiles ? (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">Carregando documentos...</div>
                    ) : files.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {files.map(file => (
                                <motion.div 
                                    key={file.name} 
                                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition shadow-sm group"
                                >
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-bold text-slate-800 dark:text-white text-xs truncate" title={file.name}>{file.name}</p>
                                        <p className="text-[10px] text-slate-400">Criado em: {new Date(file.created_at).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button type="button" onClick={() => handlePreviewFile(file.name)} title="Visualizar" className="p-1 px-1.5 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"><Eye size={14} /></button>
                                        <button type="button" onClick={() => handleDownloadFile(file.name)} title="Baixar" className="p-1 px-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg"><Download size={14} /></button>
                                        <button type="button" onClick={() => handleDeleteFile(file.name)} title="Excluir" className="p-1 px-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg"><Trash2 size={14} /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
                            <Folder size={40} strokeWidth={1} />
                            <p>Nenhum documento arquivado disponível.</p>
                        </div>
                    )}
                </div>
              </>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                   <Folder size={48} strokeWidth={1} />
                   <p className="text-sm font-medium">Selecione um aluno na lista ao lado para ver seus documentos.</p>
               </div>
            )}
          </div>
        </div>
      </div>



      {/* MODAL CADASTRO MANUAL */}
      {isAddStudentModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div onClick={() => setIsAddStudentModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
               <form onSubmit={handleAddStudent} className="relative bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4 border border-slate-200">
                   <h3 className="text-xl font-bold">Pré-cadastrar Aluno</h3>
                   <div>
                       <label className="text-sm font-medium">Nome Completo</label>
                       <input type="text" required value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 text-sm" />
                   </div>
                   <div>
                       <label className="text-sm font-medium">Data de Nascimento</label>
                       <input type="date" value={newStudent.birthDate} onChange={e => setNewStudent({...newStudent, birthDate: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 text-sm" />
                   </div>
                   <div>
                       <label className="text-sm font-medium">Nome da Mãe</label>
                       <input type="text" value={newStudent.motherName} onChange={e => setNewStudent({...newStudent, motherName: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 text-sm" />
                   </div>
                   <div>
                       <label className="text-sm font-medium">Nome do Pai</label>
                       <input type="text" value={newStudent.fatherName} onChange={e => setNewStudent({...newStudent, fatherName: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg bg-slate-50 text-sm" />
                   </div>
                   <div className="flex justify-end gap-2 pt-2">
                       <button type="button" onClick={() => setIsAddStudentModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm">Cancelar</button>
                       <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-1"><Plus size={16} /> Gravar</button>
                   </div>
               </form>
           </div>
      )}

      {/* MODAL VISUALIZADOR DE DOCUMENTO */}
      {previewFile && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div onClick={() => setPreviewFile(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
               <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl p-6 rounded-2xl shadow-xl space-y-4 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                   <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                       <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate" title={previewFile.name}>{previewFile.name}</h3>
                       <button type="button" onClick={() => setPreviewFile(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><X size={20} /></button>
                   </div>
                   <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-xl p-2 min-h-[400px]">
                       {previewFile.type.startsWith('image/') ? (
                           <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-[70vh] object-contain rounded-md" />
                       ) : previewFile.type === 'application/pdf' ? (
                           <iframe src={previewFile.url} className="w-full h-[70vh] rounded-md border-0" />
                       ) : (
                           <div className="text-center space-y-3">
                               <FileText size={48} className="mx-auto text-slate-400" />
                               <p className="text-slate-500 text-sm">Visualização não suportada para este formato.</p>
                               <button onClick={() => {
                                   const a = document.createElement('a');
                                   a.href = previewFile.url;
                                   a.download = previewFile.name;
                                   a.click();
                               }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 mx-auto">
                                   <Download size={16} /> Baixar Arquivo
                               </button>
                           </div>
                       )}
                   </div>
               </div>
           </div>
      )}

      {/* MODAL CONFIRMAÇÃO PARA EXCLUSÃO DE ALUNO */}
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteStudent}
        title="Excluir Pré-cadastro"
        description="Tem certeza que deseja excluir o cadastro de documentos deste aluno? Essa ação também removerá TODOS os arquivos vinculados a ele e não poderá ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      {selectedStudent && (
        <SchoolHistoryModal 
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          student={selectedStudent}
          school={schoolInfo}
          issuerName={userName}
        />
      )}

    </>
  );
}
