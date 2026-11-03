import { expect, test } from '@playwright/test';

/** The page follows the system theme, and the toggle pins the other one across reloads. */

const background = (page: import('@playwright/test').Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test('follows the system theme, and the toggle overrides it across reloads', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const light = await background(page);

  await page.emulateMedia({ colorScheme: 'dark' });
  const dark = await background(page);
  expect(dark).not.toBe(light);

  // On a dark system, the hero's toggle offers light, and pins it.
  const toggle = page.locator('main [data-theme-toggle]');
  await expect(toggle).toHaveAccessibleName('Switch to light theme');
  await toggle.click();
  expect(await background(page)).toBe(light);
  await expect(toggle).toHaveAccessibleName('Switch to dark theme');

  await page.reload();
  expect(await background(page)).toBe(light);

  // Switching back to what the system shows clears the override.
  await page.locator('main [data-theme-toggle]').click();
  expect(await background(page)).toBe(dark);
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBeNull();
});
