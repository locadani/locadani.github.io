import { expect, test, type Locator } from '@playwright/test';

/** Names not clipped away by their row's one-line fold. */
const shownTech = (card: Locator) =>
  card.locator('[data-role-tech] ul').evaluateAll((rows) =>
    rows.flatMap((ul) => {
      const bottom = ul.getBoundingClientRect().bottom;
      return [...ul.querySelectorAll('li')]
        .filter((li) => li.getBoundingClientRect().top < bottom - 1)
        .map((li) => li.textContent!.trim());
    }),
  );
const allTech = (card: Locator) => card.locator('[data-role-tech] li').allTextContents();

test('folded, each technology row shows only its first line, and the button counts the rest', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const card = page.locator('.tl-role-card', { hasText: 'Backwell Tech Corp' });
  const more = card.locator('[data-role-tech-more]');

  // Every row is exactly one line tall.
  const heights = await card.locator('[data-role-tech] ul').evaluateAll((rows) =>
    rows.map((ul) => ul.getBoundingClientRect().height),
  );
  const line = Math.min(...heights);
  for (const h of heights) expect(h).toBeCloseTo(line, 0);

  const all = await allTech(card);
  const shown = await shownTech(card);
  expect(shown.length).toBeLessThan(all.length);
  await expect(more).toHaveText(`Show ${all.length - shown.length} more`);

  await more.click();
  expect(await shownTech(card)).toHaveLength(all.length);
  await expect(more).toHaveText('Show less');
  await expect(more).toHaveAttribute('aria-expanded', 'true');

  await more.click();
  expect(await shownTech(card)).toEqual(shown);
});

test('a role card whose rows all fit on one line has no button', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const card = page.locator('.tl-role-card', { hasText: 'Fujitsu' });
  await expect(card.locator('[data-role-tech-more]')).toBeHidden();
  expect(await shownTech(card)).toEqual(['Python', 'PyTorch', 'PyTorch Geometric']);
});

test('the button stays at the bottom of the card while the body scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 640 });
  await page.goto('/');
  const card = page.locator('.tl-role-card', { hasText: 'Backwell Tech Corp' });
  await card.locator('[data-role-tech-more]').click();
  await card.locator('.tl-role-body').evaluate((el) => (el.scrollTop = el.scrollHeight / 2));

  const cardBox = (await card.boundingBox())!;
  const button = (await card.locator('[data-role-tech-more]').boundingBox())!;
  expect(button.y + button.height).toBeLessThanOrEqual(cardBox.y + cardBox.height);
  expect(cardBox.y + cardBox.height - (button.y + button.height)).toBeLessThan(24);
  // ...and the card's head stays in view above the scrolled body.
  await expect(card.locator('.tl-role-head h3')).toBeInViewport();
});

test("a role card keeps its own bullets above the derived list", async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.tl-role-card', { hasText: 'Backwell Tech Corp' });
  await expect(card.locator('.prose-tight li')).toHaveCount(5);
});

for (const width of [1280, 390]) {
  test(`at ${width}px the image viewer's close button and arrows never overlap`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.goto('/');
    await page.locator('[data-lightbox-trigger]').first().click();

    const boxes = await Promise.all(
      ['[data-lightbox-close]', '[data-lightbox-prev]', '[data-lightbox-next]'].map(
        async (s) => (await page.locator(s).boundingBox())!,
      ),
    );
    const [close, ...arrows] = boxes;
    for (const arrow of arrows) {
      const apart =
        close.x + close.width <= arrow.x ||
        arrow.x + arrow.width <= close.x ||
        close.y + close.height <= arrow.y ||
        arrow.y + arrow.height <= close.y;
      expect(apart).toBe(true);
    }
  });
}

test('clicking an image in the viewer zooms in, and clicking again zooms out', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 850 });
  await page.goto('/');
  await page.locator('[data-lightbox-trigger]').first().click();

  const img = page.locator('[data-lightbox-img]');
  const viewport = page.locator('[data-lightbox-viewport]');
  // Measure only once the image has loaded; before that it has no size.
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  const before = (await img.boundingBox())!;

  await img.click();
  await expect(viewport).toHaveClass(/is-zoomed/);
  expect((await img.boundingBox())!.width).toBeGreaterThanOrEqual(before.width * 2 - 1);
  // The window onto the zoomed image stays the size the image was shown at.
  const frame = (await viewport.boundingBox())!;
  expect(Math.abs(frame.width - before.width)).toBeLessThan(2);

  await img.click({ position: { x: 20, y: 20 } });
  await expect(viewport).not.toHaveClass(/is-zoomed/);

  // Paging to another image always starts unzoomed.
  await img.click();
  await page.locator('[data-lightbox-next]').click();
  await expect(viewport).not.toHaveClass(/is-zoomed/);
});
