/* ARTANDAVOODI · Build-time import of the approved artan-live style baseline. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const source = process.argv[2];
if (!source) throw new Error('Provide the audited artan-live repository path.');
const files = [
  'docs/assets/css/core/01-tokens/source/control-center.tokens.css',
  'docs/assets/css/core/01-tokens/source/neuroartan.tokens.css',
  'docs/assets/css/core/01-tokens/source/artan-live.aliases.css',
  'docs/assets/css/core/02-foundation/themes.css',
];
const records = [];
for (const file of files) {
  const bytes = await readFile(path.join(source, file));
  await mkdir(path.dirname(path.join(root, file)), { recursive: true });
  await writeFile(path.join(root, file), bytes);
  records.push({ file, sha256: createHash('sha256').update(bytes).digest('hex') });
}
await writeFile(path.join(root, 'planning/style-baseline.json'), JSON.stringify({
  sourceRepository: 'artandavoodi/artan-live',
  sourceCommit: 'ebcf2f0679a0f61bd9fa5be170ee585fdc592bda',
  note: 'Exact audited working-file snapshots; checksums identify the imported bytes.',
  files: records,
}, null, 2) + '\n');
console.log('Imported four audited style sources with SHA-256 records.');
