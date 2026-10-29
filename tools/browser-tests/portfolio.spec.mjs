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
  for(const route of ['/','/music/','/gallery/','/hub/','/concerts/','/press/','/privacy/','/music/still-live-acoustic/']) test(`${route} remains readable and canonical`,async({page})=>{
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
  for(const route of ['/concerts/','/press/','/privacy/','/music/still-live-acoustic/']) test(`${route} shares keyboard navigation and footer`,async({page})=>{
    await page.goto(route);
    await expect(page.locator('[data-site-brand]')).toBeVisible();
    await expect(page.locator('[data-copyright]')).toContainText('Artan Davoodi');
    await page.getByRole('button',{name:'Open site menu',exact:true}).click();
    await expect(page.locator('[data-menu-navigation]').getByRole('link',{name:'Concerts',exact:true})).toHaveAttribute('href','/concerts/');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button',{name:'Open site menu',exact:true})).toBeFocused();
    expect(await page.locator('.site-account-link').count()).toBe(0);
  });
  test('preference close control uses the canonical borderless motion',async({page})=>{
    await page.goto('/');
    await page.getByRole('button',{name:privacy.preferences.settings,exact:true}).click();
    const close=page.getByRole('button',{name:privacy.preferences.close,exact:true});
    await close.focus();
    expect(await close.evaluate(element=>getComputedStyle(element).borderTopWidth)).toBe('0px');
    expect(await close.evaluate(element=>getComputedStyle(element).outlineStyle)).toBe('none');
    await expect(close.locator('.global-close-button__line')).toHaveCount(2);
    if(await page.evaluate(()=>matchMedia('(hover:hover) and (pointer:fine)').matches)){
      await close.hover();
      await expect.poll(()=>close.evaluate(element=>{
        const lines=element.querySelectorAll('.global-close-button__line');
        return getComputedStyle(lines[0]).transform===getComputedStyle(lines[1]).transform;
      })).toBeTruthy();
    }
    await close.click();
    await expect(page.locator('[data-preferences-panel]')).not.toBeVisible();
  });
});
