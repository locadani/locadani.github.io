import { expect, test } from '@playwright/test';

/** The site header stays out of the way until the hero's name has scrolled off. */

test('the header is hidden at the top and slides in once the name scrolls away', async ({
  page,
}) => {
  await page.goto('/');
  const header = page.locator('[data-site-header]');
  await expect(header).toBeHidden();

  await page.mouse.wheel(0, 600);
  await expect(header).toBeVisible();
  await expect.poll(async () => (await header.boundingBox())?.y).toBe(0);

  await page.mouse.wheel(0, -2000);
  await expect(header).toBeHidden();
});
