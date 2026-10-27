/* Executed by the existing, pinned ecosystem Playwright suite. */
import {test,expect} from '@playwright/test';
for(const theme of ['light','dark']) test.describe(theme,()=>{
  test.beforeEach(async({page})=>{
    await page.goto('/gallery/');
    await page.getByRole('button',{name:'Allow',exact:true}).click();
    await page.getByRole('button',{name:'Open site menu',exact:true}).click();
    const themeControl=page.locator('[data-menu-theme]');
    if(await page.locator('html').getAttribute('data-theme-effective')!==theme) await themeControl.click();
    await page.keyboard.press('Escape');
  });
  test('library panels, filters, views and canonical collection pages',async({page})=>{
    const filter=page.locator('.gallery__controls summary').first();
    const view=page.locator('.gallery__controls summary').last();
    await filter.click();
    await page.getByRole('combobox',{name:'Collection',exact:true}).selectOption('photography');
    await expect(page.locator('.gallery__images img')).toHaveCount(15);
    await view.click();
    await expect(filter).toHaveAttribute('aria-expanded','false');
    await page.getByRole('button',{name:'Compact',exact:true}).click();
    await expect(page.locator('[data-gallery-items]')).toHaveAttribute('data-view','compact');
    await filter.click();
    await page.getByRole('combobox',{name:'Subject',exact:true}).selectOption('animals');
    await expect(page.getByText('No photos match these filters.',{exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Clear filters',exact:true}).click();
    await expect(page.locator('.gallery__images img')).toHaveCount(19);
    await page.keyboard.press('Escape');
    await expect(filter).toHaveAttribute('aria-expanded','false');
    await page.goto('/gallery/collections/photography/');
    await expect(page.locator('.gallery__images img')).toHaveCount(15);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://artandavoodi.com/gallery/collections/photography/');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  });
  test('photo sequence, original access, theme and touch navigation',async({page})=>{
    await page.goto('/gallery/photograph-02/?collection=photography');
    await expect(page.locator('html')).toHaveAttribute('data-gallery-viewer-ready','true');
    await expect(page.locator('[data-photo-count]')).toHaveText('2 / 15');
    await expect(page.getByRole('link',{name:'View original image',exact:true})).toHaveAttribute('href','/assets/media/gallery/photography/photograph-02.jpeg');
    await expect(page.locator('[data-gallery-photo] img')).toHaveAttribute('srcset',/w1280/);
    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/photograph-03/);
    await expect(page.locator('html')).toHaveAttribute('data-gallery-viewer-ready','true');
    await page.keyboard.press('ArrowLeft');
    await expect(page).toHaveURL(/photograph-02/);
    await expect(page.locator('html')).toHaveAttribute('data-gallery-viewer-ready','true');
    await page.locator('[data-gallery-photo]').dispatchEvent('touchstart',{touches:[{identifier:0,clientX:300,clientY:200}]});
    await page.locator('[data-gallery-photo]').dispatchEvent('touchend',{touches:[],changedTouches:[{identifier:0,clientX:0,clientY:200}]});
    await expect(page).toHaveURL(/photograph-03/);
    await expect(page.locator('html')).toHaveAttribute('data-gallery-viewer-ready','true');
    await expect(page.locator('.gallery__photo-atmosphere')).toBeAttached();
    await expect(page.locator('[data-gallery-filmstrip] a')).toHaveCount(15);
    await expect(page.locator('[data-gallery-filmstrip] [aria-current]')).toHaveAttribute('href',/photograph-03/);
  });
  test('returning preserves the library scroll position and focused photo',async({page})=>{
    const tile=page.locator('[data-gallery-photo-id="photograph-06"]');
    await tile.scrollIntoViewIfNeeded();
    const scroll=await page.evaluate(()=>scrollY);
    await tile.click();
    await page.getByRole('link',{name:'Back to gallery',exact:true}).click();
    await expect(page.locator('html')).toHaveAttribute('data-app-ready','true');
    await expect(page.locator('[data-gallery-photo-id="photograph-06"]')).toBeFocused();
    expect(Math.abs(await page.evaluate(()=>scrollY)-scroll)).toBeLessThan(3);
  });
});
