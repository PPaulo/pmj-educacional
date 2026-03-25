const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'ConfiguracoesPage.tsx');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Use regex that ignores white space increments
    const regex = /<option value="Secretaria">Secretaria<\/option>\s*<option value="Professor">Professor<\/option>\s*<option value="Diretor">Diretor<\/option>/g;

    const replaceStr = `<option value="Secretaria">Secretária (Geral)</option>
                                                    <option value="Professor">Professor(a)</option>
                                                    <option value="Diretor">Diretor(a)</option>
                                                    <option value="Coordenador">Coordenador(a)</option>
                                                    <option value="Nutricionista">Nutricionista</option>`;

    if (regex.test(content)) {
        content = content.replace(regex, replaceStr);
        fs.readFileSync(filePath, 'utf8'); // Double check
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Substituição Regex efetuada!');
    } else {
        console.log('Regex não deu match.');
    }

} catch (e) {
    console.error(e);
}
