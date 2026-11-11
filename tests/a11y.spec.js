// Automated accessibility audit (axe-core, WCAG 2.1 A + AA) in light and dark mode,
// plus a few things axe cannot judge on its own.
const { test, expect, LANGS } = require('./fixtures');
const AxeBuilder = require('@axe-core/playwright').default;

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

function summary(violations) {
  return violations.map(v => `${v.id} (${v.impact}): ${v.help}\n  ` +
    v.nodes.slice(0, 5).map(n => n.target.join(' ') + (n.failureSummary ? ' — ' + n.failureSummary.split('\n')[1] : '')).join('\n  ')).join('\n');
}

for (const { code, path } of LANGS) {
  for (const scheme of ['light', 'dark']) {
    test(`no WCAG A/AA violations [${code}, ${scheme}]`, async ({ page }) => {
      // reduced motion: every section is fully visible at once, so axe sees real colours
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(violations, summary(violations)).toEqual([]);
    });
  }

  test(`product panel is accessible when open [${code}]`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await page.locator('.row-btn').nth(2).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).include('#drawer').withTags(TAGS).analyze();
    expect(violations, summary(violations)).toEqual([]);
  });
}

test('every interactive control has an accessible name', async ({ page }) => {
  await page.goto('/');
  const unnamed = await page.evaluate(() =>
    [...document.querySelectorAll('a[href], button')]
      .filter(el => !el.closest('[inert]'))
      .filter(el => !(el.getAttribute('aria-label') || el.textContent.trim() || el.querySelector('img[alt]')))
      .map(el => el.outerHTML.slice(0, 80)));
  expect(unnamed).toEqual([]);
});

test('the skip link is the first stop and jumps to the content', async ({ page, browserName }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'no Tab key on phones');
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.locator('.skip');
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('respects reduced motion: the typing effect stays still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForTimeout(3500);
  await expect(page.locator('#typed')).toHaveText('QA Engineer');
});
