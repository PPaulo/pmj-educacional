const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\ppaul\\Downloads\\pmj---educacional (1)\\src\\pages\\PreRegistrationForm.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace docCpf input
const docCpfRegex = /<input type="text"\s+value=\{docCpf\}\s+onChange=\{e => setDocCpf\(e\.target\.value\)\}\s+className="([^"]+)"\s+placeholder="([^"]+)"\s*\/>/;
if (docCpfRegex.test(content)) {
  console.log('Found docCpf match!');
  content = content.replace(docCpfRegex, `<input type="text" value={docCpf} onChange={e => setDocCpf(maskCPF(e.target.value))} className="$1" placeholder="$2" maxLength={14} />`);
} else {
  console.log('docCpf NOT found with expected regex!');
}

// Replace responsavelPhone input
const phoneRegex = /<input type="text"\s+value=\{responsavelPhone\}\s+onChange=\{e => setResponsavelPhone\(e\.target\.value\)\}\s+className="([^"]+)"\s+placeholder="([^"]+)"\s+required\s*\/>/;
if (phoneRegex.test(content)) {
  console.log('Found responsavelPhone match!');
  content = content.replace(phoneRegex, `<input type="text" value={responsavelPhone} onChange={e => setResponsavelPhone(maskPhone(e.target.value))} className="$1" placeholder="$2" required maxLength={15} />`);
} else {
  console.log('responsavelPhone NOT found with expected regex!');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Replaced content successfully!');
