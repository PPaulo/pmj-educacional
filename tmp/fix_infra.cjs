const fs = require('fs');
const file = 'c:\\Users\\ppaul\\Downloads\\pmj---educacional (1)\\src\\pages\\ConfiguracoesPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const infraAddition = `
                                             <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                  <input type="checkbox" checked={schoolInfo.infra_agua_rede} onChange={e => setSchoolInfo({...schoolInfo, infra_agua_rede: e.target.checked})} /> Água (Rede Pública)
                                             </label>
                                             <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                  <input type="checkbox" checked={schoolInfo.infra_agua_poco} onChange={e => setSchoolInfo({...schoolInfo, infra_agua_poco: e.target.checked})} /> Água (Poço)
                                             </label>
                                             <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                  <input type="checkbox" checked={schoolInfo.infra_energia_rede} onChange={e => setSchoolInfo({...schoolInfo, infra_energia_rede: e.target.checked})} /> Energia Elétrica
                                             </label>
`;

const labLabelRegex = /<label className="flex items-center gap-2 text-sm[^>]*>[\s\S]*?infra_laboratorio[\s\S]*?<\/label>/;
const labMatch = content.match(labLabelRegex);
if (labMatch) {
    content = content.replace(labMatch[0], labMatch[0] + infraAddition);
}

const esgotoAddition = `
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
`;

const fundLabelRegex = /<label className="flex items-center gap-2 text-sm[^>]*>[\s\S]*?etapas_fundamental2[\s\S]*?<\/label>/;
const fundMatch = content.match(fundLabelRegex);
if (fundMatch) {
    content = content.replace(fundMatch[0], fundMatch[0] + esgotoAddition);
}

const extrasAddition = `
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
`;

const integralLabelRegex = /<label className="flex items-center gap-2 text-sm[^>]*>[\s\S]*?turno_integral[\s\S]*?<\/label>/;
const integralMatch = content.match(integralLabelRegex);
if (integralMatch) {
    content = content.replace(integralMatch[0], integralMatch[0] + extrasAddition);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Infraestrutura fields successfully appended');
