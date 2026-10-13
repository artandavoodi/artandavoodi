/* Site-wide regressions with an explicit preference-consent test fixture. */
import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=process.env.BROWSER_TARGET_ROOT || resolve('docs');
const privacy=JSON.parse(readFileSync(resolve(root,'assets/data/privacy.json'),'utf8'));
for(const theme of ['light','dark']) test.describe(theme,()=>{
  test.beforeEach(async({page})=>{
    await page.addInitScript(({storage,theme})=>{
      localStorage.setItem(storage.choiceKey,JSON.stringify({value:'allow',version:storage.version,time:Date.now()}));
      localStorage.setItem(storage.themeKey,theme);
    },{storage:privacy.storage,theme});
  });
  for(const route of ['/','/music/','/gallery/','/hub/','/press/','/privacy/']) test(`${route} remains readable and canonical`,async({page})=>{
    const response=await page.goto(route);
    expect(response.status()).toBe(200);
    await expect(page.getByRole('heading').first()).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme-effective',theme);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  });
  test('site menu remains keyboard accessible',async({page})=>{
    await page.goto('/');
    await page.getByRole('button',{name:'Open site menu',exact:true}).click();
    await expect(page.getByRole('button',{name:'Close site menu',exact:true})).toHaveAttribute('aria-expanded','true');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button',{name:'Open site menu',exact:true})).toHaveAttribute('aria-expanded','false');
  });
});
