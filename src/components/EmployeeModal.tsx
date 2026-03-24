import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Employee } from '../types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Omit<Employee, 'id'> & { id?: string }) => void;
  employee?: Employee | null;
  existingCPFs?: string[];
}

type Tab = 'pessoais' | 'endereco' | 'profissional';

import toast from 'react-hot-toast';

export function EmployeeModal({ isOpen, onClose, onSave, employee, existingCPFs = [] }: EmployeeModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('pessoais');
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    name: '',
    role: '',
    department: '',
    avatar: '',
    cpf: '',
    rg: '',
    birthDate: '',
    gender: '',
    maritalStatus: '',
    email: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    admissionDate: '',
    workload: '',
    status: 'Ativo',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('pessoais');
      if (employee) {
        setFormData(employee);
      } else {
        setFormData({
          name: '',
          role: '',
          department: '',
          avatar: '',
          cpf: '',
          rg: '',
          birthDate: '',
          gender: '',
          maritalStatus: '',
          email: '',
          phone: '',
          cep: '',
          street: '',
          number: '',
          neighborhood: '',
          city: '',
          state: '',
          admissionDate: '',
          workload: '',
          status: 'Ativo',
        });
      }
    }
  }, [isOpen, employee]);

  useEffect(() => {
    const cep = formData.cep ? formData.cep.replace(/\D/g, '') : '';
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
              state: data.uf || prev.state,
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
      const isOriginalCPF = employee?.cpf === formData.cpf;
      if (existingCPFs.includes(formData.cpf) && !isOriginalCPF) {
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
    
    onSave(formData);
    onClose();
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

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      setFormData((prev) => ({ ...prev, [name]: maskCPF(value) }));
      return;
    }
    if (name === 'cep') {
      setFormData((prev) => ({ ...prev, [name]: maskCEP(value) }));
      return;
    }
    if (name === 'phone') {
      setFormData((prev) => ({ ...prev, [name]: maskPhone(value) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
                Cadastrar Novo Funcionário
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex px-6 border-b border-slate-100 dark:border-slate-800 gap-6 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('pessoais')}
                className={`py-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'pessoais'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Pessoais
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('endereco')}
                className={`py-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'endereco'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Endereço
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('profissional')}
                className={`py-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'profissional'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Profissional
              </button>
            </div>

            <form onSubmit={handleSubmit} onInvalidCapture={handleInvalid} className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Personal Information */}
              <section data-tab="pessoais" className={activeTab === 'pessoais' ? 'space-y-4' : 'hidden'}>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="size-2 bg-blue-600 rounded-full"></div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Informações Pessoais</h4>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome Completo*</label>
                    <input
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                      placeholder="Ex: Maria Santos"
                    />
                  </div>

                  <div className="shrink-0 space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block text-center">Foto</label>
                    <div className="relative group">
                      <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm flex items-center justify-center">
                        {formData.avatar ? (
                          <img src={formData.avatar} alt="Preview" className="size-full object-cover" />
                        ) : (
                          <ImageIcon className="text-slate-300" size={24} />
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="absolute -bottom-1 -right-1 size-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all border-2 border-white dark:border-slate-900"
                        title="Alterar Foto"
                      >
                        <Upload size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CPF*</label>
                    <input
                      required
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      maxLength={14}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">RG (Opcional)</label>
                    <input
                      name="rg"
                      value={formData.rg}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                      placeholder="00.000.000-0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data de Nasc.*</label>
                    <input
                      required
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sexo*</label>
                    <select
                      required
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                    >
                      <option value="">Selecione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado Civil</label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                    >
                      <option value="">Selecione</option>
                      <option value="Solteiro(a)">Solteiro(a)</option>
                      <option value="Casado(a)">Casado(a)</option>
                      <option value="Divorciado(a)">Divorciado(a)</option>
                      <option value="Viúvo(a)">Viúvo(a)</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Address Section */}
              <section data-tab="endereco" className={activeTab === 'endereco' ? 'space-y-4' : 'hidden'}>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="size-2 bg-emerald-600 rounded-full"></div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Contato e Endereço</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                      placeholder="Ex: maria.santos@escola.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Telefone*</label>
                    <input
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CEP*</label>
                    <input
                      required
                      name="cep"
                      value={formData.cep}
                      onChange={handleChange}
                      maxLength={9}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                      placeholder="00000-000"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cidade*</label>
                    <input
                      required
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rua*</label>
                    <input
                      required
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                      placeholder="Nome da rua"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Número</label>
                    <input
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bairro*</label>
                    <input
                      required
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                      placeholder="Ex: Centro"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">UF*</label>
                    <input
                      required
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      maxLength={2}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white uppercase"
                      placeholder="Ex: SP"
                    />
                  </div>
                </div>
              </section>

              {/* Professional Section */}
              <section data-tab="profissional" className={activeTab === 'profissional' ? 'space-y-4' : 'hidden'}>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="size-2 bg-amber-600 rounded-full"></div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Informações Profissionais</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cargo*</label>
                    <select
                      required
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                    >
                      <option value="">Selecione</option>
                      <option value="Diretor(a)">Diretor(a)</option>
                      <option value="Vice-Diretor(a)">Vice-Diretor(a)</option>
                      <option value="Coordenador(a) Pedagógico(a)">Coordenador(a) Pedagógico(a)</option>
                      <option value="Secretário(a) Escolar">Secretário(a) Escolar</option>
                      <option value="Professor(a) Titular">Professor(a) Titular</option>
                      <option value="Professor(a) Auxiliar">Professor(a) Auxiliar</option>
                      <option value="Auxiliar de Classe">Auxiliar de Classe</option>
                      <option value="Inspetor(a) de Alunos">Inspetor(a) de Alunos</option>
                      <option value="Orientador(a) Educacional">Orientador(a) Educacional</option>
                      <option value="Auxiliar de Serviços Gerais">Auxiliar de Serviços Gerais</option>
                      <option value="Merendeiro(a)">Merendeiro(a)</option>
                      <option value="Porteiro / Vigia">Porteiro / Vigia</option>
                      <option value="Monitor(a)">Monitor(a)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Departamento*</label>
                    <select
                      required
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                    >
                      <option value="">Selecione</option>
                      <option value="Direção">Direção</option>
                      <option value="Coordenação Pedagógica">Coordenação Pedagógica</option>
                      <option value="Secretaria">Secretaria</option>
                      <option value="Corpo Docente">Corpo Docente</option>
                      <option value="Apoio Administrativo">Apoio Administrativo</option>
                      <option value="Serviços Gerais / Limpeza">Serviços Gerais / Limpeza</option>
                      <option value="Alimentação / Cantina">Alimentação / Cantina</option>
                      <option value="Segurança">Segurança</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data de Admissão*</label>
                    <input
                      required
                      type="date"
                      name="admissionDate"
                      value={formData.admissionDate}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status*</label>
                    <select
                      required
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Afastado">Afastado</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Carga Horária Semanal</label>
                  <select
                    name="workload"
                    value={formData.workload}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
                  >
                    <option value="">Selecione</option>
                    <option value="10h">10h</option>
                    <option value="20h">20h</option>
                    <option value="30h">30h</option>
                    <option value="40h">40h</option>
                    <option value="44h">44h</option>
                  </select>
                </div>
              </section>

              {/* Actions */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-600/25 transition-all"
                >
                  Salvar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
