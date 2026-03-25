import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Avatar } from '../components/Avatar';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { 
  User, 
  School, 
  ShieldCheck, 
  Save, 
  Lock, 
  Moon, 
  Sun,
  Eye,
  EyeOff,
  UserPlus,
  X as CloseIcon,
  Edit,
  Trash,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Changed from 'motion/react' to 'framer-motion'
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// Cliente Secundário sem persistência de sessão para não deslogar o admin ao cadastrar
const supabaseRegister = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  { auth: { persistSession: false } }
);

export function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('perfil');
  const [userRole, setUserRole] = useState<string>('Secretaria');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Perfil States
  const [profileData, setProfileData] = useState({ name: '', role: '', id: '', schoolName: '', avatarUrl: '' });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Escola States (Admin/Diretor)
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
  const [isCreatingSchool, setIsCreatingSchool] = useState(false);
  const [isDeleteSchoolModalOpen, setIsDeleteSchoolModalOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<{id: string, name: string} | null>(null);

  const [schoolInfo, setSchoolInfo] = useState({
    name: 'Escola Municipal PMJ',
    inep: '',
    cnpj: '',
    phone: '',
    email: '',
    cep: '', // New
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    uf: '',
    logo_url: '',
    current_bimester: '1º Bimestre',
    min_grade: '6.0',
    director: '',
    director_cpf: '', // New
    zone_type: 'Urbana',
    capacity: 0,
    dependencia_adm: 'Municipal', // New
    situacao_func: 'Em atividade', // New
    forma_ocupacao: 'Próprio', // New
    infra_refeitorio: false,
    infra_quadra: false,
    infra_biblioteca: false,
    infra_laboratorio: false,
    infra_agua_rede: false, // New
    infra_agua_poco: false, // New
    infra_energia_rede: false, // New
    infra_esgoto_rede: false, // New
    infra_lixo_coleta: false, // New
    infra_internet: false, // New
    infra_banheiro_pne: false, // New
    alimentacao_escolar: false, // New
    atendimento_aee: false, // New
    etapas_infantil: false,
    etapas_fundamental1: false,
    etapas_fundamental2: false,
    turno_matutino: false,
    turno_vespertino: false,
    turno_integral: false
  });

  // Usuarios States (Admin)
  const [users, setUsers] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('Secretaria');
  const [newUserSchoolId, setNewUserSchoolId] = useState('');

  // Edit User States
  const [userToEdit, setUserToEdit] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUserName, setEditUserName] = useState('');
  const [editUserRole, setEditUserRole] = useState('Secretaria');
  const [editUserSchoolId, setEditUserSchoolId] = useState('');
  
  // Delete User States
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{id: string, name: string} | null>(null);
  
  const [uploading, setUploading] = useState(false);

  // Mask Helpers
  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const maskCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'usuarios') {
      loadUsers();
      loadSchoolInfo();
    }
    if (activeTab === 'escola') {
      loadSchoolInfo();
    }
  }, [activeTab]);

  useEffect(() => {
    const cep = schoolInfo.cep ? schoolInfo.cep.replace(/\D/g, '') : '';
    if (cep.length === 8) {
      const fetchAddress = async () => {
        const loadingToast = toast.loading('Buscando CEP...');
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const data = await response.json();
          if (!data.erro) {
            setSchoolInfo(prev => ({
              ...prev,
              street: data.logradouro || prev.street,
              neighborhood: data.bairro || prev.neighborhood,
              city: data.localidade || prev.city,
              uf: data.uf || prev.uf,
            }));
            toast.success('Endereço encontrado!', { id: loadingToast });
          } else {
            toast.error('CEP não encontrado!', { id: loadingToast });
          }
        } catch (error) {
          toast.error('Erro ao buscar CEP', { id: loadingToast });
        }
      };
      fetchAddress();
    }
  }, [schoolInfo.cep]);

  const loadSchoolInfo = async () => {
    try {
        const { data } = await supabase.from('school_info').select('*').order('name');
        setSchools(data || []);
    } catch {
        console.log('Tabela school_info não encontrada.');
    }
  };

  const handleSelectSchool = (school: any) => {
      setSelectedSchool(school);
      setSchoolInfo({
          ...school,
          current_bimester: school.current_bimester || '1º Bimestre',
          min_grade: school.min_grade || '6.0'
      });
  };

  const handleNewSchool = () => {
      setIsCreatingSchool(true);
      setSelectedSchool(null);
      setSchoolInfo({
          name: '',
          inep: '',
          cnpj: '',
          phone: '',
          email: '',
          cep: '',
          street: '',
          number: '',
          neighborhood: '',
          city: '',
          uf: '',
          logo_url: '',
          current_bimester: '1º Bimestre',
          min_grade: '6.0',
          director: '',
          director_cpf: '',
          zone_type: 'Urbana',
          capacity: 0,
          dependencia_adm: 'Municipal',
          situacao_func: 'Em atividade',
          forma_ocupacao: 'Próprio',
          infra_refeitorio: false,
          infra_quadra: false,
          infra_biblioteca: false,
          infra_laboratorio: false,
          infra_agua_rede: false,
          infra_agua_poco: false,
          infra_energia_rede: false,
          infra_esgoto_rede: false,
          infra_lixo_coleta: false,
          infra_internet: false,
          infra_banheiro_pne: false,
          alimentacao_escolar: false,
          atendimento_aee: false,
          etapas_infantil: false,
          etapas_fundamental1: false,
          etapas_fundamental2: false,
          turno_matutino: false,
          turno_vespertino: false,
          turno_integral: false
      });
  };

  const handleUpdateSchoolInfo = async () => {
       setSaving(true);
       try {
           const { error } = await supabase.from('school_info').upsert({
               id: (schoolInfo as any).id || undefined,
               ...schoolInfo
           });
           if (error) throw error;
           toast.success('Informações da escola salvas!');
           loadSchoolInfo(); // atualiza a lista
           setSelectedSchool(null);
           setIsCreatingSchool(false);
       } catch (err: any) {
           toast.error(err.message);
       } finally {
           setSaving(false);
       }
  };

  const handleDeleteSchool = async (schoolId: string, schoolName: string) => {
       setSchoolToDelete({ id: schoolId, name: schoolName });
       setIsDeleteSchoolModalOpen(true);
  };

  const confirmDeleteSchool = async () => {
       if (!schoolToDelete) return;
       setSaving(true);
       try {
           const { error } = await supabase.from('school_info').delete().eq('id', schoolToDelete.id);
           if (error) throw error;
           toast.success('Escola excluída com sucesso!');
           loadSchoolInfo(); // atualiza a lista de escolas
           setIsDeleteSchoolModalOpen(false);
           setSchoolToDelete(null);
       } catch (err: any) {
           toast.error(err.message);
       } finally {
           setSaving(false);
       }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
          const fileExt = file.name.split('.').pop();
          const fileName = `school-logo-${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
              .from('student-documents')
              .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
              .from('student-documents')
              .getPublicUrl(filePath);

          setSchoolInfo({ ...schoolInfo, logo_url: publicUrl });
          toast.success('Logo enviada!');
      } catch (err: any) {
          toast.error(err.message);
      } finally {
          setUploading(false);
      }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newUserName || !newUserEmail || newUserPassword.length < 6) {
          toast.error('Preencha todos os campos e certifique-se que a senha tem 6 caracteres.');
          return;
      }
      setSaving(true);
      try {
          const { data, error } = await supabaseRegister.auth.signUp({
              email: newUserEmail.trim(),
              password: newUserPassword,
              options: {
                  data: { 
                      name: newUserName.trim(),
                      role: newUserRole,
                      school_id: newUserSchoolId || null
                  }
              }
          });

          if (error) throw error;

          toast.success('Usuário criado com sucesso!');
          setShowCreateModal(false);
          setNewUserName(''); setNewUserEmail(''); setNewUserPassword(''); setNewUserRole('Secretaria'); setNewUserSchoolId('');
          loadUsers();
      } catch (err: any) {
          toast.error(err.message);
      } finally {
          setSaving(false);
      }
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Check for impersonation first
      const impersonated = localStorage.getItem('impersonated_user');
      if (impersonated) {
          const data = JSON.parse(impersonated);
          setProfileData({ 
              name: data.name || 'Simulado', 
              role: data.role || 'Admin', 
              id: data.id || '',
              schoolName: '', // Impersonated users school might not be available here easily
              avatarUrl: ''
          });
          setUserRole(data.role || 'Admin');
          setLoading(false);
          return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, school_info(*) ')
          .eq('id', user.id)
          .single();

        if (profile) {
          setProfileData({ 
              name: profile.name, 
              role: profile.role, 
              id: profile.id,
              schoolName: (profile.school_info as any)?.name || '',
              avatarUrl: (profile as any).avatar_url || ''
          });
          setUserRole(profile.role);
          if (profile.role !== 'Admin' && (profile as any).school_info) {
               handleSelectSchool((profile as any).school_info);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];
       if (!file) return;

       setSaving(true);
       try {
            const fileExt = file.name.split('.').pop();
            const fileName = `avatars/${profileData.id}-${Math.floor(Math.random() * 10000)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('student-documents').upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('student-documents').getPublicUrl(fileName);

            const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profileData.id);
            if (updateError) throw updateError;

            setProfileData({ ...profileData, avatarUrl: publicUrl });
            toast.success('Foto de perfil atualizada!');
       } catch (err: any) {
            toast.error(err.message);
       } finally {
            setSaving(false);
       }
  };

  const loadUsers = async () => {
    try {
      let query = supabase.from('profiles').select('*').order('name');
      
      // Se não for Admin, filtrar apenas usuários da mesma unidade
      if (userRole !== 'Admin' && selectedSchool?.id) {
          query = query.eq('school_id', selectedSchool.id);
      }

      const { data } = await query;
      setUsers(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao carregar usuários: ' + err.message);
    }
  };

  const handleUpdatePassword = async () => {
     if (!password || password.length < 6) {
         toast.error('A senha deve ter no mínimo 6 caracteres.');
         return;
     }
     setSaving(true);
     try {
         const { error } = await supabase.auth.updateUser({ password: password });
         if (error) throw error;
         toast.success('Senha atualizada com sucesso!');
         setPassword('');
     } catch (err: any) {
         toast.error(err.message);
     } finally {
         setSaving(false);
     }
  };

  const handleEditUserClick = (usr: any) => {
      setUserToEdit(usr);
      setEditUserName(usr.name || '');
      setEditUserRole(usr.role || 'Secretaria');
      setEditUserSchoolId(usr.school_id || '');
      setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!userToEdit) return;
      setSaving(true);
      try {
          const { error } = await supabase.from('profiles').update({
              name: editUserName,
              role: editUserRole,
              school_id: editUserSchoolId || null
          }).eq('id', userToEdit.id);
          
          if (error) throw error;
          
          toast.success('Usuário atualizado!');
          setIsEditModalOpen(false);
          loadUsers();
      } catch (err: any) {
          toast.error(err.message);
      } finally {
          setSaving(false);
      }
  };

  const handleDeleteUserClick = (userId: string, userName: string) => {
       setUserToDelete({ id: userId, name: userName });
       setIsDeleteUserModalOpen(true);
  };

  const confirmDeleteUser = async () => {
       if (!userToDelete) return;
       setSaving(true);
       try {
           const { error } = await supabase.rpc('delete_user_admin', { user_id_param: userToDelete.id });
           if (error) throw error;
           toast.success('Usuário excluído com sucesso!');
           loadUsers();
           setIsDeleteUserModalOpen(false);
           setUserToDelete(null);
       } catch (err: any) {
           toast.error(err.message);
       } finally {
           setSaving(false);
       }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
      try {
          const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
          if (error) throw error;
          toast.success('Cargo atualizado!');
          loadUsers(); // reload
      } catch (err: any) {
          toast.error(err.message);
      }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando configurações...</div>;

  return (
    <>
      <Header title="Configurações do Sistema" />
      <div className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto">
         
         <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-2">
            <button onClick={() => setActiveTab('perfil')} className={`flex items-center gap-2 px-4 py-2 border-b-2 font-semibold text-sm transition-colors ${activeTab === 'perfil' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>
                <User size={16} /> Perfil
            </button>

            {userRole === 'Admin' && (
              <button onClick={() => setActiveTab('usuarios')} className={`flex items-center gap-2 px-4 py-2 border-b-2 font-semibold text-sm transition-colors ${activeTab === 'usuarios' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>
                  <ShieldCheck size={16} /> Usuários
              </button>
            )}
         </div>

         <AnimatePresence mode="wait">
            {/* TAB PERFIL */}
            {activeTab === 'perfil' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md space-y-6">
                    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><User size={20} className="text-blue-600" /> Meus Dados</h3>
                        
                        <div className="flex justify-center pb-2">
                             <div className="relative group cursor-pointer w-fit mx-auto" onClick={() => document.getElementById('avatar-upload')?.click()}>
                                  <Avatar src={profileData.avatarUrl} name={profileData.name} size="xl" className="border-2 border-blue-600/40 shadow-sm group-hover:opacity-80 transition-all pointer-events-auto" />
                                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                       <Upload size={16} className="text-white" />
                                  </div>
                             </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">NOME DO USUÁRIO</label>
                            <input type="text" value={profileData.name} disabled className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm text-slate-600" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">CARGO / FUNÇÃO</label>
                            <input type="text" value={profileData.role} disabled className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm text-blue-600 font-bold" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">ESCOLA VINCULADA</label>
                            <input type="text" value={profileData.schoolName || (profileData.role === 'Admin' ? 'Todas as Escolas (Superusuário)' : 'Nenhum vínculo')} disabled className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm text-slate-600" />
                        </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Lock size={20} className="text-amber-500" /> Segurança</h3>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">CRIAR NOVA SENHA</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2 text-slate-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                            </div>
                        </div>
                        <button onClick={handleUpdatePassword} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20">
                            <Save size={14} /> {saving ? 'Salvando...' : 'Atualizar Senha'}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* TAB ESCOLA */}
            {activeTab === 'escola' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    {!selectedSchool && !isCreatingSchool ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <School size={20} className="text-blue-600" /> Escolas Cadastradas
                                </h3>
                                {userRole === 'Admin' && (
                                    <button onClick={handleNewSchool} className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md">
                                        <UserPlus size={16} /> Nova Escola
                                    </button>
                                )}
                            </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b">
                                        <tr>
                                            <th className="px-6 py-3 font-bold text-slate-500">Nome</th>
                                            <th className="px-6 py-3 font-bold text-slate-500">CNPJ / INEP</th>
                                            <th className="px-6 py-3 font-bold text-slate-500">Cidade/UF</th>
                                            <th className="px-6 py-3 font-bold text-slate-500 text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                        {schools.map((sch: any) => (
                                            <tr key={sch.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-3 font-medium text-slate-800 dark:text-white flex items-center gap-2">
                                                    {sch.logo_url && <img src={sch.logo_url} alt="Logo" className="w-8 h-8 rounded-full border object-cover" />}
                                                    {sch.name}
                                                </td>
                                                <td className="px-6 py-3 text-slate-500">{sch.cnpj || sch.inep || 'Não informado'}</td>
                                                <td className="px-6 py-3 text-slate-500">{sch.city ? `${sch.city}/${sch.uf || ''}` : 'Não informado'}</td>
                                                <td className="px-6 py-3 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => handleSelectSchool(sch)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Editar Escola">
                                                            <Edit size={16} />
                                                        </button>
                                                        {userRole === 'Admin' && (
                                                            <button onClick={() => handleDeleteSchool(sch.id, sch.name)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Excluir Escola">
                                                                <Trash size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {schools.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhuma escola cadastrada.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

</div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                {userRole === 'Admin' && (
                                    <button onClick={() => { setSelectedSchool(null); setIsCreatingSchool(false); }} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold">
                                        ← Voltar para lista
                                    </button>
                                )}
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <School size={20} className="text-blue-600" /> {isCreatingSchool ? 'Cadastrar Nova Escola' : 'Editar Escola'}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 {/* COLUNA LOGO */}
                                 <div className="md:col-span-1 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col items-center justify-center space-y-4">
                                      <h4 className="text-sm font-bold text-slate-400">LOGOTIPO DA ESCOLA</h4>
                                      <div className="size-32 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border">
                                          {schoolInfo.logo_url ? (
                                              <img src={schoolInfo.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                          ) : (
                                              <School size={48} className="text-slate-300" />
                                          )}
                                      </div>
                                      <label className="cursor-pointer flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold">
                                           <UserPlus size={14} /> {uploading ? 'Enviando...' : 'Fazer Upload'}
                                           <input type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" />
                                      </label>
                                 </div>

                                 {/* DADOS GERAIS */}
                                 <div className="md:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><School size={20} className="text-blue-600" /> Informações Gerais</h3>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                           <div className="space-y-1">
                                               <label className="text-xs font-bold text-slate-400">NOME DO COLÉGIO</label>
                                               <input type="text" value={schoolInfo.name} onChange={e => setSchoolInfo({...schoolInfo, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                           </div>
                                           <div className="space-y-1">
                                               <label className="text-xs font-bold text-slate-400">CNPJ</label>
                                               <input type="text" value={schoolInfo.cnpj} onChange={e => setSchoolInfo({...schoolInfo, cnpj: maskCNPJ(e.target.value)})} maxLength={18} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                           </div>
                                           <div className="space-y-1">
                                               <label className="text-xs font-bold text-slate-400">CÓDIGO INEP</label>
                                               <input type="text" value={schoolInfo.inep} onChange={e => setSchoolInfo({...schoolInfo, inep: e.target.value.replace(/\D/g, '').slice(0, 8)})} maxLength={8} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                           </div>
                                           <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-400">DIRETOR(A) RESPONSÁVEL</label>
                                               <input type="text" value={schoolInfo.director} onChange={e => setSchoolInfo({...schoolInfo, director: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                           </div>
                                           <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-400">CPF DO DIRETOR</label>
                                               <input type="text" value={schoolInfo.director_cpf} onChange={e => setSchoolInfo({...schoolInfo, director_cpf: maskCPF(e.target.value)})} maxLength={14} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                           </div>
                                           <div className="space-y-1">
                                               <label className="text-xs font-bold text-slate-400">TIPO DE ZONA</label>
                                               <select value={schoolInfo.zone_type} onChange={e => setSchoolInfo({...schoolInfo, zone_type: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm">
                                                   <option>Urbana</option>
                                                   <option>Rural</option>
                                               </select>
                                           </div>
                                           <div className="space-y-1">
                                               <label className="text-xs font-bold text-slate-400">SITUAÇÃO DE FUNCIONAMENTO</label>
                                               <select value={schoolInfo.situacao_func} onChange={e => setSchoolInfo({...schoolInfo, situacao_func: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm">
                                                   <option>Em atividade</option>
                                                   <option>Paralisada</option>
                                                   <option>Extinta</option>
                                               </select>
                                           </div>
                                           <div className="space-y-1">
                                               <label className="text-xs font-bold text-slate-400">DEPENDÊNCIA ADMINISTRATIVA</label>
                                               <select value={schoolInfo.dependencia_adm} onChange={e => setSchoolInfo({...schoolInfo, dependencia_adm: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm">
                                                   <option>Municipal</option>
                                                   <option>Estadual</option>
                                                   <option>Federal</option>
                                                   <option>Privada</option>
                                               </select>
                                           </div>
                                           <div className="space-y-1">
                                               <label className="text-xs font-bold text-slate-400">FORMA DE OCUPAÇÃO DO PRÉDIO</label>
                                               <select value={schoolInfo.forma_ocupacao} onChange={e => setSchoolInfo({...schoolInfo, forma_ocupacao: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm">
                                                   <option>Próprio</option>
                                                   <option>Alugado</option>
                                                   <option>Cedido</option>
                                                   <option>Outros</option>
                                               </select>
                                           </div>
                                           <div className="space-y-1">
                                               <label className="text-xs font-bold text-slate-400">CAPACIDADE (ALUNOS)</label>
                                               <input type="number" value={schoolInfo.capacity} onChange={e => setSchoolInfo({...schoolInfo, capacity: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                           </div>
                                           <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-400">TELEFONE DE CONTATO</label>
                                                <input type="text" value={schoolInfo.phone} onChange={e => setSchoolInfo({...schoolInfo, phone: maskPhone(e.target.value)})} maxLength={15} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-400">E-MAIL INSTITUCIONAL</label>
                                                <input type="email" value={schoolInfo.email} onChange={e => setSchoolInfo({...schoolInfo, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                            </div>
                                      </div>
                                      <h4 className="text-xs font-bold text-slate-400 mt-4">ENDEREÇO</h4>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                           <div className="space-y-1">
                                               <label className="text-xs font-bold text-slate-400">CEP</label>
                                               <input type="text" value={schoolInfo.cep || ''} onChange={e => setSchoolInfo({...schoolInfo, cep: maskCEP(e.target.value)})} maxLength={9} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                           </div>
                                           <div className="md:col-span-1 space-y-1">
                                               <label className="text-xs font-bold text-slate-400">LOGRADOURO (Rua)</label>
                                               <input type="text" value={schoolInfo.street} onChange={e => setSchoolInfo({...schoolInfo, street: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                           </div>
                                           <div className="space-y-1">
                                               <label className="text-xs font-bold text-slate-400">NÚMERO</label>
                                               <input type="text" value={schoolInfo.number} onChange={e => setSchoolInfo({...schoolInfo, number: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                           </div>
                                           <div className="space-y-1">
                                               <label className="text-xs font-bold text-slate-400">BAIRRO</label>
                                               <input type="text" value={schoolInfo.neighborhood} onChange={e => setSchoolInfo({...schoolInfo, neighborhood: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                           </div>
                                           <div className="space-y-1">
                                               <label className="text-xs font-bold text-slate-400">CIDADE</label>
                                               <input type="text" value={schoolInfo.city} onChange={e => setSchoolInfo({...schoolInfo, city: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                           </div>
                                           <div className="space-y-1">
                                               <label className="text-xs font-bold text-slate-400">UF</label>
                                               <input type="text" value={schoolInfo.uf} onChange={e => setSchoolInfo({...schoolInfo, uf: e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2)})} maxLength={2} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                           </div>
                                      </div>
                                 </div>
                            </div>

                             <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><School size={20} className="text-blue-600" /> Infraestrutura e Atendimento</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                       <div className="space-y-2">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase">Infraestrutura</h4>
                                            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                 <input type="checkbox" checked={schoolInfo.infra_refeitorio} onChange={e => setSchoolInfo({...schoolInfo, infra_refeitorio: e.target.checked})} /> Refeitório
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                 <input type="checkbox" checked={schoolInfo.infra_quadra} onChange={e => setSchoolInfo({...schoolInfo, infra_quadra: e.target.checked})} /> Quadra Esportiva
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                 <input type="checkbox" checked={schoolInfo.infra_biblioteca} onChange={e => setSchoolInfo({...schoolInfo, infra_biblioteca: e.target.checked})} /> Biblioteca
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                 <input type="checkbox" checked={schoolInfo.infra_laboratorio} onChange={e => setSchoolInfo({...schoolInfo, infra_laboratorio: e.target.checked})} /> Laboratório Info
                                            </label>
                                             <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                  <input type="checkbox" checked={schoolInfo.infra_agua_rede} onChange={e => setSchoolInfo({...schoolInfo, infra_agua_rede: e.target.checked})} /> Água (Rede Pública)
                                             </label>
                                             <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                  <input type="checkbox" checked={schoolInfo.infra_agua_poco} onChange={e => setSchoolInfo({...schoolInfo, infra_agua_poco: e.target.checked})} /> Água (Poço)
                                             </label>
                                             <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                  <input type="checkbox" checked={schoolInfo.infra_energia_rede} onChange={e => setSchoolInfo({...schoolInfo, infra_energia_rede: e.target.checked})} /> Energia Elétrica
                                             </label>

                                       </div>

                                       <div className="space-y-2">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase">Etapas de Ensino</h4>
                                            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                 <input type="checkbox" checked={schoolInfo.etapas_infantil} onChange={e => setSchoolInfo({...schoolInfo, etapas_infantil: e.target.checked})} /> Infantil / Creche
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                 <input type="checkbox" checked={schoolInfo.etapas_fundamental1} onChange={e => setSchoolInfo({...schoolInfo, etapas_fundamental1: e.target.checked})} /> Fundamental I
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                 <input type="checkbox" checked={schoolInfo.etapas_fundamental2} onChange={e => setSchoolInfo({...schoolInfo, etapas_fundamental2: e.target.checked})} /> Fundamental II
                                            </label>
                                             <h4 className="text-xs font-bold text-slate-500 uppercase mt-4">Esgoto e Recursos</h4>
                                             <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                  <input type="checkbox" checked={schoolInfo.infra_esgoto_rede} onChange={e => setSchoolInfo({...schoolInfo, infra_esgoto_rede: e.target.checked})} /> Esgotamento Sanitário
                                             </label>
                                             <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                  <input type="checkbox" checked={schoolInfo.infra_lixo_coleta} onChange={e => setSchoolInfo({...schoolInfo, infra_lixo_coleta: e.target.checked})} /> Coleta de Lixo
                                             </label>
                                             <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                  <input type="checkbox" checked={schoolInfo.infra_internet} onChange={e => setSchoolInfo({...schoolInfo, infra_internet: e.target.checked})} /> Internet para Alunos
                                             </label>

                                       </div>

                                       <div className="space-y-2">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase">Turnos</h4>
                                            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                 <input type="checkbox" checked={schoolInfo.turno_matutino} onChange={e => setSchoolInfo({...schoolInfo, turno_matutino: e.target.checked})} /> Matutino
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                 <input type="checkbox" checked={schoolInfo.turno_vespertino} onChange={e => setSchoolInfo({...schoolInfo, turno_vespertino: e.target.checked})} /> Vespertino
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                 <input type="checkbox" checked={schoolInfo.turno_integral} onChange={e => setSchoolInfo({...schoolInfo, turno_integral: e.target.checked})} /> Integral
                                            </label>
                                             <h4 className="text-xs font-bold text-slate-500 uppercase mt-4">Acessibilidade e Extras</h4>
                                             <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                  <input type="checkbox" checked={schoolInfo.infra_banheiro_pne} onChange={e => setSchoolInfo({...schoolInfo, infra_banheiro_pne: e.target.checked})} /> Banheiro Acessível (PNE)
                                             </label>
                                             <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                  <input type="checkbox" checked={schoolInfo.alimentacao_escolar} onChange={e => setSchoolInfo({...schoolInfo, alimentacao_escolar: e.target.checked})} /> Oferece Alimentação
                                             </label>
                                             <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                  <input type="checkbox" checked={schoolInfo.atendimento_aee} onChange={e => setSchoolInfo({...schoolInfo, atendimento_aee: e.target.checked})} /> Atendimento AEE
                                             </label>

                                       </div>
                                  </div>
                             </div>

                            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                                 <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Lock size={20} className="text-blue-600" /> Parâmetros do Sistema</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                          <label className="text-xs font-bold text-slate-400">BIMESTRE ATIVO</label>
                                          <select value={schoolInfo.current_bimester} onChange={e => setSchoolInfo({...schoolInfo, current_bimester: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm">
                                              <option>1º Bimestre</option>
                                              <option>2º Bimestre</option>
                                              <option>3º Bimestre</option>
                                              <option>4º Bimestre</option>
                                          </select>
                                      </div>
                                      <div className="space-y-1">
                                          <label className="text-xs font-bold text-slate-400">MÉDIA MÍNIMA (NOTA)</label>
                                          <input type="number" step="0.5" value={schoolInfo.min_grade} onChange={e => setSchoolInfo({...schoolInfo, min_grade: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                      </div>
                                 </div>
                                 <button onClick={handleUpdateSchoolInfo} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md">
                                     <Save size={14} /> {saving ? 'Salvando...' : 'Salvar Parâmetros'}
                                 </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* TAB USUARIOS */}
            {activeTab === 'usuarios' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                     <div className="flex justify-between items-center flex-wrap gap-2">
                          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs flex-1 max-w-sm">
                               {userRole === 'Admin' 
                                 ? 'Como Admin Superusuário, você pode criar e alterar as funções e visualizações de novos trabalhadores.' 
                                 : 'Como gestor desta unidade, você pode gerenciar a sua equipe local.'}
                          </div>
                          <button onClick={() => { 
                               if (userRole !== 'Admin' && selectedSchool?.id) {
                                   setNewUserSchoolId(selectedSchool.id);
                               }
                               setShowCreateModal(true); 
                           }} className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md">
                              <UserPlus size={16} /> Novo Usuário
                          </button>
                     </div>

                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left text-sm">
                             <thead className="bg-slate-50 dark:bg-slate-800/60 border-b">
                                  <tr>
                                       <th className="px-6 py-3 font-bold text-slate-500">Nome</th>
                                       <th className="px-6 py-3 font-bold text-slate-500">Perfil / Cargo</th>
                                       <th className="px-6 py-3 font-bold text-slate-500 text-center">Modificar</th>
                                  </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                  {users.map((usr: any) => (
                                      <tr key={usr.id} className="hover:bg-slate-50/50">
                                          <td className="px-6 py-3 font-medium text-slate-800 dark:text-white">{usr.name}</td>
                                          <td className="px-6 py-3">
                                               <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${usr.role === 'Admin' ? 'bg-blue-100 text-blue-700' : usr.role === 'Professor' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                                   {usr.role}
                                               </span>
                                          </td>
                                          <td className="px-6 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                 {usr.id !== profileData.id ? (
                                                     <>
                                                          <button onClick={() => handleEditUserClick(usr)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Editar Usuário">
                                                               <Edit size={16} />
                                                          </button>
                                                          <button onClick={() => handleDeleteUserClick(usr.id, usr.name)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Excluir Usuário">
                                                               <Trash size={16} />
                                                          </button>
                                                     </>
                                                 ) : <span className="text-slate-300 italic text-xs">Você</span>}
                                            </div>
                                          </td>
                                      </tr>
                                  ))}
                             </tbody>
                        </table>
                     </div>

                     {/* MODAL NOVO USUARIO */}
                     <AnimatePresence>
                        {showCreateModal && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
                                     <div className="flex justify-between items-center border-b pb-2">
                                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><UserPlus size={18} className="text-blue-600" />Cadastrar Usuário</h4>
                                          <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><CloseIcon size={18} /></button>
                                     </div>
                                     <form onSubmit={handleCreateUser} className="space-y-4">
                                          <div className="space-y-1">
                                             <label className="text-xs font-bold text-slate-500">NOME COMPLETO</label>
                                             <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                          </div>
                                          <div className="space-y-1">
                                             <label className="text-xs font-bold text-slate-500">E-MAIL (Login)</label>
                                             <input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                          </div>
                                          <div className="space-y-1">
                                             <label className="text-xs font-bold text-slate-500">SENHA DE ACESSO</label>
                                             <input type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" placeholder="Mínimo 6 dígitos" />
                                          </div>
                                           <div className="space-y-1">
                                              <label className="text-xs font-bold text-slate-500">CARGO INICIAL</label>
                                              <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm">
                                                   <option value="Secretaria">Secretária (Geral)</option>
                                                    <option value="Professor">Professor(a)</option>
                                                    <option value="Diretor">Diretor(a)</option>
                                                    <option value="Coordenador">Coordenador(a)</option>
                                                    <option value="Nutricionista">Nutricionista</option>
                                                   {userRole === 'Admin' && <option value="Admin">Admin</option>}
                                              </select>
                                           </div>
                                           <div className="space-y-1">
                                              <label className="text-xs font-bold text-slate-500">VINCULAR ESCOLA (Opcional)</label>
                                              <select value={newUserSchoolId} onChange={e => setNewUserSchoolId(e.target.value)} disabled={userRole !== 'Admin'} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm">
                      {userRole === 'Admin' ? (
                          <>
                              <option value="">Sem vínculo específico</option>
                              {schools.map(sch => (
                                  <option key={sch.id} value={sch.id}>{sch.name}</option>
                              ))}
                          </>
                      ) : (
                          <option value={selectedSchool?.id || ''}>{selectedSchool?.name || 'Sua Unidade'}</option>
                      )}
                  </select>
                                           </div>
                                          <button type="submit" disabled={saving} className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20">
                                              {saving ? 'Criando Conta...' : 'Criar Conta'}
                                          </button>
                                     </form>
                                </motion.div>
                            </motion.div>
                        )}
                     </AnimatePresence>

                      {/* MODAL EDITAR USUARIO */}
                      <AnimatePresence>
                        {isEditModalOpen && (
                             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                                 <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
                                      <div className="flex justify-between items-center border-b pb-2">
                                           <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Edit size={18} className="text-blue-600" />Editar Usuário</h4>
                                           <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600"><CloseIcon size={18} /></button>
                                      </div>
                                      <form onSubmit={handleUpdateUser} className="space-y-4">
                                           <div className="space-y-1">
                                              <label className="text-xs font-bold text-slate-500">NOME COMPLETO</label>
                                              <input type="text" value={editUserName} onChange={e => setEditUserName(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm" />
                                           </div>
                                           <div className="space-y-1">
                                              <label className="text-xs font-bold text-slate-500">CARGO</label>
                                              <select value={editUserRole} onChange={e => setEditUserRole(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm">
                                                   <option value="Secretaria">Secretária (Geral)</option>
                                                    <option value="Professor">Professor(a)</option>
                                                    <option value="Diretor">Diretor(a)</option>
                                                    <option value="Coordenador">Coordenador(a)</option>
                                                    <option value="Nutricionista">Nutricionista</option>
                                                   {userRole === 'Admin' && <option value="Admin">Admin</option>}
                                              </select>
                                           </div>
                                           <div className="space-y-1">
                                              <label className="text-xs font-bold text-slate-500">VINCULAR ESCOLA (Opcional)</label>
                                              <select value={editUserSchoolId} onChange={e => setEditUserSchoolId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm">
                                                   <option value="">Sem vínculo específico</option>
                                                   {schools.map((sch: any) => (
                                                       <option key={sch.id} value={sch.id}>{sch.name}</option>
                                                   ))}
                                              </select>
                                           </div>
                                           <button type="submit" disabled={saving} className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20">
                                               {saving ? 'Salvando...' : 'Salvar Alterações'}
                                           </button>
                                       </form>
                                  </motion.div>
                              </motion.div>
                         )}
                      </AnimatePresence>

                 </motion.div>
             )}
         </AnimatePresence>

      </div>
      <ConfirmationModal
        isOpen={isDeleteSchoolModalOpen}
        onClose={() => setIsDeleteSchoolModalOpen(false)}
        onConfirm={confirmDeleteSchool}
        title="Excluir Escola"
        description={`ATENÇÃO: Tem certeza que deseja excluir a escola "${schoolToDelete?.name}"? Todas as informações serão removidas do sistema. Essa ação NÃO PODE SER DESFEITA.`}
        confirmText="Sim, Excluir Escola"
        cancelText="Cancelar"
        variant="danger"
      />
      <ConfirmationModal
        isOpen={isDeleteUserModalOpen}
        onClose={() => setIsDeleteUserModalOpen(false)}
        onConfirm={confirmDeleteUser}
        title="Deletar Usuário"
        description={`ATENÇÃO: Tem certeza que deseja excluir o acesso de "${userToDelete?.name}" permanentemente? Essa ação NÃO PODE SER DESFEITA.`}
        confirmText="Deletar Usuário"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
}
