import fs from 'node:fs/promises';
import path from 'node:path';

async function main() {
    const p = 'C:/Users/Victor/Documents/GitHub/far-west/public/images';
    console.log(`Checking path: ${p}`);
    try {
        const stats = await fs.lstat(p);
        console.log(`Path exists. IsDirectory: ${stats.isDirectory()}`);
        const files = await fs.readdir(p);
        console.log(`Files found: ${files.join(', ')}`);
    } catch (e) {
        console.error(`Error: ${e.code} - ${e.message}`);
        console.log(`Current Working Directory: ${process.cwd()}`);
    }
}
main();
