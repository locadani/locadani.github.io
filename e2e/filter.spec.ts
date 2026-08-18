import { expect, test } from '@playwright/test';

/**
 * Covers the wiring that unit tests cannot: that checkbox state reaches the DOM
 * attributes, that CSS collapses what it should, and that the URL round-trips.
 * The matching logic itself is unit-tested in src/lib/filter.test.ts.
 */

const timeline = '[data-timeline]';
const entries = '[data-entry]';

/**
 * Click the chip's label, which is what a real user clicks — the checkbox itself
 * is visually hidden for screen-reader support.
 */
const chip = (page: import('@playwright/test').Page, slug: string) =>
  page.locator(`label[for="tech-${slug}"]`);

test('renders every project with the filter idle', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator(entries)).toHaveCount(15);
  await expect(page.locator(timeline)).toHaveAttribute('data-filtering', 'false');
  await expect(page.locator('[data-filter-count]')).toHaveText('15 projects');
});

test('reveals the filter once scripting is available', async ({ page }) => {
  await page.goto('/');
  // It ships hidden, because without JS it would do nothing.
  await expect(page.locator('[data-filter-form]')).toBeVisible();
});

test('selecting a technology collapses non-matching entries and updates the count', async ({
  page,
}) => {
  await page.goto('/');
  await chip(page, 'react').click();

  await expect(page.locator(timeline)).toHaveAttribute('data-filtering', 'true');

  const matched = page.locator('[data-entry][data-match="true"]');
  const count = await matched.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(15);
  await expect(page.locator('[data-filter-count]')).toHaveText(`${count} of 15 match`);

  // A non-matching entry keeps its heading but collapses its body to nothing.
  const missBody = page.locator('[data-entry][data-match="false"]').first().locator('.entry-body');
  await expect(missBody).toHaveCount(1);
  await expect.poll(async () => (await missBody.boundingBox())?.height ?? -1).toBe(0);

  // A matching entry stays fully open.
  const hitBody = matched.first().locator('.entry-body');
  expect((await hitBody.boundingBox())!.height).toBeGreaterThan(0);
});

test('role bars are never dimmed or collapsed by filtering', async ({ page }) => {
  await page.goto('/');
  const roles = page.locator('.tl-role');
  const before = await roles.count();
  expect(before).toBe(4);

  await chip(page, 'react').click();

  // Filtering narrows the projects, never the career: a reader must not think
  // that selecting a technology erased jobs.
  await expect(roles).toHaveCount(before);
  for (let i = 0; i < before; i += 1) {
    await expect(roles.nth(i)).toBeVisible();
    await expect(roles.nth(i)).not.toHaveAttribute('data-match', 'false');
  }
});

test('every role bar spans the rows of the projects done during it', async ({ page }) => {
  await page.goto('/');

  // The layout's whole claim is geometric: a project built during a job sits
  // beside that job's bar. Verify it in real pixels, not just in the unit test.
  const kpmg = page.locator('.tl-role', { hasText: 'KPMG Italy' });
  const bar = (await kpmg.boundingBox())!;

  for (const title of ['Anki uploader', 'Drone simulator', 'Cashflow visualization']) {
    const project = page.locator('[data-entry]', { hasText: title }).first();
    const box = (await project.boundingBox())!;
    const centre = box.y + box.height / 2;
    expect(centre).toBeGreaterThanOrEqual(bar.y - 1);
    expect(centre).toBeLessThanOrEqual(bar.y + bar.height + 1);
  }

  // ...and a project from a different job must fall outside that same bar.
  const outside = page.locator('[data-entry]', { hasText: 'MailSense' }).first();
  const outsideBox = (await outside.boundingBox())!;
  expect(outsideBox.y + outsideBox.height / 2).toBeLessThan(bar.y);
});

test('the two columns collapse to one chronological column on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/');

  const reading = await page.evaluate(() =>
    [...document.querySelectorAll('.tl-role h3 + p, .tl-project h3')].map((el) =>
      (el.textContent ?? '').trim(),
    ),
  );
  // A phone should read as "here is the job, here is what I built during it".
  expect(reading.slice(0, 4)).toEqual([
    'Backwell Tech Corp',
    'Customer Intelligence',
    'MailSense',
    'Scale-up platform',
  ]);

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBe(0);
});

test('OR semantics: two selections widen the result set', async ({ page }) => {
  await page.goto('/');
  await chip(page, 'react').click();
  const afterOne = await page.locator('[data-entry][data-match="true"]').count();
  await chip(page, 'kotlin').click();
  const afterTwo = await page.locator('[data-entry][data-match="true"]').count();
  expect(afterTwo).toBeGreaterThan(afterOne);
});

test('selection round-trips through the URL', async ({ page }) => {
  await page.goto('/');
  await chip(page, 'react').click();
  await chip(page, 'csharp').click();
  await expect(page).toHaveURL(/\?tech=csharp,react$/);

  // A shared link opens pre-filtered.
  const matched = await page.locator('[data-entry][data-match="true"]').count();
  await page.goto('/?tech=csharp,react');
  await expect(page.locator('#tech-react')).toBeChecked();
  await expect(page.locator('#tech-csharp')).toBeChecked();
  await expect(page.locator('[data-entry][data-match="true"]')).toHaveCount(matched);
});

test('an unknown slug in the URL is ignored', async ({ page }) => {
  await page.goto('/?tech=react,notathing');
  await expect(page.locator('#tech-react')).toBeChecked();
  await expect(page.locator(timeline)).toHaveAttribute('data-filtering', 'true');
});

test('Clear restores the full timeline and drops the URL parameter', async ({ page }) => {
  await page.goto('/?tech=react');
  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(page.locator(timeline)).toHaveAttribute('data-filtering', 'false');
  await expect(page.locator('[data-entry][data-match="true"]')).toHaveCount(15);
  await expect(page).not.toHaveURL(/tech=/);
});
