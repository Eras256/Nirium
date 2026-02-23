const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['apps/web/app', 'apps/web/components'];
const EXTENSIONS = ['.tsx', '.ts', '.css'];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    if (content.includes('#00f3ff')) {
        content = content.replace(/#00f3ff/g, '#2DEBE8');
        changed = true;
    }
    if (content.includes('#bd00ff')) {
        content = content.replace(/#bd00ff/g, '#6c2bd9');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated Hex: ${filePath}`);
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

console.log('Hex migration completed.');
