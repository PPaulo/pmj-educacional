with open(r"c:\Users\ppaul\Downloads\pmj---educacional (1)\src\pages\ConfiguracoesPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block_1 = """                                            <div className="space-y-1">
                                               <label className="text-xs font-bold text-slate-500">CARGO INICIAL</label>
                                               <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm">
                                                    <option value="Secretaria">Secretaria</option>
                                                    <option value="Professor">Professor</option>
                                                    <option value="Diretor">Diretor</option>
                                                    {userRole === 'Admin' && <option value="Admin">Admin</option>}
                                               </select>
                                            </div>"""

new_block_1 = """                                            <div className="space-y-1">
                                               <label className="text-xs font-bold text-slate-500">CARGO INICIAL</label>
                                               <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm">
                                                    <option value="Secretaria">Secretária (Geral)</option>
                                                    <option value="Professor">Professor(a)</option>
                                                    <option value="Diretor">Diretor(a)</option>
                                                    <option value="Coordenador">Coordenador(a)</option>
                                                    <option value="Nutricionista">Nutricionista</option>
                                                    {userRole === 'Admin' && <option value="Admin">Admin</option>}
                                               </select>
                                            </div>"""

old_block_2 = """                                            <div className="space-y-1">
                                               <label className="text-xs font-bold text-slate-500">CARGO</label>
                                               <select value={editUserRole} onChange={e => setEditUserRole(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm">
                                                    <option value="Secretaria">Secretaria</option>
                                                    <option value="Professor">Professor</option>
                                                    <option value="Diretor">Diretor</option>
                                                    {userRole === 'Admin' && <option value="Admin">Admin</option>}
                                               </select>
                                            </div>"""

new_block_2 = """                                            <div className="space-y-1">
                                               <label className="text-xs font-bold text-slate-500">CARGO</label>
                                               <select value={editUserRole} onChange={e => setEditUserRole(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2 text-sm">
                                                    <option value="Secretaria">Secretária (Geral)</option>
                                                    <option value="Professor">Professor(a)</option>
                                                    <option value="Diretor">Diretor(a)</option>
                                                    <option value="Coordenador">Coordenador(a)</option>
                                                    <option value="Nutricionista">Nutricionista</option>
                                                    {userRole === 'Admin' && <option value="Admin">Admin</option>}
                                               </select>
                                            </div>"""

# Replace with simpler find in case of leading space variations
if "<option value=\"Secretaria\">Secretaria</option>" in content:
    content = content.replace(
        "<option value=\"Secretaria\">Secretaria</option>\n                                                    <option value=\"Professor\">Professor</option>\n                                                    <option value=\"Diretor\">Diretor</option>",
        "<option value=\"Secretaria\">Secretária (Geral)</option>\n                                                    <option value=\"Professor\">Professor(a)</option>\n                                                    <option value=\"Diretor\">Diretor(a)</option>\n                                                    <option value=\"Coordenador\">Coordenador(a)</option>\n                                                    <option value=\"Nutricionista\">Nutricionista</option>"
    )

with open(r"c:\Users\ppaul\Downloads\pmj---educacional (1)\src\pages\ConfiguracoesPage.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Replacement done.")
