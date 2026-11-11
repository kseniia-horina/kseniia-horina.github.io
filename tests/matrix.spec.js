// The coverage matrix: filters, counts and the product details panel.
const { test, expect, LANGS } = require('./fixtures');

const EXPECTED = { all: 12, health: 5, access: 1, telecom: 1, other: 5, devices: 5, sole: 9 };

test.describe('coverage matrix', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/#coverage'); });

  test('lists all 12 products by default', async ({ page }) => {
    await expect(page.locator('#rows tr:visible')).toHaveCount(12);
    await expect(page.locator('#count')).toHaveText('Showing all 12 products');
  });

  for (const [filter, n] of Object.entries(EXPECTED)) {
    test(`filter "${filter}" shows ${n} product(s) and says so`, async ({ page }) => {
      const chip = page.locator(`.chip[data-filter="${filter}"]`);
      await expect(chip.locator('.n')).toHaveText(String(n));
      await chip.click();
      await expect(chip).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('.chip[aria-pressed="true"]')).toHaveCount(1);
      await expect(page.locator('#rows tr:visible')).toHaveCount(n);
      if (filter !== 'all') await expect(page.locator('#count')).toContainText(`Showing ${n} of 12`);
    });
  }

  test('"Sole QA" never shows a product tested with a team', async ({ page }) => {
    await page.locator('.chip[data-filter="sole"]').click();
    await expect(page.locator('#rows tr:visible .mark.team')).toHaveCount(0);
  });

  test('opens product details, then closes with Escape and returns focus', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'Details: Nadi' });
    await btn.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('#drawerTitle')).toHaveText('Nadi');
    await expect(dialog).toContainText('Sole QA');
    await expect(dialog.locator('.plat-tag.on')).toHaveText(['✓ Web', '✓ iOS', '✓ Android', '✓ Devices']);
    await expect(page.locator('#drawerClose')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(btn).toBeFocused();
  });

  test('clicking anywhere on a row opens it too', async ({ page }) => {
    await page.locator('#rows tr', { hasText: 'TelCloud' }).locator('.client').click();
    await expect(page.locator('#drawerTitle')).toHaveText('TelCloud');
    await expect(page.locator('#drawerBody')).toContainText('Part of a wider QA team');
    await expect(page.locator('#drawerBody .tools li')).toHaveText(['Jira', 'Confluence']);
  });

  test('Prev / Next only walk through the filtered products', async ({ page }) => {
    await page.locator('.chip[data-filter="devices"]').click();
    await page.getByRole('button', { name: 'Details: Athelo Health' }).click();
    const title = page.locator('#drawerTitle');
    await expect(page.locator('#drawerPrev')).toBeDisabled();
    const seen = [await title.textContent()];
    for (let i = 0; i < 4; i++) {
      await page.locator('#drawerNext').click();
      seen.push(await title.textContent());
    }
    expect(seen).toEqual(['Athelo Health', 'Nadi', 'TelCloud', 'Venuetize PSN', 'Guru Experience apps']);
    await expect(page.locator('#drawerNext')).toBeDisabled();
    await page.keyboard.press('ArrowLeft');
    await expect(title).toHaveText('Venuetize PSN');
  });

  test('keeps keyboard focus inside the open panel', async ({ page }) => {
    await page.getByRole('button', { name: 'Details: Sensei Cloud' }).click();
    await expect(page.locator('#drawerClose')).toBeFocused();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement.closest('#drawer'))).toBe(true);
    }
  });

  test('clicking the backdrop closes the panel', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'the panel is full-width on phones');
    await page.getByRole('button', { name: 'Details: Beyond Law' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.locator('#drawerBackdrop').click({ position: { x: 10, y: 300 } });
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});

for (const { code, path } of LANGS) {
  test.describe(`without JavaScript [${code}]`, () => {
    test.use({ javaScriptEnabled: false });
    test('the matrix and its dots are still readable', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('#rows tr')).toHaveCount(12);
      await expect(page.locator('#rows tr').first()).toBeVisible();
      const transform = await page.locator('#rows .mark').first().evaluate(m => getComputedStyle(m).transform);
      expect(transform).toBe('matrix(1, 0, 0, 1, 0, 0)');
      await expect(page.locator('.row-btn').first()).toBeHidden();
    });
  });
}
