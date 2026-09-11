/* =========================================================
   ARTANDAVOODI · ASSET VALIDATION
   Owner: tools/validate-assets.mjs
   Purpose: Validate public catalogues and local media references.
========================================================= */
import { readFile, readdir, stat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../docs/', import.meta.url));
const failures = [];
const requireValue = (condition, message) => { if (!condition) failures.push(message); };
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const slug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

async function localFile(value, prefix) {
  if (typeof value !== 'string' || !value.startsWith(prefix) || value.includes('..') || value.includes('\\')) {
    failures.push(`Invalid local path: ${value}`);
    return false;
  }
  try {
    const resolved = await realpath(path.join(root, value));
    if (!resolved.startsWith(root) || !(await stat(resolved)).isFile()) throw new Error('Not a public file');
    return true;
  } catch {
    failures.push(`Missing or unsafe public file: ${value}`);
    return false;
  }
}

async function image(value, prefix, label) {
  if (!value || typeof value !== 'object') { failures.push(`${label}: image required`); return; }
  await localFile(value.src, prefix);
  requireValue(nonempty(value.alt), `${label}: alt text required`);
  requireValue(Number.isInteger(value.width) && value.width > 0, `${label}: valid width required`);
  requireValue(Number.isInteger(value.height) && value.height > 0, `${label}: valid height required`);
}

function links(items, label) {
  if (!Array.isArray(items)) { failures.push(`${label}: links array required`); return; }
  for (const item of items) {
    requireValue(nonempty(item?.label), `${label}: link label required`);
    try {
      const url = new URL(item.url);
      requireValue(url.protocol === 'https:' && !url.username && !url.password, `${label}: safe HTTPS URL required`);
    } catch { failures.push(`${label}: invalid URL`); }
  }
}

async function json(file) {
  if (!(await localFile(file, 'assets/data/'))) return null;
  try {
    const value = JSON.parse(await readFile(path.join(root, file), 'utf8'));
    requireValue(value?.schemaVersion === 1, `${file}: schemaVersion must be 1`);
    return value;
  } catch { failures.push(`${file}: invalid JSON`); return null; }
}

async function checkCatalogue(name, file) {
  const data = await json(file);
  if (!data) return;
  if (name === 'artist') {
    requireValue(nonempty(data.name), 'Artist name required');
    requireValue(typeof data.biography === 'string', 'Artist biography must be text');
    if (data.portrait !== null) await image(data.portrait, 'assets/media/portrait/', 'Portrait');
    links(data.links, 'Artist');
    return;
  }
  if (!Array.isArray(data.items)) { failures.push(`${name}: items array required`); return; }
  const ids = new Set();
  for (const item of data.items) {
    if (!item || typeof item !== 'object') { failures.push(`${name}: invalid item`); continue; }
    requireValue(slug(item.id) && !ids.has(item.id), `${name}: invalid or duplicate ID ${item.id}`);
    ids.add(item.id);
    if (name === 'gallery') {
      requireValue(slug(item.collection), `${item.id}: collection ID required`);
      await image(item.image, `assets/media/gallery/${item.collection}/`, item.id);
    } else {
      requireValue(nonempty(item.title), `${item.id}: title required`);
      if (name === 'music') requireValue(['albums', 'eps', 'singles'].includes(item.category), `${item.id}: invalid category`);
      const prefix = name === 'music'
        ? `assets/media/music/${item.category}/${item.id}/cover/`
        : `assets/media/publications/${item.id}/cover/`;
      await image(item.cover, prefix, item.id);
      links(item.links, item.id);
    }
  }
}

async function scanFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) { failures.push(`Public asset symlink: ${file}`); continue; }
    if (entry.isDirectory()) { await scanFiles(file); continue; }
    if (/(?:\s+\d+|\s*\(\d+\)|[ _-]copy(?:[ _-]?\d+)?)\.(?:svg|png|jpe?g|webp|avif|ico)$/i.test(entry.name)) {
      failures.push(`Duplicate-style asset filename: ${file}`);
    }
  }
}

const site = await json('assets/data/site.json');
if (site) {
  for (const name of ['artist', 'gallery', 'music', 'publications']) {
    await checkCatalogue(name, site.catalogues?.[name]);
  }
}
await scanFiles(path.join(root, 'assets'));
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS: four catalogues, local references, and asset filenames validated. Content catalogues may be empty.');
}
