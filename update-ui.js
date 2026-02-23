const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['apps/web/app', 'apps/web/components'];
const EXTENSIONS = ['.tsx', '.ts', '.css'];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Replace old cyan rgba shadows with new teal rgba
    if (content.includes('0,240,255')) {
        content = content.replace(/0,240,255/g, '45,235,232');
        changed = true;
    }

    // Replace old purple rgba shadows with new purple rgba
    if (content.includes('189,0,255')) {
        content = content.replace(/189,0,255/g, '108,43,217'); // for #6c2bd9
        changed = true;
    }

    // Replace "italic" on large headings, which gives that cyberpunk look.
    // Instead of completely stripping, let's remove 'italic uppercase' and just use 'tracking-tight' for a cleaner look
    if (content.includes('italic')) {
        content = content.replace(/italic uppercase/g, 'uppercase tracking-tighter');
        content = content.replace(/uppercase italic/g, 'tracking-tighter');
        // specifically for classNames with italic 
        content = content.replace(/font-black tracking-tighter leading-\[0\.85\] uppercase italic/g, 'font-bold tracking-tighter leading-tight');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated Styles: ${filePath}`);
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

console.log('Style polish migration completed.');
