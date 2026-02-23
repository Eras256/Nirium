const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['apps/web/app', 'apps/web/components'];
const EXTENSIONS = ['.tsx', '.ts', '.css'];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    if (content.includes('neon-cyan')) {
        content = content.replace(/neon-cyan/g, 'stellar-teal');
        changed = true;
    }
    if (content.includes('neon-purple')) {
        content = content.replace(/neon-purple/g, 'stellar-purple');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
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

console.log('Brand naming migration completed.');
