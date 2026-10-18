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
if(process.argv.includes('--preference-presentation-only')){
  const revision=execFileSync('git',['-C',closeSource,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
  const tokenFile='docs/assets/css/core/01-tokens/interaction.tokens.css';
  const motionFile='docs/assets/css/layers/website/overlays/cookie/cookie-consent.css';
  const tokens=execFileSync('git',['-C',closeSource,'show',`${revision}:${tokenFile}`],{encoding:'utf8'});
  const motion=execFileSync('git',['-C',closeSource,'show',`${revision}:${motionFile}`],{encoding:'utf8'});
  const names=['dialog-consent-brand-symbol-wrap-size','dialog-consent-brand-symbol-size','dialog-consent-brand-symbol-size-mobile','dialog-consent-brand-gap','dialog-consent-eyebrow-size','dialog-consent-eyebrow-weight','dialog-consent-eyebrow-line-height','dialog-consent-copy-size','dialog-consent-copy-weight','dialog-consent-copy-line-height','dialog-consent-action-gap','dialog-consent-action-min-height','dialog-consent-action-padding-y','dialog-consent-action-padding-x','dialog-consent-action-size','dialog-consent-action-weight','dialog-consent-action-line-height','dialog-consent-action-tracking','dialog-consent-row-icon-size','overlay-motion-duration','overlay-motion-ease','dialog-overlay-transform-closed','dialog-overlay-transform-open'];
  const declarations=names.map(name=>{const declaration=tokens.match(new RegExp(`--${name}:[^;]+;`))?.[0];if(!declaration)throw Error(`Missing canonical consent token: ${name}`);return declaration;});
  const start=motion.indexOf('@keyframes cookieConsentIconFloat{');if(start<0)throw Error('Missing canonical cookie motion');
  let end=start,depth=0;for(;end<motion.length;end++){if(motion[end]==='{')depth++;if(motion[end]==='}'&&--depth===0){end++;break;}}
  const file='docs/assets/css/core/04-systems/preferences-presentation.css';
  const iconAnimation=motion.match(/animation:cookieConsentIconFloat[^;]+;/)?.[0];if(!iconAnimation)throw Error('Missing canonical cookie animation timing');
  const css=`/* Generated from Neuroartan consent tokens and icon motion; edit the source, not this distribution. */
:root{${declarations.join('\n')}}
${motion.slice(start,end)}
.privacy-preferences[open]{animation:preferencePanelEntrance var(--overlay-motion-duration) var(--overlay-motion-ease) both;}
.privacy-preferences h2{margin:0;font-size:var(--dialog-consent-eyebrow-size);font-weight:var(--dialog-consent-eyebrow-weight);line-height:var(--dialog-consent-eyebrow-line-height);}
.privacy-preferences > p{font-size:var(--dialog-consent-copy-size);font-weight:var(--dialog-consent-copy-weight);line-height:var(--dialog-consent-copy-line-height);}
.privacy-preferences__symbol{position:relative;display:block;justify-self:center;inline-size:var(--dialog-consent-brand-symbol-wrap-size);block-size:var(--dialog-consent-brand-symbol-wrap-size);}
.privacy-preferences__symbol img{position:absolute;top:50%;left:50%;inline-size:var(--dialog-consent-brand-symbol-size);block-size:var(--dialog-consent-brand-symbol-size);max-inline-size:none;object-fit:contain;transform:translate(-50%,-50%);transform-origin:center;${iconAnimation}}
.privacy-preferences__actions{display:flex;flex-wrap:wrap;justify-content:center;gap:var(--dialog-consent-action-gap);}
.privacy-preferences__action{display:inline-flex;flex:1 1 0;align-items:center;justify-content:center;gap:var(--dialog-consent-action-gap);min-block-size:var(--dialog-consent-action-min-height);padding:var(--dialog-consent-action-padding-y) var(--dialog-consent-action-padding-x);font-size:var(--dialog-consent-action-size);font-weight:var(--dialog-consent-action-weight);line-height:var(--dialog-consent-action-line-height);letter-spacing:var(--dialog-consent-action-tracking);}
.privacy-preferences__action img{inline-size:var(--dialog-consent-row-icon-size);block-size:var(--dialog-consent-row-icon-size);object-fit:contain;}
@keyframes preferencePanelEntrance{from{opacity:0;transform:var(--dialog-overlay-transform-closed);}to{opacity:1;transform:var(--dialog-overlay-transform-open);}}
@media(max-width:1024px){.privacy-preferences__symbol img{inline-size:var(--dialog-consent-brand-symbol-size-mobile);block-size:var(--dialog-consent-brand-symbol-size-mobile);}}
@media(prefers-reduced-motion:reduce){.privacy-preferences[open],.privacy-preferences__symbol img{animation:none;}}
`;
  await writeFile(path.join(root,file),css);
  const manifestPath=path.join(root,'planning/style-baseline.json'),manifest=JSON.parse(await readFile(manifestPath,'utf8'));
  manifest.files=manifest.files.filter(record=>record.file!==file);manifest.files.push({file,sha256:createHash('sha256').update(css).digest('hex'),sourceRepository:'artandavoodi/neuroartan-website',sourceCommit:revision,sourceFiles:[tokenFile,motionFile]});
  await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');process.exit(0);
}
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
