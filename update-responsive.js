const fs = require('fs');
const path = require('path');

const dirs = [
    path.join(__dirname, 'apps/web/components'),
    path.join(__dirname, 'apps/web/app')
];

function processDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            processDirectory(fullPath);
        } else if (entry.isFile() && fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Replace max-w-7xl with max-w-[1600px] w-full
            content = content.replace(/max-w-7xl/g, 'max-w-[1600px] w-full mx-auto');

            // Clean up potentially duplicate w-full or mx-auto
            content = content.replace(/w-full w-full/g, 'w-full');
            content = content.replace(/mx-auto mx-auto/g, 'mx-auto');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated Responsive Layout: ${fullPath}`);
            }
        }
    }
}

dirs.forEach(processDirectory);
console.log("Responsive max-widths applied.");
