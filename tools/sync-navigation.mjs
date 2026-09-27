/* One-way distribution of the hub-owned artistic navigation system. */
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const source = new URL('../../artan-live/', import.meta.url);
const root = new URL('../', import.meta.url);
const files = ['docs/assets/js/core/menu.js', 'docs/assets/css/core/01-tokens/navigation.tokens.css'];
const records = [];
for (const file of files) {
  const bytes = await readFile(new URL(file, source));
  await writeFile(new URL(file, root), bytes);
  records.push({file, sha256: createHash('sha256').update(bytes).digest('hex')});
}
await writeFile(new URL('planning/navigation-baseline.json', root), JSON.stringify({sourceRepository:'artandavoodi/artan-live', files:records}, null, 2) + '\n');
console.log('Synchronized hub navigation controller and motion tokens.');
