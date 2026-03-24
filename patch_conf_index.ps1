$filePath = "C:\Users\ppaul\Downloads\pmj---educacional (1)\src\pages\ConfiguracoesPage.tsx"
$lines = Get-Content -Path $filePath
$insertIndex = -1

for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "Parâmetros do Sistema") {
        $insertIndex = $i
        break
    }
}

if ($insertIndex -ne -1) {
    # We want to insert above the div element containing Parâmetros (usually 1 line above the h3)
    # line i is h3. line i-1 is <div ...>
    $newCard = @'
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
                                       </div>
                                  </div>
                             </div>

'@

    # insert between index-2 and index-1 (just above card wrapper)
    $beforeLines = $lines[0..($insertIndex - 2)]
    $afterLines = $lines[($insertIndex - 1)..($lines.Count - 1)]
    
    $merged = @()
    $merged += $beforeLines
    $merged += $newCard
    $merged += $afterLines
    
    $merged | Set-Content -Path $filePath -Encoding utf8
    Write-Host "Success Index Splice Layout!"
} else {
    Write-Host "Target Index not found!"
}
