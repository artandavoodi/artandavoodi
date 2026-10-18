/* ARTANDAVOODI · Build-time import of the approved artan-live style baseline. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = fileURLToPath(new URL('../', import.meta.url));
const source = process.argv[2];
if (!source) throw new Error('Provide the audited artan-live repository path.');
const closeSource=process.argv[3];
if(!closeSource)throw Error('Provide the verified Neuroartan website path for canonical close controls.');
if(process.argv.includes('--registered-actions-only')){
  const sourceCommit=execFileSync('git',['-C',closeSource,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
  const manifestPath=path.join(root,'planning/style-baseline.json'),manifest=JSON.parse(await readFile(manifestPath,'utf8'));
  const registryPath=path.join(root,'docs/assets/data/icons.json'),registry=JSON.parse(await readFile(registryPath,'utf8'));
  for(const [name,sourceFile] of Object.entries({play:'docs/registry/icons/public/assets/core/media/play/play.svg',bag:'docs/registry/icons/public/assets/core/commerce/shopping/bag.svg',cookies:'docs/registry/icons/public/assets/core/interface/cookies/cookies.svg'})){
    const file=`docs/assets/icons/actions/${name}.svg`,bytes=execFileSync('git',['-C',closeSource,'show',`${sourceCommit}:${sourceFile}`]);
    await writeFile(path.join(root,file),bytes);manifest.files=manifest.files.filter(record=>record.file!==file);
    manifest.files.push({file,sha256:createHash('sha256').update(bytes).digest('hex'),sourceRepository:'artandavoodi/neuroartan-website',sourceCommit,sourceFile});
    let icon=registry.items.find(icon=>icon.src===file.slice(5));
    if(!icon){icon={id:name,src:file.slice(5),alt:'',monochrome:true};registry.items.push(icon);}
    if(/<(?:path|circle|rect|line|polygon|polyline|ellipse|use|image|text)\b/.test(bytes.toString()))delete icon.fallbackSrc;
  }
  await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');await writeFile(registryPath,JSON.stringify(registry,null,2)+'\n');process.exit(0);
}
if(process.argv.includes('--audio-only') || process.argv.includes('--preference-icons-only')) {
  const sourceFile=process.argv.includes('--audio-only') ? 'docs/registry/icons/public/assets/core/media/audio/audio.svg' : 'docs/registry/icons/public/assets/core/actions/check/check.svg';
  const file=process.argv.includes('--audio-only') ? 'docs/assets/icons/actions/audio.svg' : 'docs/assets/icons/actions/check.svg';
  const sourceCommit=execFileSync('git',['-C',closeSource,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
  const bytes=execFileSync('git',['-C',closeSource,'show',`${sourceCommit}:${sourceFile}`]);
  const manifestPath=path.join(root,'planning/style-baseline.json');
  const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
  await mkdir(path.dirname(path.join(root,file)),{recursive:true});
  await writeFile(path.join(root,file),bytes);
  manifest.files=manifest.files.filter(record=>record.file!==file);
  manifest.files.push({file,sha256:createHash('sha256').update(bytes).digest('hex'),sourceRepository:'artandavoodi/neuroartan-website',sourceCommit,sourceFile});
  await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  console.log('Imported canonical registered icon without modifying the style baseline.');
  process.exit(0);
}
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
const closeCommit=execFileSync('git',['-C',closeSource,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
for(const [sourceFile,file] of [
  ['docs/assets/css/core/04-systems/close-button.css','docs/assets/css/core/04-systems/close-button.css'],
  ['docs/assets/js/core/01-foundation/close-button.js','docs/assets/js/core/close-button.js'],
  ['docs/assets/css/core/03-primitives/fields.css','docs/assets/css/core/03-primitives/fields.css']
]){
  const bytes=await readFile(path.join(closeSource,sourceFile));
  await mkdir(path.dirname(path.join(root,file)),{recursive:true});
  await writeFile(path.join(root,file),bytes);
  records.push({file,sha256:createHash('sha256').update(bytes).digest('hex'),sourceRepository:'artandavoodi/neuroartan-website',sourceCommit:closeCommit,sourceFile});
}
await writeFile(path.join(root, 'planning/style-baseline.json'), JSON.stringify({
  sourceRepository: 'artandavoodi/artan-live',
  sourceCommit: 'ebcf2f0679a0f61bd9fa5be170ee585fdc592bda',
  note: 'Exact audited working-file snapshots; checksums identify the imported bytes.',
  files: records,
}, null, 2) + '\n');
console.log('Imported audited styles and canonical close controls with SHA-256 records.');
