// Navigation, tabs, theme, language switch, copy-to-clipboard and the mobile menu.
const { test, expect, LANGS } = require('./fixtures');

test.describe('domain tabs', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/#domains'); });

  test('clicking a tab shows only its panel', async ({ page }) => {
    await page.getByRole('tab', { name: /Accessibility/ }).click();
    await expect(page.getByRole('tab', { name: /Accessibility/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[role=tabpanel]:visible')).toHaveCount(1);
    await expect(page.locator('#panel-access')).toBeVisible();
    await expect(page.locator('#panel-access')).toContainText('Nadi');
  });

  test('arrow keys, Home and End move between tabs', async ({ page }) => {
    await page.getByRole('tab', { name: /Healthcare/ }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tab-access')).toBeFocused();
    await expect(page.locator('#panel-access')).toBeVisible();
    await page.keyboard.press('End');
    await expect(page.locator('#tab-breadth')).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tab-health')).toBeFocused(); // wraps around
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#panel-breadth')).toBeVisible();
    await page.keyboard.press('Home');
    await expect(page.locator('#panel-health')).toBeVisible();
  });
});

test.describe('theme', () => {
  test('the toggle switches theme and remembers it after reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');
    await page.locator('#themeToggle').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('#themeToggle')).toHaveAttribute('aria-label', 'Switch to light mode');
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await page.goto('/pl/'); // same choice carries over to the other language
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('follows the system setting on a first visit, even when it changes', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('a theme picked on the site wins over later system changes', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.locator('#themeToggle').click();
    await page.emulateMedia({ colorScheme: 'light' });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('language switch', () => {
  test('goes EN → PL → EN and keeps the current section', async ({ page }) => {
    await page.goto('/#toolkit');
    await page.locator('[data-lang-switch]').click();
    await expect(page).toHaveURL(/\/pl\/#toolkit$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
    await expect(page.locator('#toolkit h2')).toHaveText('Po co sięgam');
    await page.locator('[data-lang-switch]').click();
    await expect(page).toHaveURL(/localhost:\d+\/#toolkit$/);
    await expect(page.locator('#toolkit h2')).toHaveText('What I reach for');
  });
});

for (const { code, path } of LANGS) {
  test(`copy email button puts the address on the clipboard [${code}]`, async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only in Playwright');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(path + '#contact');
    await page.locator('[data-copy]').click();
    await expect(page.locator('#toast')).toHaveClass(/show/);
    await expect(page.locator('#toast')).toContainText('kseniiahorina@gmail.com');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('kseniiahorina@gmail.com');
  });
}

test('contact links open the right places', async ({ page }) => {
  await page.goto('/#contact');
  await expect(page.locator('.contact a[href^="mailto:"]')).toHaveAttribute('href', 'mailto:kseniiahorina@gmail.com');
  for (const href of ['https://www.linkedin.com/in/kseniia-horina/', 'https://t.me/s_killl_s']) {
    const link = page.locator(`.contact a[href="${href}"]`);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }
});

test('nav highlights the section being read', async ({ page }) => {
  await page.goto('/');
  await page.locator('#toolkit').scrollIntoViewIfNeeded();
  await page.evaluate(() => document.getElementById('toolkit').scrollIntoView({ block: 'start' }));
  await expect(page.locator('.navlinks a[href="#toolkit"]')).toHaveClass(/active/);
});

test('stats count up to their real values', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.getElementById('tally').scrollIntoView({ block: 'center' }));
  await expect(page.locator('#tally .n')).toHaveText(['12', '6', '9 / 12', '5', '~50%']);
});

test.describe('mobile menu', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'only on phone-sized screens');
  });

  test('opens, navigates and closes', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('#menuBtn');
    await expect(page.locator('#nav')).not.toHaveClass(/menu-open/);
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#nav')).toHaveClass(/menu-open/);
    await page.locator('#navlinks a[href="#contact"]').click();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#contact')).toBeInViewport();
  });

  test('Escape closes it and returns focus to the button', async ({ page }) => {
    await page.goto('/');
    await page.locator('#menuBtn').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#menuBtn')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#menuBtn')).toBeFocused();
  });
});
