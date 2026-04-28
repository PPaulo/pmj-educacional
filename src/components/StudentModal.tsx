import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from '../types';
import { generateStudentRegistrationPDF } from '../lib/pdf';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Omit<Student, 'id'> & { id?: string }) => void;
  student?: Student | null;
  nextRegistration: string;
  nextCodAluno?: string;
  existingCPFs?: string[];
}

type Tab = 'pessoais' | 'filiacao' | 'endereco' | 'escolar' | 'necessidades';

import toast from 'react-hot-toast';

export function StudentModal({ isOpen, onClose, onSave, student, nextRegistration, nextCodAluno = '', existingCPFs = [] }: StudentModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('pessoais');
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: '',
    email: '',
    registration: '',
    cpf: '',
    birthCertificate: '',
    birthDate: '',
    color: '',
    gender: '',
    cep: '',
    city: '',
    residentialZone: '',
    street: '',
    neighborhood: '',
    locationType: '',
    motherName: '',
    fatherName: '',
    uf: '',
    class: '',
    responsiblePhone: '',
    entryDate: '',
    responsibleName: '',
    status: 'Ativo',
    avatar: '',
    inepId: '',
    nis: '',
    nationality: 'Brasileira',
    birthCountry: 'Brasil',
    birthState: '',
    birthCity: '',
    hasDisability: false,
    disabilityType: '',
    schoolTransport: 'Não utiliza',
    observations: '',
    codAluno: nextCodAluno,
    rg: '',
    orgaoExp: '',
    dataExp: '',
    tipoCertidao: 'Nascimento',
    modeloCertidao: 'Modelo Novo',
    certidaoNumero: '',
    certidaoData: '',
    alergias: '',
    tipoSanguineo: '',
    cartaoSus: '',
    fatherProfession: '',
    fatherPhoneResidencial: '',
    fatherPhoneCelular: '',
    fatherPhoneTrabalho: '',
    motherProfession: '',
    motherPhoneResidencial: '',
    motherPhoneCelular: '',
    motherPhoneTrabalho: '',
    numero: '',
    complemento: '',
    responsibleCpf: '',
    serie: '',
    turno: 'Matutino',
    exercicio: new Date().getFullYear().toString(),
    motorista: '',
    deficienciaAuditiva: false,
    deficienciaVisual: false,
    deficienciaFisica: false,
    deficienciaIntelectual: false,
    deficienciaAutismo: false,
    auxilioLedor: false,
    auxilioTranscricao: false,
    guiaInterprete: false,
    interpreteLibras: false,
    leituraLabial: false,
    provaAmpliada18: false,
    provaAmpliada24: false,
    provaBraile: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('pessoais');
    }
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        registration: student.registration,
        cpf: student.cpf || '',
        birthCertificate: student.birthCertificate || '',
        birthDate: student.birthDate || '',
        color: student.color || '',
        gender: student.gender || '',
        cep: student.cep || '',
        city: student.city || '',
        residentialZone: student.residentialZone || '',
        street: student.street || '',
        neighborhood: student.neighborhood || '',
        locationType: student.locationType || '',
        motherName: student.motherName || '',
        fatherName: student.fatherName || '',
        uf: student.uf || '',
        class: student.class,
        responsiblePhone: student.responsiblePhone || '',
        entryDate: student.entryDate || '',
        responsibleName: student.responsibleName || '',
        status: student.status,
        avatar: student.avatar || '',
        inepId: student.inepId || '',
        nis: student.nis || '',
        nationality: student.nationality || 'Brasileira',
        birthCountry: student.birthCountry || 'Brasil',
        birthState: student.birthState || '',
        birthCity: student.birthCity || '',
        hasDisability: student.hasDisability || false,
        disabilityType: student.disabilityType || '',
        schoolTransport: student.schoolTransport || 'Não utiliza',
        observations: student.observations || '',
        codAluno: student.codAluno || '',
        rg: student.rg || '',
        orgaoExp: student.orgaoExp || '',
        dataExp: student.dataExp || '',
        tipoCertidao: student.tipoCertidao || 'Nascimento',
        modeloCertidao: student.modeloCertidao || 'Modelo Novo',
        certidaoNumero: student.certidaoNumero || '',
        certidaoData: student.certidaoData || '',
        alergias: student.alergias || '',
        tipoSanguineo: student.tipoSanguineo || '',
        cartaoSus: student.cartaoSus || '',
        fatherProfession: student.fatherProfession || '',
        fatherPhoneResidencial: student.fatherPhoneResidencial || '',
        fatherPhoneCelular: student.fatherPhoneCelular || '',
        fatherPhoneTrabalho: student.fatherPhoneTrabalho || '',
        motherProfession: student.motherProfession || '',
        motherPhoneResidencial: student.motherPhoneResidencial || '',
        motherPhoneCelular: student.motherPhoneCelular || '',
        motherPhoneTrabalho: student.motherPhoneTrabalho || '',
        numero: student.numero || '',
        complemento: student.complemento || '',
        responsibleCpf: student.responsibleCpf || '',
        serie: student.serie || '',
        turno: student.turno || 'Matutino',
        exercicio: student.exercicio || new Date().getFullYear().toString(),
        motorista: student.motorista || '',
        deficienciaAuditiva: student.deficienciaAuditiva || false,
        deficienciaVisual: student.deficienciaVisual || false,
        deficienciaFisica: student.deficienciaFisica || false,
        deficienciaIntelectual: student.deficienciaIntelectual || false,
        deficienciaAutismo: student.deficienciaAutismo || false,
        auxilioLedor: student.auxilioLedor || false,
        auxilioTranscricao: student.auxilioTranscricao || false,
        guiaInterprete: student.guiaInterprete || false,
        interpreteLibras: student.interpreteLibras || false,
        leituraLabial: student.leituraLabial || false,
        provaAmpliada18: student.provaAmpliada18 || false,
        provaAmpliada24: student.provaAmpliada24 || false,
        provaBraile: student.provaBraile || false,
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        email: '',
        registration: nextRegistration,
        cpf: '',
        birthCertificate: '',
        birthDate: '',
        color: '',
        gender: '',
        cep: '',
        city: '',
        residentialZone: '',
        street: '',
        neighborhood: '',
        locationType: '',
        motherName: '',
        fatherName: '',
        uf: '',
        class: '',
        responsiblePhone: '',
        entryDate: '',
        responsibleName: '',
        status: 'Ativo',
        avatar: '',
        inepId: '',
        nis: '',
        nationality: 'Brasileira',
        birthCountry: 'Brasil',
        birthState: '',
        birthCity: '',
        hasDisability: false,
        disabilityType: '',
        schoolTransport: 'Não utiliza',
        observations: '',
        codAluno: nextCodAluno,
        rg: '',
        orgaoExp: '',
        dataExp: '',
        tipoCertidao: 'Nascimento',
        modeloCertidao: 'Modelo Novo',
        certidaoNumero: '',
        certidaoData: '',
        alergias: '',
        tipoSanguineo: '',
        cartaoSus: '',
        fatherProfession: '',
        fatherPhoneResidencial: '',
        fatherPhoneCelular: '',
        fatherPhoneTrabalho: '',
        motherProfession: '',
        motherPhoneResidencial: '',
        motherPhoneCelular: '',
        motherPhoneTrabalho: '',
        numero: '',
        complemento: '',
        responsibleCpf: '',
        serie: '',
        turno: 'Matutino',
        exercicio: new Date().getFullYear().toString(),
        motorista: '',
        deficienciaAuditiva: false,
        deficienciaVisual: false,
        deficienciaFisica: false,
        deficienciaIntelectual: false,
        deficienciaAutismo: false,
        auxilioLedor: false,
        auxilioTranscricao: false,
        guiaInterprete: false,
        interpreteLibras: false,
        leituraLabial: false,
        provaAmpliada18: false,
        provaAmpliada24: false,
        provaBraile: false,
      });
    }
  }, [student, isOpen, nextRegistration]);

  useEffect(() => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      const fetchAddress = async () => {
        const loadingToast = toast.loading('Buscando CEP...');
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const data = await response.json();
          if (!data.erro) {
            setFormData(prev => ({
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
  }, [formData.cep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.cpf) {
      const isEditingSameCpf = student?.cpf === formData.cpf;
      if (!isEditingSameCpf && existingCPFs.includes(formData.cpf)) {
        toast.error('Este CPF já está cadastrado no sistema!', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        return;
      }
    }

    onSave({ ...formData, id: student?.id });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    if (name === 'cpf' || name === 'responsibleCpf') {
      setFormData(prev => ({ ...prev, [name]: maskCPF(value) }));
      return;
    }

    if (name === 'cep') {
      setFormData(prev => ({ ...prev, [name]: maskCEP(value) }));
      return;
    }

    if (name === 'certidaoNumero') {
      setFormData(prev => ({ ...prev, [name]: maskCertidao(value) }));
      return;
    }

    if (name === 'nis') {
      setFormData(prev => ({ ...prev, [name]: maskNIS(value) }));
      return;
    }

    if (name === 'cartaoSus') {
      setFormData(prev => ({ ...prev, [name]: maskSUS(value) }));
      return;
    }

    if (name.includes('Phone') || name === 'fatherPhoneResidencial' || name === 'fatherPhoneCelular' || name === 'fatherPhoneTrabalho' || name === 'motherPhoneResidencial' || name === 'motherPhoneCelular' || name === 'motherPhoneTrabalho') {
      setFormData(prev => ({ ...prev, [name]: maskPhone(value) }));
      return;
    }

    if (name === 'hasDisability') {
      setFormData(prev => ({ ...prev, [name]: value === 'true' }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove non-digits
      .replace(/(\d{3})(\d)/, '$1.$2') // Add first dot
      .replace(/(\d{3})(\d)/, '$1.$2') // Add second dot
      .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Add hyphen
      .replace(/(-\d{2})\d+?$/, '$1'); // Limit to 11 digits
  };

  const maskCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const maskCertidao = (value: string) => {
    let v = value.replace(/\D/g, '').substring(0, 32);
    v = v.replace(/^(\d{6})(\d)/, '$1.$2');
    v = v.replace(/^(\d{6}\.\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{6}\.\d{2}\.\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{6}\.\d{2}\.\d{2}\.\d{4})(\d)/, '$1.$2');
    v = v.replace(/^(\d{6}\.\d{2}\.\d{2}\.\d{4}\.\d{1})(\d)/, '$1.$2');
    v = v.replace(/^(\d{6}\.\d{2}\.\d{2}\.\d{4}\.\d{1}\.\d{5})(\d)/, '$1.$2');
    v = v.replace(/^(\d{6}\.\d{2}\.\d{2}\.\d{4}\.\d{1}\.\d{5}\.\d{3})(\d)/, '$1.$2');
    v = v.replace(/^(\d{6}\.\d{2}\.\d{2}\.\d{4}\.\d{1}\.\d{5}\.\d{3}\.\d{7})(\d)/, '$1-$2');
    return v;
  };

  const maskNIS = (value: string) => {
    let v = value.replace(/\D/g, '').substring(0, 11);
    v = v.replace(/^(\d{3})(\d)/, '$1.$2');
    v = v.replace(/^(\d{3}\.\d{5})(\d)/, '$1.$2');
    v = v.replace(/^(\d{3}\.\d{5}\.\d{2})(\d)/, '$1-$2');
    return v;
  };

  const maskSUS = (value: string) => {
    let v = value.replace(/\D/g, '').substring(0, 15);
    v = v.replace(/^(\d{3})(\d)/, '$1 $2');
    v = v.replace(/^(\d{3}\ \d{4})(\d)/, '$1 $2');
    v = v.replace(/^(\d{3}\ \d{4}\ \d{4})(\d)/, '$1 $2');
    return v;
  };

  const handleInvalid = (e: React.FormEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    const section = target.closest('section');
    if (section) {
      const tabId = section.getAttribute('data-tab') as Tab;
      if (tabId && tabId !== activeTab) {
        setActiveTab(tabId);
      }
    }
  };

  const handleFillResponsible = (type: 'mae' | 'pai') => {
    if (type === 'mae') {
      setFormData(prev => ({ 
        ...prev, 
        responsibleName: prev.motherName || '', 
        responsiblePhone: prev.motherPhoneCelular || prev.motherPhoneResidencial || prev.motherPhoneTrabalho || '' 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        responsibleName: prev.fatherName || '', 
        responsiblePhone: prev.fatherPhoneCelular || prev.fatherPhoneResidencial || prev.fatherPhoneTrabalho || '' 
      }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {student ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex px-6 border-b border-slate-100 dark:border-slate-800 gap-6 shrink-0 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('pessoais')}
                  className={`py-3 text-sm font-bold border-b-2 transition-colors shrink-0 ${
                    activeTab === 'pessoais'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Pessoais
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('filiacao')}
                  className={`py-3 text-sm font-bold border-b-2 transition-colors shrink-0 ${
                    activeTab === 'filiacao'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Filiação
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('endereco')}
                  className={`py-3 text-sm font-bold border-b-2 transition-colors shrink-0 ${
                    activeTab === 'endereco'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Endereço
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('escolar')}
                  className={`py-3 text-sm font-bold border-b-2 transition-colors shrink-0 ${
                    activeTab === 'escolar'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Escolar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('necessidades')}
                  className={`py-3 text-sm font-bold border-b-2 transition-colors shrink-0 ${
                    activeTab === 'necessidades'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Necessidades / Saúde
                </button>
              </div>

              <form onSubmit={handleSubmit} onInvalidCapture={handleInvalid} className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Personal Information Section */}
                <section data-tab="pessoais" className={activeTab === 'pessoais' ? 'space-y-4' : 'hidden'}>
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-2 bg-blue-600 rounded-full"></div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Identificação do Aluno</h4>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Código INEP</label>
                          <input name="inepId" value={formData.inepId || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cod Aluno(a)</label>
                          <input name="codAluno" value={formData.codAluno || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome Completo*</label>
                        <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white" />
                      </div>
                    </div>
                    <div className="shrink-0 space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block text-center">Foto</label>
                      <div className="relative group">
                        <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm flex items-center justify-center">
                          {formData.avatar ? <img src={formData.avatar} alt="Preview" className="size-full object-cover" /> : <ImageIcon className="text-slate-300" size={24} />}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <button type="button" onClick={triggerFileInput} className="absolute -bottom-1 -right-1 size-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"><Upload size={12}/></button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Nascimento*</label>
                      <input required type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cor/Raça*</label>
                      <select required name="color" value={formData.color} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white">
                        <option value="">Selecione</option><option value="Branca">Branca</option><option value="Preta">Preta</option><option value="Parda">Parda</option><option value="Amarela">Amarela</option><option value="Indígena">Indígena</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sexo*</label>
                      <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white">
                        <option value="">Selecione</option><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reg. Geral (RG)</label>
                      <input name="rg" value={formData.rg || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-2 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Org Exp</label>
                      <input name="orgaoExp" value={formData.orgaoExp || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-2 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Exp</label>
                      <input type="date" name="dataExp" value={formData.dataExp || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-2 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CPF*</label>
                      <input name="cpf" value={formData.cpf || ''} onChange={handleChange} maxLength={14} className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-2 text-sm" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Certidão de Nascimento</h5>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-xs font-slate-500">Modelo da Certidão</label>
                      <select name="modeloCertidao" value={formData.modeloCertidao || 'Modelo Novo'} onChange={handleChange} className="w-full bg-slate-50 text-xs py-1.5 rounded">
                        <option value="Modelo Novo">Modelo Novo</option><option value="Modelo Antigo">Modelo Antigo</option>
                      </select>
                    </div>
                    {(!formData.modeloCertidao || formData.modeloCertidao === 'Modelo Novo') ? (
                      <div className="sm:col-span-3">
                        <label className="text-xs font-slate-500">Número da Matrícula (Certidão)</label>
                        <input name="certidaoNumero" value={formData.certidaoNumero || ''} onChange={handleChange} className="w-full bg-slate-50 text-xs py-1.5 rounded" />
                      </div>
                    ) : (
                      <div className="sm:col-span-3 grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs font-slate-500">Termo</label>
                          <input name="certidaoTermo" value={formData.certidaoTermo || ''} onChange={handleChange} className="w-full bg-slate-50 text-xs py-1.5 rounded" />
                        </div>
                        <div>
                          <label className="text-xs font-slate-500">Livro</label>
                          <input name="certidaoLivro" value={formData.certidaoLivro || ''} onChange={handleChange} className="w-full bg-slate-50 text-xs py-1.5 rounded" />
                        </div>
                        <div>
                          <label className="text-xs font-slate-500">Folha</label>
                          <input name="certidaoFolha" value={formData.certidaoFolha || ''} onChange={handleChange} className="w-full bg-slate-50 text-xs py-1.5 rounded" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">NIS</label>
                      <input name="nis" value={formData.nis || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cartão SUS</label>
                      <input name="cartaoSus" value={formData.cartaoSus || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm" />
                    </div>
                  </div>
                </section>

                {/* Filiação Section */}
                <section data-tab="filiacao" className={activeTab === 'filiacao' ? 'space-y-4' : 'hidden'}>
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-2 bg-purple-600 rounded-full"></div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Filiação</h4>
                  </div>
                  
                  {/* Pai */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-blue-600">Dados do Pai</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs">Nome do Pai</label>
                        <input name="fatherName" value={formData.fatherName || ''} onChange={handleChange} className="w-full text-sm bg-slate-50 py-2 rounded-lg" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs">Profissão</label>
                        <input name="fatherProfession" value={formData.fatherProfession || ''} onChange={handleChange} className="w-full text-sm bg-slate-50 py-2 rounded-lg" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input name="fatherPhoneResidencial" placeholder="Telefone Residencial" value={formData.fatherPhoneResidencial || ''} onChange={handleChange} className="text-xs bg-slate-50 py-1.5 rounded" />
                      <input name="fatherPhoneCelular" placeholder="Telefone Celular" value={formData.fatherPhoneCelular || ''} onChange={handleChange} className="text-xs bg-slate-50 py-1.5 rounded" />
                      <input name="fatherPhoneTrabalho" placeholder="Telefone Trabalho" value={formData.fatherPhoneTrabalho || ''} onChange={handleChange} className="text-xs bg-slate-50 py-1.5 rounded" />
                    </div>
                  </div>

                  {/* Mãe */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h5 className="text-xs font-bold text-pink-600">Dados da Mãe</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs">Nome da Mãe*</label>
                        <input name="motherName" value={formData.motherName || ''} onChange={handleChange} className="w-full text-sm bg-slate-50 py-2 rounded-lg" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs">Profissão</label>
                        <input name="motherProfession" value={formData.motherProfession || ''} onChange={handleChange} className="w-full text-sm bg-slate-50 py-2 rounded-lg" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input name="motherPhoneResidencial" placeholder="Telefone Residencial" value={formData.motherPhoneResidencial || ''} onChange={handleChange} className="text-xs bg-slate-50 py-1.5 rounded" />
                      <input name="motherPhoneCelular" placeholder="Telefone Celular" value={formData.motherPhoneCelular || ''} onChange={handleChange} className="text-xs bg-slate-50 py-1.5 rounded" />
                      <input name="motherPhoneTrabalho" placeholder="Telefone Trabalho" value={formData.motherPhoneTrabalho || ''} onChange={handleChange} className="text-xs bg-slate-50 py-1.5 rounded" />
                    </div>
                  </div>
                </section>

                {/* Address Section */}
                <section data-tab="endereco" className={activeTab === 'endereco' ? 'space-y-4' : 'hidden'}>
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-2 bg-emerald-600 rounded-full"></div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Endereço e Localização</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs">Zona Residencial*</label>
                      <select required name="residentialZone" value={formData.residentialZone} onChange={handleChange} className="w-full text-sm bg-slate-50 py-2 rounded-lg">
                        <option value="">Selecione</option><option value="Urbana">Urbana</option><option value="Rural">Rural</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs">CEP*</label>
                      <input required name="cep" value={formData.cep} onChange={handleChange} maxLength={9} className="w-full text-sm bg-slate-50 py-2 rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs">Cidade*</label>
                      <input required name="city" value={formData.city} onChange={handleChange} className="w-full text-sm bg-slate-50 py-2 rounded-lg" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs">Rua*</label>
                      <input required name="street" value={formData.street} onChange={handleChange} className="w-full text-sm bg-slate-50 py-2 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs">Número</label>
                        <input name="numero" value={formData.numero || ''} onChange={handleChange} className="w-full text-xs bg-slate-50 py-2 rounded" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs">UF*</label>
                        <input required name="uf" value={formData.uf} onChange={handleChange} maxLength={2} className="w-full text-xs bg-slate-50 py-2 rounded uppercase" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs">Bairro/Distrito*</label>
                      <input required name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full text-sm bg-slate-50 py-2 rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs">Complemento</label>
                      <input name="complemento" value={formData.complemento || ''} onChange={handleChange} className="w-full text-sm bg-slate-50 py-2 rounded-lg" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <h5 className="text-xs font-bold">Contato de Emergência / Responsável</h5>
                  </div>
                  <div className="flex justify-start items-center gap-2 pb-1">
                    <span className="text-xs text-slate-500">Preenchimento rápido:</span>
                    <button type="button" onClick={() => handleFillResponsible('mae')} className="text-[10px] font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 px-2 py-0.5 rounded cursor-pointer">Mãe</button>
                    <button type="button" onClick={() => handleFillResponsible('pai')} className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded cursor-pointer">Pai</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs">Nome do Responsável*</label>
                      <input name="responsibleName" required value={formData.responsibleName} onChange={handleChange} className="w-full text-sm bg-slate-50 py-2 px-3 rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs">Telefone*</label>
                      <input name="responsiblePhone" required value={formData.responsiblePhone} onChange={handleChange} className="w-full text-sm bg-slate-50 py-2 px-3 rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs">CPF do Responsável</label>
                      <input name="responsibleCpf" value={formData.responsibleCpf || ''} onChange={handleChange} className="w-full text-sm bg-slate-50 py-2 px-3 rounded-lg" />
                    </div>
                  </div>
                </section>

                {/* School and Matrícula Section */}
                <section data-tab="escolar" className={activeTab === 'escolar' ? 'space-y-4' : 'hidden'}>
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-2 bg-amber-600 rounded-full"></div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Matrícula Escolar</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs">Série</label>
                      <input name="serie" value={formData.serie || ''} onChange={handleChange} className="w-full text-sm bg-slate-50 py-2 rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs">Turma*</label>
                      <input name="class" required value={formData.class} onChange={handleChange} className="w-full text-sm bg-slate-50 py-2 rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs">Turno</label>
                      <select name="turno" value={formData.turno || 'Matutino'} onChange={handleChange} className="w-full text-sm bg-slate-50 py-2 rounded-lg">
                        <option value="Matutino">Matutino</option><option value="Vespertino">Vespertino</option><option value="Noturno">Noturno</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs">Data Matrícula*</label>
                      <input type="date" name="entryDate" required value={formData.entryDate} onChange={handleChange} className="w-full text-sm bg-slate-50 py-2 rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs">Data de Início na Turma</label>
                      <input name="exercicio" value={formData.exercicio || ''} onChange={handleChange} className="w-full text-sm bg-slate-50 py-2 rounded-lg" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs">Transporte Escolar</label>
                      <select name="schoolTransport" value={formData.schoolTransport || 'Não utiliza'} onChange={handleChange} className="w-full text-xs bg-slate-50 py-1.5 rounded">
                        <option value="Não utiliza">Não utiliza</option><option value="Público">Público</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs">Motorista</label>
                      <input name="motorista" value={formData.motorista || ''} onChange={handleChange} className="w-full text-xs bg-slate-50 py-1.5 rounded" />
                    </div>
                    <div>
                      <label className="text-xs">Status</label>
                      <select name="status" value={formData.status} onChange={handleChange} className="w-full text-xs bg-slate-50 py-1.5 rounded">
                        <option value="Ativo">Ativo</option><option value="Inativo">Inativo</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Necessidades Section */}
                <section data-tab="necessidades" className={activeTab === 'necessidades' ? 'space-y-4' : 'hidden'}>
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="size-2 bg-red-600 rounded-full"></div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Necessidades Especiais</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" name="deficienciaAuditiva" checked={formData.deficienciaAuditiva || false} onChange={handleChange} /> Deficiência Auditiva</label>
                    <label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" name="deficienciaVisual" checked={formData.deficienciaVisual || false} onChange={handleChange} /> Deficiência Visual</label>
                    <label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" name="deficienciaFisica" checked={formData.deficienciaFisica || false} onChange={handleChange} /> Deficiência Física</label>
                    <label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" name="deficienciaIntelectual" checked={formData.deficienciaIntelectual || false} onChange={handleChange} /> Deficiência Intelectual</label>
                    <label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" name="deficienciaAutismo" checked={formData.deficienciaAutismo || false} onChange={handleChange} /> Autismo Infantil</label>
                  </div>

                  <div className="pt-2 border-t">
                    <h5 className="text-xs font-bold pb-2">Recursos Prova Brasil</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="auxilioLedor" checked={formData.auxilioLedor || false} onChange={handleChange} /> Auxílio Ledor</label>
                      <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="auxilioTranscricao" checked={formData.auxilioTranscricao || false} onChange={handleChange} /> Auxílio Transcrição</label>
                      <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="guiaInterprete" checked={formData.guiaInterprete || false} onChange={handleChange} /> Guia Intérprete</label>
                      <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="interpreteLibras" checked={formData.interpreteLibras || false} onChange={handleChange} /> Intérprete Libras</label>
                      <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="leituraLabial" checked={formData.leituraLabial || false} onChange={handleChange} /> Leitura Labial</label>
                      <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="provaAmpliada18" checked={formData.provaAmpliada18 || false} onChange={handleChange} /> Prova Ampliada 18</label>
                    </div>
                  </div>
                </section>
<div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => generateStudentRegistrationPDF(formData)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText size={18} />
                    Imprimir Ficha
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                  >
                    {student ? 'Salvar Alterações' : 'Cadastrar Aluno'}
                  </button>
                </div>
              </form>
            </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
