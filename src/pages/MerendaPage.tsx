import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { 
  Soup, 
  Users, 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  CalendarDays,
  Utensils,
  AlertTriangle,
  CheckCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { snakeToCamel } from '../lib/utils';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'menu', label: 'Cardápio Semanal', icon: CalendarDays },
  { id: 'restrictions', label: 'Restrições Alimentares', icon: Users },
  { id: 'inventory', label: 'Controle de Estoque', icon: Package },
];

const mockMenu: any[] = [];
const mockInventory: any[] = [];

export function MerendaPage() {
  const [activeTab, setActiveTab] = useState('menu');
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // States para gerenciar edições (simulado)
  const [inventory, setInventory] = useState(mockInventory);
  const [menu, setMenu] = useState(mockMenu);

  // Admin Controls
  const [userRole, setUserRole] = useState('Secretaria');
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState('Todas');
  const [schoolsList, setSchoolsList] = useState<any[]>([]);

  // Carregar Configurações
  useEffect(() => {
    const loadConfig = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         const { data: profile } = await supabase.from('profiles').select('role, school_id').eq('id', user.id).single();
         if (profile) {
             setUserRole(profile.role);
             setUserSchoolId(profile.school_id);
             if (profile.role === 'Admin') {
                 const { data } = await supabase.from('school_info').select('id, name');
                 setSchoolsList(data || []);
             }
         }
      }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    if (activeTab === 'restrictions') {
      loadRestrictions();
    } else if (activeTab === 'menu') {
      loadMenu();
    } else if (activeTab === 'inventory') {
      loadInventory();
    }
  }, [activeTab, schoolFilter, userRole, userSchoolId]);

  const loadRestrictions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('students')
        .select('id, name, class, alergias, observations')
        .not('alergias', 'is', null) // Traz quem tem alergia alimentada
        .not('alergias', 'eq', '')
        .order('name');

      if (userRole !== 'Admin' && userSchoolId) {
           query = query.eq('school_id', userSchoolId);
      } else if (userRole === 'Admin' && schoolFilter !== 'Todas') {
           query = query.eq('school_id', schoolFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar restrições.');
    } finally {
      setLoading(false);
    }
  };

  const loadMenu = async () => {
    setLoading(true);
    try {
      let query = supabase.from('merenda_menu').select('*').order('created_at');
      if (userRole !== 'Admin' && userSchoolId) {
          query = query.eq('school_id', userSchoolId);
      } else if (userRole === 'Admin' && schoolFilter !== 'Todas') {
          query = query.eq('school_id', schoolFilter);
      }
      const { data } = await query;
      setMenu(data || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    setLoading(true);
    try {
      let query = supabase.from('merenda_inventory').select('*').order('item_name');
      if (userRole !== 'Admin' && userSchoolId) {
          query = query.eq('school_id', userSchoolId);
      } else if (userRole === 'Admin' && schoolFilter !== 'Todas') {
          query = query.eq('school_id', schoolFilter);
      }
      const { data } = await query;
      setInventory(data || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(std => 
    std.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    std.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = inventory.filter(i => i.quantity < i.minQuantity).length;

  return (
    <>
      <Header title="Gestão de Merenda" />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Soup className="text-amber-500" size={32} /> Merenda Escolar
            </h1>
            <p className="text-slate-500 text-sm">Controle de nutrição, saúde alimentar dos alunos e suprimentos.</p>
          </div>
          
          <div className="flex items-center gap-2">
             {userRole === 'Admin' && (
               <div className="relative">
                  <select 
                    value={schoolFilter}
                    onChange={(e) => setSchoolFilter(e.target.value)}
                    className="appearance-none pl-10 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors dark:text-white cursor-pointer focus:ring-2 focus:ring-blue-600 outline-none max-w-[200px] truncate"
                  >
                    <option value="Todas">Todas as Escolas</option>
                    {schoolsList.map(s => (
                       <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <Soup className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
               </div>
             )}

             <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-800/50 text-xs font-bold">
                 <AlertTriangle size={14} /> {lowStockCount} itens críticos em estoque
             </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
           {/* 1. ABA CARDÁPIO */}
           {activeTab === 'menu' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Opções Gerais do Cardápio Semanal</h3>
                    <button onClick={() => toast('Em breve: Customização de cardápio!')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"><Plus size={14} /> Novo Cardápio</button>
                </div>
                
                {menu.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {menu.map((m: any) => (
                            <div key={m.day} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:shadow-md transition">
                                 <h4 className="font-black text-blue-600 dark:text-blue-400 text-sm border-b pb-2 mb-3">{m.day}</h4>
                                 <div className="space-y-3 flex-1 text-xs">
                                     <div>
                                         <span className="font-bold text-slate-400">Café da Manhã:</span>
                                         <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">{m.breakfast}</p>
                                     </div>
                                 </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl">Nenhum cardápio cadastrado. Toque em "+ Novo Cardápio" para configurar.</div>
                )}
             </motion.div>
           )}

           {/* 2. ABA RESTRICOES */}
           {activeTab === 'restrictions' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                 <div className="flex justify-between items-center flex-wrap gap-2">
                     <div className="relative flex-1 max-w-sm">
                          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                          <input type="text" placeholder="Pesquisar por aluno ou turma..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-xl bg-white dark:bg-slate-900 text-sm outline-none" />
                     </div>
                 </div>

                 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                     <table className="w-full text-left border-collapse text-sm">
                         <thead>
                              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                                   <th className="px-6 py-3 font-bold text-slate-600">Alunos com Alertas de Saúde</th>
                                   <th className="px-6 py-3 font-bold text-slate-600">Turma</th>
                                   <th className="px-6 py-3 font-bold text-slate-600">Alergia / Restrição</th>
                              </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                              {loading ? (
                                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">Carregando dados...</td></tr>
                              ) : filteredStudents.length > 0 ? (
                                  filteredStudents.map(std => (
                                      <tr key={std.id} className="hover:bg-slate-50/50">
                                          <td className="px-6 py-3 font-medium text-slate-800 dark:text-white">{std.name}</td>
                                          <td className="px-6 py-3 font-semibold text-xs text-slate-500">{std.class}</td>
                                          <td className="px-6 py-3">
                                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-bold"><AlertTriangle size={12}/> {std.alergias}</span>
                                          </td>
                                      </tr>
                                  ))
                              ) : (
                                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">Nenhum aluno com restrições alimentares encontrado.</td></tr>
                              )}
                         </tbody>
                     </table>
                 </div>
             </motion.div>
           )}

           {/* 3. ABA ESTOQUE */}
           {activeTab === 'inventory' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                 <div className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-900 dark:text-white">Almoxarifado da Cozinha</h3>
                      <button onClick={() => toast('Em breve: Adição/Saída de estoque!')} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold"><Plus size={14} /> Novo Item</button>
                 </div>

                 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                     <table className="w-full text-left border-collapse text-sm">
                         <thead>
                              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                                   <th className="px-6 py-3 font-bold text-slate-600">Item</th>
                                   <th className="px-6 py-3 font-bold text-slate-600">Categoria</th>
                                   <th className="px-6 py-3 font-bold text-slate-600">Saldo Atual</th>
                                   <th className="px-6 py-3 font-bold text-slate-600">Qtd Mínima</th>
                                   <th className="px-6 py-3 font-bold text-slate-600 text-center">Status</th>
                              </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                              {inventory.length > 0 ? (
                                  inventory.map((i: any) => {
                                      const isLow = i.quantity < i.minQuantity;
                                      return (
                                          <tr key={i.id} className="hover:bg-slate-50/50">
                                              <td className="px-6 py-3 font-bold text-slate-800 dark:text-white">{i.item}</td>
                                              <td className="px-6 py-3 text-slate-500 text-xs">{i.category}</td>
                                              <td className="px-6 py-3 font-black text-slate-900 dark:text-white">{i.quantity} {i.unit}</td>
                                              <td className="px-6 py-3 text-slate-400 text-xs">{i.minQuantity} {i.unit}</td>
                                              <td className="px-6 py-3 text-center">
                                                  {isLow ? (
                                                      <span className="inline-flex px-2 py-1 rounded bg-red-100 text-red-700 text-[10px] font-black uppercase">Crítico</span>
                                                  ) : (
                                                      <span className="inline-flex px-2 py-1 rounded bg-green-100 text-green-700 text-[10px] font-black uppercase">Normal</span>
                                                  )}
                                              </td>
                                          </tr>
                                      )
                                  })
                              ) : (
                                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Nenhum suprimento no estoque. Para começar, adicione um novo item.</td></tr>
                              )}
                         </tbody>
                     </table>
                 </div>
             </motion.div>
           )}
        </AnimatePresence>
      </div>
    </>
  );
}
