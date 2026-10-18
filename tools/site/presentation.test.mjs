import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import vm from 'node:vm';
const docs=new URL('../../docs/',import.meta.url);
const read=path=>readFile(new URL(path,docs),'utf8');
test('shared entrances reverse, disconnect, and fall back without observers',async()=>{
  const source=(await read('assets/js/layers/site/entrances.js')).replace('export ','');
  let callback,disconnected=false;
  const target={style:{setProperty(){}},attributes:new Set(),setAttribute(name){this.attributes.add(name);},hasAttribute(name){return this.attributes.has(name);},toggleAttribute(name,value){value?this.attributes.add(name):this.attributes.delete(name);}};
  const context=vm.createContext({window:{IntersectionObserver:true},IntersectionObserver:class{constructor(cb){callback=cb;}observe(){}disconnect(){disconnected=true;}}});
  vm.runInContext(source+'\nthis.observe=observeEntrances;',context);
  const stop=context.observe([target]);
  callback([{target,isIntersecting:true,intersectionRatio:0.2}]);assert.ok(target.attributes.has('data-content-visible'));
  callback([{target,isIntersecting:true,intersectionRatio:0.14}]);assert.ok(target.attributes.has('data-content-visible'),'Small threshold changes must not reverse an entrance');
  callback([{target,isIntersecting:false,boundingClientRect:{bottom:-1},rootBounds:{top:0}}]);assert.equal(target.attributes.has('data-content-visible'),false);
  stop();assert.equal(disconnected,true);
  const fallback=vm.createContext({window:{}});
  vm.runInContext(source+'\nthis.observe=observeEntrances;',fallback);
  assert.equal(typeof fallback.observe([target]),'function');
  assert.doesNotMatch(source,/preventDefault|scrollTo|setTimeout/);
});
test('gallery selection is positioned before fetching and preserves matching server thumbnails',async()=>{
  const viewer=await read('assets/js/layers/site/gallery/viewer.js');
  assert.ok(viewer.indexOf('revealSelection();')<viewer.indexOf('await loadJson'));
  assert.match(viewer,/if\(matches\)existing\.forEach/);
  assert.doesNotMatch(viewer,/scrollIntoView/);
  assert.match(viewer,/addEventListener\('pageshow',revealSelection\)/);
});
test('all published page shells have identity, navigation and crawlable content',async()=>{
  async function walk(directory){
    const entries=await readdir(directory,{withFileTypes:true});
    return (await Promise.all(entries.filter(entry=>entry.name!=='assets').map(async entry=>{
      const path=new URL(entry.name+(entry.isDirectory()?'/':''),directory);
      return entry.isDirectory()?walk(path):entry.name.endsWith('.html')?[path]:[];
    }))).flat();
  }
  for(const file of await walk(docs)){
    const html=await readFile(file,'utf8');
    assert.match(html,/<title>[^<]+<\/title>/,file.pathname);
    if(/http-equiv="refresh"/.test(html))continue;
    assert.match(html,/<h1[\s>]/,file.pathname);
    if(html.includes('data-gallery-viewer="true"')){
      assert.match(html,/data-photo-next/,'Immersive photos retain their own navigation');
      continue;
    }
    assert.match(html,/data-fragment="navigation"/,file.pathname);
    assert.match(html,/data-fragment="footer"/,file.pathname);
  }
  assert.match(await read('404.html'),/Page not found/);
  assert.match(await read('music/workspace/index.html'),/url=\/music\//);
  assert.match(await read('assets/js/core/preferences.js'),/footer\.insertBefore/);
  assert.match(await read('assets/css/layers/site/content-motion.css'),/:focus-within/);
});
test('consent uses defined Neuroartan dimensions and registered animated artwork',async()=>{
  const css=await read('assets/css/core/04-systems/preferences-presentation.css');
  assert.match(css,/--dialog-consent-brand-symbol-size:2\.3rem;/);
  assert.match(css,/--dialog-consent-brand-symbol-size-mobile:1\.9rem;/);
  assert.match(css,/animation:cookieConsentIconFloat 5\.8s/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(await read('assets/css/core/04-systems/preferences.css'),/--icon-size-md/);
  const controller=await read('assets/js/core/preferences.js');
  assert.match(controller,/\[\['allow',[\s\S]*\['reject',/);
  const registry=JSON.parse(await read('assets/data/icons.json'));
  assert.ok(registry.items.some(icon=>icon.id==='cookies'));
});
test('immersive gallery keeps thumbnail sizing separate from arrow icons',async()=>{
  const css=await read('assets/css/layers/site/gallery/index.css');
  assert.match(css,/\.gallery__viewer-nav > a img/);
  assert.doesNotMatch(css,/\.gallery__viewer-nav img\s*\{/);
  assert.match(css,/\.gallery__filmstrip img[^}]*block-size: var\(--spacing-4xl\)/);
  assert.match(css,/\.gallery__filmstrip\s*\{[^}]*overflow-x: auto[^}]*scrollbar-width:none/);
  assert.match(css,/\.gallery__filmstrip::-webkit-scrollbar\s*\{\s*display:none/);
  assert.match(css,/\.gallery__filmstrip a\[aria-current\][^}]*outline:none/);
  assert.match(await read('assets/js/core/preferences.js'),/hasAttribute\('data-gallery-viewer'\)\)return/);
  const page=await read('gallery/artan-davoodi-close-up-portrait/index.html');
  assert.match(page,/class="gallery__viewer-nav"[^>]*>[\s\S]*data-photo-previous[\s\S]*data-gallery-filmstrip[\s\S]*data-photo-next/);
});
