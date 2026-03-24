const fs = require('fs');
const path = require('path');

const file_path = path.join(__dirname, 'tsc_errors_new.txt');

if (!fs.existsSync(file_path)) {
    console.log("File not found");
    process.exit(1);
}

const content = fs.readFileSync(file_path, 'utf16le');
fs.writeFileSync(path.join(__dirname, 'tsc_errors_utf8.txt'), content, 'utf-8');
console.log("Converted to UTF-8!");
