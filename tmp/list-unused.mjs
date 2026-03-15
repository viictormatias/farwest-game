import fs from 'node:fs';
import path from 'node:path';

function getFiles(dir, fileList = []) {
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                fileList = getFiles(fullPath, fileList);
            } else {
                if (file.match(/\.(webp|png|jpg|jpeg)$/i)) {
                    fileList.push(fullPath.replace(/\\/g, '/'));
                }
            }
        }
    } catch(e){}
    return fileList;
}

const unusedFiles = getFiles('IMAGENS-NAO-USADAS');
fs.writeFileSync('tmp/all_unused.txt', unusedFiles.join('\n'), 'utf8');
console.log(`Found ${unusedFiles.length} unused images.`);
