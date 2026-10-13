/* Homepage content and responsive access, using the pinned ecosystem suite. */
import {test,expect} from '@playwright/test';
test('artist homepage presents current music, visual work and press contact',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Allow preferences',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-app-ready','true');
  await expect(page.getByRole('heading',{name:'Artan Davoodi',exact:true})).toHaveCount(1);
  for(const name of ['Latest release','Selected music','Featured photography']) await expect(page.getByRole('heading',{name,exact:true})).toHaveCount(1);
  await expect(page.getByRole('heading',{name:'Press & contact',exact:true})).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Listen',exact:true})).toHaveAttribute('href','/music/');
  await expect(page.getByRole('link',{name:'Explore Gallery',exact:true})).toHaveAttribute('href','/gallery/');
  await expect(page.getByRole('link',{name:'Latest release',exact:true})).toHaveAttribute('href','/music/still-live-acoustic/');
  await expect(page.locator('[data-artist-actions]').getByRole('link',{name:'Store',exact:true})).toHaveAttribute('href','https://store.artandavoodi.com/');
  await expect(page.locator('[data-site-brand]')).toBeVisible();
  await page.goto('/press/');
  await expect(page.getByRole('link',{name:'Download biography',exact:true})).toHaveAttribute('download','');
  await page.goto('/');
  await expect(page.locator('[data-artist-visual] img')).toHaveCount(3);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  if(page.viewportSize().width<=860) expect(await page.locator('html').evaluate(element=>getComputedStyle(element).scrollSnapType)).toBe('none');
});
