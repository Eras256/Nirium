const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['apps/web/app', 'apps/web/components'];
const EXTENSIONS = ['.tsx', '.ts'];

function replaceInTag(content, tagName) {
    let newContent = '';
    let startIndex = 0;
    let changedInFile = false;

    while (true) {
        const startTagIndex = content.indexOf(`<${tagName}`, startIndex);
        if (startTagIndex === -1) {
            newContent += content.substring(startIndex);
            break;
        }

        // Find the end of this tag (could be self-closing or have a closing tag)
        // Actually, let's just replace within the open tag <button ... >
        const endOpenTagIndex = content.indexOf('>', startTagIndex);
        if (endOpenTagIndex === -1) break;

        const beforeTag = content.substring(startIndex, startTagIndex);
        let tagContents = content.substring(startTagIndex, endOpenTagIndex + 1);

        // also if it's <button>...</button>, we might want to change text inside? 
        // Typically it's the class names on the opening tag itself.
        if (tagContents.includes('stellar-teal')) {
            tagContents = tagContents.replace(/stellar-teal/g, 'stellar-yellow');
            changedInFile = true;
        }
        if (tagContents.includes('0,243,255')) {
            tagContents = tagContents.replace(/0,243,255/g, '255,200,0');
            changedInFile = true;
        }
        if (tagContents.includes('45,235,232')) {
            tagContents = tagContents.replace(/45,235,232/g, '255,200,0');
            changedInFile = true;
        }

        newContent += beforeTag + tagContents;
        startIndex = endOpenTagIndex + 1;
    }
    return { content: newContent, changed: changedInFile };
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    const buttonResult = replaceInTag(content, 'button');
    content = buttonResult.content;
    if (buttonResult.changed) changed = true;

    const linkResult = replaceInTag(content, 'Link');
    content = linkResult.content;
    if (linkResult.changed) changed = true;

    // For buttons where we need to replace text colors in its children, 
    // it's probably better to just regex replace specifically for obvious generic buttons classes
    const aResult = replaceInTag(content, 'a');
    content = aResult.content;
    if (aResult.changed) changed = true;

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated Buttons: ${filePath}`);
    }
}

function processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            processDirectory(fullPath);
        } else if (entry.isFile() && EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
            processFile(fullPath);
        }
    }
}

DIRECTORIES.forEach(dir => {
    const targetDir = path.join(__dirname, dir);
    if (fs.existsSync(targetDir)) {
        processDirectory(targetDir);
    }
});

console.log('Button colors replacement completed.');
