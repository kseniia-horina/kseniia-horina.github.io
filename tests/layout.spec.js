// Responsive layout: nothing spills sideways at common screen widths.
const { test, expect, LANGS } = require('./fixtures');

const WIDTHS = [320, 375, 414, 768, 1024, 1280, 1920];

test.describe('responsive layout', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'widths are set explicitly; one project is enough');
  });

  for (const { code, path } of LANGS) {
    for (const width of WIDTHS) {
      test(`no horizontal scrolling at ${width}px [${code}]`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(path);
        const overflow = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          const wide = [...document.querySelectorAll('main *, footer *, nav *')]
            .filter(el => !el.closest('.hero-bg, .tablist, [hidden], .navlinks, .sr-only, caption'))
            .filter(el => !el.closest('thead') || getComputedStyle(el.closest('thead')).position !== 'absolute') // visually hidden on phones
            .filter(el => el.getBoundingClientRect().right > vw + 1)
            .map(el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''));
          return { scroll: document.documentElement.scrollWidth - vw, wide: [...new Set(wide)].slice(0, 8) };
        });
        expect(overflow.scroll, `elements past the right edge: ${overflow.wide.join(', ')}`).toBeLessThanOrEqual(0);
        expect(overflow.wide).toEqual([]);
      });
    }
  }

  test('the email address never breaks mid-word on desktop', async ({ page }) => {
    for (const width of [1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/#contact');
      const lines = await page.locator('.contact-card .v').first().evaluate(el => {
        const r = document.createRange(); r.selectNodeContents(el);
        return new Set([...r.getClientRects()].map(x => Math.round(x.top))).size;
      });
      expect(lines, `email wraps at ${width}px`).toBe(1);
    }
  });

  test('phone layout stacks the matrix into cards with platform labels', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#coverage');
    await expect(page.locator('#matrix thead')).toHaveCSS('position', 'absolute');
    const first = page.locator('#rows tr').first();
    const tags = await first.locator('td.cell').evaluateAll(cells => cells
      .filter(c => getComputedStyle(c).display !== 'none')
      .map(c => getComputedStyle(c, '::after').content.replace(/"/g, '')));
    expect(tags).toEqual(['Web', 'API']);
  });
});
