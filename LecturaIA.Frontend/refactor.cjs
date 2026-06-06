const fs = require('fs');
const path = require('path');

const directory = "./src";

function isErrorContext(line) {
    const l = line.toLowerCase();
    return l.includes('error') || l.includes('catch') || l.includes('err') || l.includes('por favor') || l.includes('debe');
}

function processFile(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let needsImport = false;

        // Replace alert(...)
        // We will use a regex to find alert('...') or alert(`...`) or alert(...)
        // Not perfect for nested quotes but enough for our cases
        const alertRegex = /alert\((.*?)\);/g;
        content = content.replace(alertRegex, (match, p1) => {
            needsImport = true;
            if (isErrorContext(p1)) {
                return `alertaError(${p1});`;
            } else {
                return `alertaInformativa(${p1});`;
            }
        });

        // For confirm(...)
        // if (!confirm(...)) -> if (!(await confirmacionAccion(...)))
        // we have to check if the function is async. We might just replace confirm(...) with (await confirmacionAccion(...))
        const confirmRegex = /confirm\((.*?)\)/g;
        if (confirmRegex.test(content)) {
            content = content.replace(confirmRegex, (match, p1) => {
                needsImport = true;
                if (p1.toLowerCase().includes('eliminar')) {
                    return `(await confirmacionEliminar(${p1}))`;
                }
                return `(await confirmacionAccion(${p1}))`;
            });
        }
        
        // For prompt(...)
        const promptRegex = /prompt\((.*?)\)/g;
        if (promptRegex.test(content)) {
            content = content.replace(promptRegex, (match, p1) => {
                needsImport = true;
                return `(await promptTexto(${p1}))`;
            });
        }

        if (originalContent !== content) {
            let importLine = '';
            const imports = [];
            if (content.includes('alertaError')) imports.push('alertaError');
            if (content.includes('alertaInformativa')) imports.push('alertaInformativa');
            if (content.includes('alertaExito')) imports.push('alertaExito');
            if (content.includes('confirmacionEliminar')) imports.push('confirmacionEliminar');
            if (content.includes('confirmacionAccion')) imports.push('confirmacionAccion');
            if (content.includes('promptTexto')) imports.push('promptTexto');

            // Find how many directories deep we are to resolve utils/alerts
            const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'src/utils/alerts'));
            const importPath = relativePath.replace(/\\/g, '/');

            // Add import to top
            const finalImport = `import { ${imports.join(', ')} } from '${importPath}';\n`;
            content = finalImport + content;
            
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${filePath}`);
        }
    }
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else {
            processFile(fullPath);
        }
    }
}

traverse(directory);
