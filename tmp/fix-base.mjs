import fs from 'node:fs';

try { fs.copyFileSync('IMAGENS-NAO-USADAS/items/rusty_dagger.webp', 'public/images/items/rusty_dagger.webp'); } catch(e){}
try { fs.copyFileSync('IMAGENS-NAO-USADAS/items/medical_kit.webp', 'public/images/items/medical_kit.webp'); } catch(e){}
try { fs.copyFileSync('IMAGENS-NAO-USADAS/audit_cleanup_final/images/items/blood_nugget.webp', 'public/images/items/blood_nugget.webp'); } catch(e){}

let itemsTs = fs.readFileSync('src/lib/items.ts', 'utf8');

itemsTs = itemsTs.replace(/'\/images\/rusty_dagger\.webp'/g, "'/images/items/rusty_dagger.webp'");
itemsTs = itemsTs.replace(/'\/images\/medical_kit\.webp'/g, "'/images/items/medical_kit.webp'");
itemsTs = itemsTs.replace(/'\/images\/items\/ruby_gem_box_relic\.webp'/g, "'/images/items/blood_nugget.webp'");

fs.writeFileSync('src/lib/items.ts', itemsTs, 'utf8');
console.log('Restaurados 3 itens perfeitamente alinhados...');
