import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { School, UserPlus, Save, Trash, Edit, CheckSquare, Plus, MapPin, Building, Activity, ShieldCheck, HeartPulse, Sparkles, HardHat } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function SchoolInfoPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
  const [isCreatingSchool, setIsCreatingSchool] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userRole, setUserRole] = useState<string>('Secretaria');

  const [schoolInfo, setSchoolInfo] = useState({
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
    turno_integral: false,
    comp_admin: 0,
    comp_alunos: 0,
    impressoras: 0,
    projetores: 0,
    tv: 0,
    aparelho_som: 0,
    internet_tipo: 'Banda Larga',
    acess_rampas: false,
    acess_elevador: false,
    // Novos campos adicionados (V2)
    sala_diretoria: false,
    sala_professor: false,
    secretaria: false,
    almoxarifado: false,
    cozinha: false,
    despensa: false,
    lavanderia: false,
    patio_coberto: false,
    patio_descoberto: false,
    parque_infantil: false,
    lixo_reciclagem: false,
    esgoto_fossa: false,
    lixo_destino: 'Coleta pública',
    piso_tatil: false,
    corrimao: false,
    portais_largos: false,
    ano_letivo_inicio: '',
    ano_letivo_fim: ''
  });

  const maskPhone = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  const maskCNPJ = (v: string) => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  const maskCPF = (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  const maskCEP = (v: string) => v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1');

  useEffect(() => { loadUserRole(); loadSchoolInfo(); }, []);

  useEffect(() => {
    const cep = schoolInfo.cep ? schoolInfo.cep.replace(/\D/g, '') : '';
    if (cep.length === 8) {
      const fetchAddress = async () => {
        const loadingToast = toast.loading('Buscando CEP...');
        try {
          const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const d = await r.json();
          if (!d.erro) {
            setSchoolInfo(p => ({ ...p, street: d.logradouro || p.street, neighborhood: d.bairro || p.neighborhood, city: d.localidade || p.city, uf: d.uf || p.uf }));
            toast.success('Endereço encontrado!', { id: loadingToast });
          } else toast.error('CEP não encontrado!', { id: loadingToast });
        } catch { toast.error('Erro ao buscar CEP', { id: loadingToast }); }
      };
      fetchAddress();
    }
  }, [schoolInfo.cep]);

  const loadUserRole = async () => {
    const imp = sessionStorage.getItem('impersonated_user');
    if (imp) { setUserRole(JSON.parse(imp).role); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (data?.role) setUserRole(data.role);
    }
  };

  const loadSchoolInfo = async () => {
    try {
      const { data } = await supabase.from('school_info').select('*').order('name');
      setSchools(data || []);
    } catch { console.log('Tabela não encontrada.'); }
  };

  const handleSelectSchool = (s: any) => {
    setSelectedSchool(s);
    setSchoolInfo({ ...s, current_bimester: s.current_bimester || '1º Bimestre', min_grade: s.min_grade || '6.0' });
  };

  const handleNewSchool = () => {
    setIsCreatingSchool(true); setSelectedSchool(null);
    setSchoolInfo({
      name: '', inep: '', cnpj: '', phone: '', email: '', cep: '', street: '', number: '', neighborhood: '', city: '', uf: '', logo_url: '', current_bimester: '1º Bimestre', min_grade: '6.0', director: '', director_cpf: '', zone_type: 'Urbana', capacity: 0, dependencia_adm: 'Municipal', situacao_func: 'Em atividade', forma_ocupacao: 'Próprio', infra_refeitorio: false, infra_quadra: false, infra_biblioteca: false, infra_laboratorio: false, infra_agua_rede: false, infra_agua_poco: false, infra_energia_rede: false, infra_esgoto_rede: false, infra_lixo_coleta: false, infra_internet: false, infra_banheiro_pne: false, alimentacao_escolar: false, atendimento_aee: false, etapas_infantil: false, etapas_fundamental1: false, etapas_fundamental2: false, turno_matutino: false, turno_vespertino: false, turno_integral: false, comp_admin: 0, comp_alunos: 0, impressoras: 0, projetores: 0, tv: 0, aparelho_som: 0, internet_tipo: 'Banda Larga', acess_rampas: false, acess_elevador: false, sala_diretoria: false, sala_professor: false, secretaria: false, almoxarifado: false, cozinha: false, despensa: false, lavanderia: false, patio_coberto: false, patio_descoberto: false, parque_infantil: false, lixo_reciclagem: false, esgoto_fossa: false,      lixo_destino: 'Coleta pública', piso_tatil: false, corrimao: false, portais_largos: false,
      ano_letivo_inicio: '', ano_letivo_fim: ''
    });
  };

  const handleUpdateSchoolInfo = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('school_info').upsert({ id: (schoolInfo as any).id || undefined, ...schoolInfo });
      if (error) throw error;
      toast.success('Cadastro atualizado com sucesso!');
      loadSchoolInfo(); setSelectedSchool(null); setIsCreatingSchool(false);
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  };

  const handleDeleteSchool = async (s: any) => { if (window.confirm(`Excluir a escola ${s.name}?`)) { await supabase.from('school_info').delete().eq('id', s.id); loadSchoolInfo(); } };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const f = e.target.files[0];
      const fn = `school-logo-${Math.random()}.${f.name.split('.').pop()}`;
      await supabase.storage.from('student-documents').upload(fn, f);
      const { data: { publicUrl } } = supabase.storage.from('student-documents').getPublicUrl(fn);
      setSchoolInfo({ ...schoolInfo, logo_url: publicUrl });
      toast.success('Logo enviada!');
    } catch (err: any) { toast.error(err.message); } finally { setUploading(false); }
  };

  const checkItemStyle = "flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/20 p-2 rounded-lg border border-slate-100 hover:border-slate-200 transition-all cursor-pointer";

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto h-full bg-slate-50/40 dark:bg-slate-950/20">
      {/* HEADER SUPERIOR */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/40 rounded-xl text-blue-600"><School size={24} /></div>
          <div><h2 className="text-lg font-black text-slate-900 dark:text-white">Escolas e Censo</h2><p className="text-xs text-slate-400">Dados estruturais exigidos pelo INEP</p></div>
        </div>
        {userRole === 'Admin' && !selectedSchool && !isCreatingSchool && (
          <button onClick={handleNewSchool} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20"><Plus size={16} /> Cadastrar Nova</button>
        )}
      </div>

      {userRole === 'Admin' && !selectedSchool && !isCreatingSchool ? (
        // LISTA INICIAL (ADMIN)
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm"><thead className="bg-slate-50 dark:bg-slate-800/60 border-b"><tr><th className="px-6 py-3 font-bold text-slate-500">Logotipo</th><th className="px-6 py-3 font-bold text-slate-500">Nome da Escola</th><th className="px-6 py-3 font-bold text-slate-500">INEP</th><th className="px-6 py-3 font-bold text-slate-500 text-center">Ações</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">{schools.map((s: any) => (<tr key={s.id} className="hover:bg-slate-50/50"><td className="px-6 py-3"><div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border">{s.logo_url ? <img src={s.logo_url} className="object-cover size-full" /> : <School size={16} className="text-slate-400" />}</div></td><td className="px-6 py-3 font-medium text-slate-800 dark:text-white">{s.name}</td><td className="px-6 py-3 text-slate-500">{s.inep || 'S/IN'}</td><td className="px-6 py-3 text-center"><div className="flex justify-center gap-2"><button onClick={() => handleSelectSchool(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600" title="Editar"><Edit size={16} /></button><button onClick={() => handleDeleteSchool(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600" title="Excluir"><Trash size={16} /></button></div></td></tr>))}</tbody></table>
        </div>
      ) : (
        // FORMULÁRIO DE PREENCHIMENTO
        <div className="space-y-6">
          <div className="flex justify-start">{userRole === 'Admin' && <button onClick={() => { setSelectedSchool(null); setIsCreatingSchool(false); }} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border">← Voltar para lista</button>}</div>

          {/* DADOS GERAIS E LOGO */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col items-center justify-center space-y-4">
              <h4 className="text-xs font-bold text-slate-400">LOGOTIPO INSTITUCIONAL</h4>
              <div className="size-28 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-100">
                {schoolInfo.logo_url ? <img src={schoolInfo.logo_url} className="w-full h-full object-cover" /> : <School size={40} className="text-slate-300" />}
              </div>
              <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold">
                <Plus size={14} /> {uploading ? 'Aguarde...' : 'Carregar'}
                <input type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" />
              </label>
            </div>

            <div className="md:col-span-3 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2"><Building size={18} className="text-blue-600" /> Informações de Identificação</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">NOME DO COLÉGIO</label><input type="text" value={schoolInfo.name} onChange={e => setSchoolInfo({ ...schoolInfo, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-600" /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">CÓDIGO INEP</label><input type="text" value={schoolInfo.inep} onChange={e => setSchoolInfo({ ...schoolInfo, inep: e.target.value.replace(/\D/g, '').slice(0, 8) })} maxLength={8} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-1.5 text-sm" /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">CNPJ</label><input type="text" value={schoolInfo.cnpj} onChange={e => setSchoolInfo({ ...schoolInfo, cnpj: maskCNPJ(e.target.value) })} maxLength={18} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-1.5 text-sm" /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">DIRETOR(A)</label><input type="text" value={schoolInfo.director} onChange={e => setSchoolInfo({ ...schoolInfo, director: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-1.5 text-sm" /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">CPF DO DIRETOR</label><input type="text" value={schoolInfo.director_cpf} onChange={e => setSchoolInfo({ ...schoolInfo, director_cpf: maskCPF(e.target.value) })} maxLength={14} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-1.5 text-sm" /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">TIPO DE ZONA</label><select value={schoolInfo.zone_type} onChange={e => setSchoolInfo({ ...schoolInfo, zone_type: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-1.5 text-sm"><option value="Urbana">Urbana</option><option value="Rural">Rural</option></select></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">SITUAÇÃO</label><select value={schoolInfo.situacao_func} onChange={e => setSchoolInfo({ ...schoolInfo, situacao_func: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-1.5 text-sm"><option value="Em atividade">Em atividade</option><option value="Paralisada">Paralisada</option><option value="Extinta">Extinta</option></select></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">DEPENDÊNCIA ADM.</label><select value={schoolInfo.dependencia_adm} onChange={e => setSchoolInfo({ ...schoolInfo, dependencia_adm: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-1.5 text-sm"><option value="Municipal">Municipal</option><option value="Estadual">Estadual</option><option value="Federal">Federal</option><option value="Privada">Privada</option></select></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">FORMA OCUPAÇÃO</label><select value={schoolInfo.forma_ocupacao} onChange={e => setSchoolInfo({ ...schoolInfo, forma_ocupacao: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-1.5 text-sm"><option value="Próprio">Próprio</option><option value="Alugado">Alugado</option><option value="Cedido">Cedido</option><option value="Outros">Outros</option></select></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">INÍCIO ANO LETIVO</label><input type="date" value={schoolInfo.ano_letivo_inicio || ''} onChange={e => setSchoolInfo({ ...schoolInfo, ano_letivo_inicio: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-1.5 text-sm" /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">TÉRMINO ANO LETIVO</label><input type="date" value={schoolInfo.ano_letivo_fim || ''} onChange={e => setSchoolInfo({ ...schoolInfo, ano_letivo_fim: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-1.5 text-sm" /></div>
              </div>
            </div>
          </div>

          {/* QUADRADO: ENDEREÇO */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2"><MapPin size={18} className="text-blue-600" /> Endereçamento da instituição</h3>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">CEP</label><input type="text" value={schoolInfo.cep || ''} onChange={e => setSchoolInfo({ ...schoolInfo, cep: maskCEP(e.target.value) })} maxLength={9} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-1.5 text-sm border-blue-100 focus:ring-2 focus:ring-blue-600" /></div>
              <div className="md:col-span-2 space-y-1"><label className="text-[10px] font-bold text-slate-400">LOGRADOURO</label><input type="text" value={schoolInfo.street} onChange={e => setSchoolInfo({ ...schoolInfo, street: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-1.5 text-sm" /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">NÚMERO</label><input type="text" value={schoolInfo.number} onChange={e => setSchoolInfo({ ...schoolInfo, number: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-1.5 text-sm" /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">BAIRRO</label><input type="text" value={schoolInfo.neighborhood} onChange={e => setSchoolInfo({ ...schoolInfo, neighborhood: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-1.5 text-sm" /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400">CIDADE</label><input type="text" value={schoolInfo.city} onChange={e => setSchoolInfo({ ...schoolInfo, city: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-1.5 text-sm" /></div>
            </div>
          </div>

          {/* QUADRADO: CÔMODOS E DEPENDÊNCIAS (NOVO V2) */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2"><Sparkles size={18} className="text-blue-600" /> Dependências Físicas (Espaços)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { k: 'sala_diretoria', l: 'Diretoria' }, { k: 'sala_professor', l: 'Sala de Professores' }, { k: 'secretaria', l: 'Secretaria' },
                { k: 'almoxarifado', l: 'Almoxarifado' }, { k: 'cozinha', l: 'Cozinha' }, { k: 'despensa', l: 'Despensa' },
                { k: 'lavanderia', l: 'Lavanderia' }, { k: 'patio_coberto', l: 'Pátio Coberto' }, { k: 'patio_descoberto', l: 'Pátio Descoberto' },
                { k: 'parque_infantil', l: 'Parque Infantil' }, { k: 'infra_refeitorio', l: 'Refeitório' }, { k: 'infra_biblioteca', l: 'Biblioteca' },
                { k: 'infra_laboratorio', l: 'Laboratório Informática' }, { k: 'infra_quadra', l: 'Quadra Esportiva' }
              ].map(item => (
                <label key={item.k} className={checkItemStyle}>
                  <input type="checkbox" checked={(schoolInfo as any)[item.k]} onChange={e => setSchoolInfo({ ...schoolInfo, [item.k]: e.target.checked })} className="rounded text-blue-600" />
                  <span>{item.l}</span>
                </label>
              ))}
            </div>
          </div>

          {/* GRID COMPOSTO: REDES e SUSTENTABILIDADE e ACESSIBILIDADE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SUSTENTABILIDADE E REDES */}
            <div className="p-6 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5"><HeartPulse size={16} className="text-emerald-500" /> Redes e Recursos</h3>
              <div className="space-y-2">
                {[
                  { k: 'infra_agua_rede', l: 'Água Rede Pública' }, { k: 'infra_agua_poco', l: 'Água Poço' },
                  { k: 'infra_energia_rede', l: 'Energia Elétrica' }, { k: 'infra_esgoto_rede', l: 'Esgoto Rede Pública' },
                  { k: 'infra_lixo_coleta', l: 'Coleta de Lixo' }, { k: 'infra_internet', l: 'Internet para Alunos' }
                ].map(i => (
                  <label key={i.k} className={checkItemStyle}>
                    <input type="checkbox" checked={(schoolInfo as any)[i.k]} onChange={e => setSchoolInfo({ ...schoolInfo, [i.k]: e.target.checked })} />
                    <span>{i.l}</span>
                  </label>
                ))}
                <div className="pt-2">
                  <label className="text-[10px] font-bold text-slate-400">DESTINO FINAL DO LIXO</label>
                  <select value={schoolInfo.lixo_destino} onChange={e => setSchoolInfo({ ...schoolInfo, lixo_destino: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-1.5 text-xs">
                    <option value="Coleta pública">Coleta pública</option>
                    <option value="Queima">Queima / Incineração</option>
                    <option value="Enterra">Aterramento</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ACESSIBILIDADE E ATENDIMENTOS */}
            <div className="p-6 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5"><HardHat size={16} className="text-amber-500" /> Inclusão e Acessibilidade</h3>
              <div className="space-y-2">
                {[
                  { k: 'infra_banheiro_pne', l: 'Sanitário Acessível PNE' }, { k: 'acess_rampas', l: 'Rampas de Acesso' },
                  { k: 'acess_elevador', l: 'Elevadores' }, { k: 'piso_tatil', l: 'Piso Tátil Alertivo' },
                  { k: 'corrimao', l: 'Corrimão/Guarda-corpo' }, { k: 'portais_largos', l: 'Portas/Vãos Largos (>=80cm)' },
                  { k: 'alimentacao_escolar', l: 'Alimentação Escolar para Todos' }, { k: 'atendimento_aee', l: 'Atendimento AEE (Mod. Inclusão)' }
                ].map(i => (
                  <label key={i.k} className={checkItemStyle}>
                    <input type="checkbox" checked={(schoolInfo as any)[i.k]} onChange={e => setSchoolInfo({ ...schoolInfo, [i.k]: e.target.checked })} />
                    <span>{i.l}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ETAPAS E TURNOS */}
            <div className="p-6 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5"><ShieldCheck size={16} className="text-blue-500" /> Operação e Ciclos</h3>
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 border-b pb-1">ETAPAS ATENDIDAS</h4>
                {[{ k: 'etapas_infantil', l: 'Infantil / Creche' }, { k: 'etapas_fundamental1', l: 'Fundamental I' }, { k: 'etapas_fundamental2', l: 'Fundamental II' }].map(i => (
                  <label key={i.k} className={checkItemStyle}><input type="checkbox" checked={(schoolInfo as any)[i.k]} onChange={e => setSchoolInfo({ ...schoolInfo, [i.k]: e.target.checked })} /><span>{i.l}</span></label>
                ))}
                <h4 className="text-[10px] font-bold text-slate-500 border-b pb-1 mt-3">TURNOS DE AULA</h4>
                {[{ k: 'turno_matutino', l: 'Matutino' }, { k: 'turno_vespertino', l: 'Vespertino' }, { k: 'turno_integral', l: 'Tempo Integral' }].map(i => (
                  <label key={i.k} className={checkItemStyle}><input type="checkbox" checked={(schoolInfo as any)[i.k]} onChange={e => setSchoolInfo({ ...schoolInfo, [i.k]: e.target.checked })} /><span>{i.l}</span></label>
                ))}
              </div>
            </div>
          </div>

          {/* EQUIPAMENTOS QUANTITATIVOS */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2"><Activity size={18} className="text-blue-600" /> Instalações de TI e Aparelhos</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[
                { k: 'comp_admin', l: 'Computadores Admin.' }, { k: 'comp_alunos', l: 'Computadores Alunos' },
                { k: 'impressoras', l: 'Impressoras' }, { k: 'projetores', l: 'Projetores/Show' },
                { k: 'tv', l: 'Televisores' }, { k: 'aparelho_som', l: 'Som / Microfones' }
              ].map(i => (
                <div key={i.k} className="space-y-1 bg-slate-50 dark:bg-slate-800/20 p-2 rounded-xl border border-slate-100 flex flex-col items-center">
                  <label className="text-[9px] font-bold text-slate-500 text-center uppercase">{i.l}</label>
                  <input type="number" value={(schoolInfo as any)[i.k]} onChange={e => setSchoolInfo({ ...schoolInfo, [i.k]: Math.max(0, Number(e.target.value)) })} className="w-16 bg-white dark:bg-slate-800 border rounded-lg px-2 py-1 text-center text-sm font-bold outline-none" min={0} />
                </div>
              ))}
            </div>
          </div>

          {/* SALVAMENTO */}
          <div className="flex justify-end sticky bottom-4 z-40 bg-white dark:bg-slate-900 gap-2 border p-3 rounded-2xl shadow-md border-blue-500/20">
             <button onClick={handleUpdateSchoolInfo} disabled={saving} className="flex items-center gap-1.5 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20">
               <Save size={16} /> {saving ? 'Atualizando...' : 'Salvar Formulário Completo'}
             </button>
          </div>

        </div>
      )}
    </div>
  );
}
