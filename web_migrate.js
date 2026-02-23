const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                walk(filepath, callback);
            }
        } else {
            callback(filepath);
        }
    }
}

walk('./apps/web', (filepath) => {
    if (!filepath.match(/\.(tsx|ts|js|jsx|json|md|mdx|html|css)$/)) return;
    let content = fs.readFileSync(filepath, 'utf8');
    let original = content;

    content = content.replace(/suiloop/g, 'nirium');
    content = content.replace(/SuiLoop/g, 'Nirium');
    content = content.replace(/suiloop/gi, 'nirium'); // Catch any other case

    if (content !== original) {
        fs.writeFileSync(filepath, content);
        console.log(`Updated ${filepath}`);
    }
});
