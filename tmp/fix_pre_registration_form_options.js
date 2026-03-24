import fs from 'fs';

const filePath = 'src/pages/PreRegistrationForm.tsx';
let fileContent = fs.readFileSync(filePath, 'utf-8');

const selectRegex = /(<select value=\{classInterest\}[^>]+>)([\s\S]+?)(<\/select>)/;

const newOptions = `
                                          <option value="">Selecione...</option>
                                          <optgroup label="Educação Infantil">
                                               <option value="Berçário I">Berçário I</option>
                                               <option value="Berçário II">Berçário II</option>
                                               <option value="Maternal I">Maternal I</option>
                                               <option value="Maternal II">Maternal II</option>
                                               <option value="Pré I">Pré I</option>
                                               <option value="Pré II">Pré II</option>
                                          </optgroup>
                                          <optgroup label="Ensino Fundamental I">
                                               <option value="1º Ano">1º Ano</option>
                                               <option value="2º Ano">2º Ano</option>
                                               <option value="3º Ano">3º Ano</option>
                                               <option value="4º Ano">4º Ano</option>
                                               <option value="5º Ano">5º Ano</option>
                                          </optgroup>
                                          <optgroup label="Ensino Fundamental II">
                                               <option value="6º Ano">6º Ano</option>
                                               <option value="7º Ano">7º Ano</option>
                                               <option value="8º Ano">8º Ano</option>
                                               <option value="9º Ano">9º Ano</option>
                                          </optgroup>
                                          <optgroup label="Ensino Médio">
                                               <option value="1º Ano (Médio)">1º Ano (Médio)</option>
                                               <option value="2º Ano (Médio)">2º Ano (Médio)</option>
                                               <option value="3º Ano (Médio)">3º Ano (Médio)</option>
                                          </optgroup>
                                     `;

if (selectRegex.test(fileContent)) {
  fileContent = fileContent.replace(selectRegex, `$1${newOptions}$3`);
  fs.writeFileSync(filePath, fileContent, 'utf-8');
  console.log('Successfully replaced Select options for classInterest.');
} else {
  console.error('Could not find select for classInterest in the file.');
}
