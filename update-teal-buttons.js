const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['apps/web/app', 'apps/web/components'];
const EXTENSIONS = ['.tsx'];

function processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            processDirectory(fullPath);
        } else if (entry.isFile() && EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Simple replace of 'bg-stellar-teal', 'text-stellar-teal', 'border-stellar-teal' 
            // inside tags. Since regex for full tags is brittle in JSX, we'll just parse lines
            // and replace instances where we also see '<button', '<Link' or '<a'.
            // Actually, we can just glob replace 'stellar-teal' in lines that match.

            let lines = content.split('\n');
            let inButton = false;
            lines = lines.map(line => {
                if (line.includes('<button') || line.includes('<Link') || line.includes('<a')) inButton = true;

                if (inButton) {
                    if (line.includes('stellar-teal')) {
                        line = line.replace(/stellar-teal/g, 'stellar-yellow');
                    }
                    if (line.includes('0,243,255')) {
                        line = line.replace(/0,243,255/g, '255,200,0');
                    }
                    if (line.includes('45,235,232')) {
                        line = line.replace(/45,235,232/g, '255,200,0');
                    }
                }

                // If the line also has an end tag or finishing brace it might be the end of the button
                // But it's safer to just reset if we see '>', '</button>', '</Link>', etc.
                if (line.includes('>') && !line.includes('=>') && !line.includes('->')) {
                    inButton = false;
                }
                return line;
            });

            content = lines.join('\n');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated Button/Link Colors: ${fullPath}`);
            }
        }
    }
}

DIRECTORIES.forEach(dir => {
    const targetDir = path.join(__dirname, dir);
    if (fs.existsSync(targetDir)) {
        processDirectory(targetDir);
    }
});
console.log('Button migration completed.');
