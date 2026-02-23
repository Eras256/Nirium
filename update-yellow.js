const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['apps/web/app', 'apps/web/components'];
const EXTENSIONS = ['.tsx', '.ts', '.css'];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Replace the class names
    if (content.includes('stellar-purple')) {
        content = content.replace(/stellar-purple/g, 'stellar-yellow');
        changed = true;
    }

    // Replace hardcoded hex codes for purple with yellow (#FFC800)
    // #6c2bd9 was the exact hex of stellar-purple previously
    if (content.includes('#6c2bd9')) {
        content = content.replace(/#6c2bd9/g, '#FFC800');
        changed = true;
    }

    // Replace hardcoded rgba values for stellar-purple box shadows or gradients
    // rgba(108,43,217...) corresponds to #6c2bd9
    if (content.includes('108,43,217')) {
        content = content.replace(/108,43,217/g, '255,200,0');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated Yellow Accent: ${filePath}`);
    }
}

function processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            processDirectory(fullPath);
        } else if (entry.isFile() && EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
            replaceInFile(fullPath);
        }
    }
}

DIRECTORIES.forEach(dir => {
    const targetDir = path.join(__dirname, dir);
    if (fs.existsSync(targetDir)) {
        processDirectory(targetDir);
    }
});

console.log('Yellow accent migration completed.');
