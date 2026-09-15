/* ARTANDAVOODI · Static integrity gate for the public site and style sources. */
import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const docs = path.join(root, 'docs');
const errors = [];
async function files(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await files(file));
    else if (entry.isFile()) result.push(file);
  }
  return result;
}
async function checkTarget(base, value) {
  if (/^(?:https?:|mailto:|data:|#)/.test(value)) return;
  if (value.includes('${')) return;
  const decoded = value.replaceAll('&amp;', '&').split(/[?#]/)[0];
  const target = value.startsWith('/') ? path.join(docs, decoded) : path.resolve(base, decoded);
  if (!target.startsWith(docs + path.sep)) { errors.push(`Path escapes public root: ${value}`); return; }
  try { await stat(target); } catch { errors.push(`Missing: ${target}`); }
}
for (const file of await files(docs)) {
  const ext = path.extname(file);
  if (!['.js', '.css', '.html', '.json'].includes(ext)) continue;
  const source = await readFile(file, 'utf8');
  if (ext === '.json') { try { JSON.parse(source); } catch { errors.push(`Invalid JSON: ${file}`); } }
  if (ext === '.js') {
    try { execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }); }
    catch { errors.push(`Invalid JavaScript: ${file}`); }
    for (const match of source.matchAll(/(?:from\s+|import\s*\(\s*|import\s*)['"]([^'"]+)['"]/g)) {
      await checkTarget(path.dirname(file), match[1]);
    }
  }
  if (ext === '.css') {
    for (const match of source.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) await checkTarget(path.dirname(file), match[1]);
    if (file.includes(`${path.sep}layers${path.sep}`) && /#[\da-f]{3,8}\b|rgba?\(|clamp\(/i.test(source)) errors.push(`Local visual hardcode: ${file}`);
  }
  if (ext === '.html') {
    for (const match of source.matchAll(/(?:src|href)="([^"]+)"/g)) await checkTarget(path.dirname(file), match[1]);
    const withoutData = source.replace(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g, (_, data) => {
      try { JSON.parse(data); } catch { errors.push(`Invalid JSON-LD: ${file}`); }
      return '';
    });
    if (/\sstyle=|<script(?![^>]*\bsrc=)/i.test(withoutData)) errors.push(`Inline styling or script: ${file}`);
  }
}
const fragments = JSON.parse(await readFile(path.join(docs, 'assets/data/fragments.json')));
const html = await readFile(path.join(docs, 'index.html'), 'utf8');
for (const match of html.matchAll(/data-fragment="([^"]+)"/g)) {
  if (!fragments[match[1]]) errors.push(`Unregistered fragment: ${match[1]}`);
}
for (const value of Object.values(fragments)) await checkTarget(docs, value);
const manifest = JSON.parse(await readFile(path.join(root, 'planning/style-baseline.json')));
for (const record of manifest.files) {
  const actual = createHash('sha256').update(await readFile(path.join(root, record.file))).digest('hex');
  if (actual !== record.sha256) errors.push(`Shared style snapshot changed: ${record.file}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('PASS: JavaScript syntax/import paths, CSS imports, HTML targets, JSON, fragments and shared-style checksums.');
