const fs = require('fs');

let file = fs.readFileSync('src/pages/ConfiguracoesPage.tsx', 'utf8');

const startMarker = '<label className="text-xs font-bold text-slate-400">NOME DO USUÁRIO</label>';
const endMarker = '                            </div>\n                        </div>\n                    ) : (';

const startIdx = file.indexOf(startMarker);
const endIdx = file.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
    console.error("Markers not found");
    process.exit(1);
}

const prefix = file.slice(0, startIdx + startMarker.length);
const suffix = file.slice(endIdx);

const payload = `
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
                                                <td className="px-6 py-3 text-slate-500">{sch.city ? \`\${sch.city}/\${sch.uf || ''}\` : 'Não informado'}</td>
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
`;

fs.writeFileSync('src/pages/ConfiguracoesPage.tsx', prefix + payload + suffix);
console.log("Successfully repaired ConfiguracoesPage.tsx");
