// Content, SEO and privacy checks for both language versions.
const { test, expect, LANGS } = require('./fixtures');
const base = require('@playwright/test');

for (const { code, path } of LANGS) {
  test.describe(`content [${code}]`, () => {
    test.beforeEach(async ({ page }) => { await page.goto(path); });

    test('has the right language, title and main heading', async ({ page }) => {
      await expect(page.locator('html')).toHaveAttribute('lang', code);
      await expect(page).toHaveTitle('Kseniia Horina — QA Engineer');
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(/Kseniia\s*Horina/);
    });

    test('declares canonical URL, hreflang alternates and social preview', async ({ page, request }) => {
      const canonical = `https://kseniia-horina.github.io${path}`;
      await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', canonical);
      await expect(page.locator('link[hreflang=en]')).toHaveAttribute('href', 'https://kseniia-horina.github.io/');
      await expect(page.locator('link[hreflang=pl]')).toHaveAttribute('href', 'https://kseniia-horina.github.io/pl/');
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);

      const og = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(og).toMatch(new RegExp(`/assets/img/og-${code}\\.png$`));
      const res = await request.get(new URL(og).pathname);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toBe('image/png');
    });

    test('has valid structured data about the person', async ({ page }) => {
      const json = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
      expect(json['@type']).toBe('Person');
      expect(json.name).toBe('Kseniia Horina');
      expect(json.worksFor.name).toBe('i2a Solutions');
      expect(json.sameAs).toContain('https://www.linkedin.com/in/kseniia-horina/');
    });

    test('every in-page link points to an element that exists', async ({ page }) => {
      const hrefs = await page.locator('a[href^="#"]').evaluateAll(as => as.map(a => a.getAttribute('href')));
      expect(hrefs.length).toBeGreaterThan(5);
      for (const h of new Set(hrefs)) {
        await expect(page.locator(h), `target of ${h}`).toHaveCount(1);
      }
    });

    test('shows both current roles with start dates and a live duration', async ({ page }) => {
      const cards = page.locator('#experience .role-card');
      await expect(cards).toHaveCount(2);
      const dates = code === 'en'
        ? ['Feb 2023 – present', 'Nov 2023 – present']
        : ['Luty 2023 – obecnie', 'Listopad 2023 – obecnie'];
      for (let i = 0; i < 2; i++) {
        await expect(cards.nth(i).locator('.role-dates')).toContainText(dates[i]);
        await expect(cards.nth(i).locator('.dur')).toHaveText(/^· \d/);
      }
      await expect(page.locator('#naqa .eyebrow')).toHaveText(code === 'en' ? 'Nov 2023 – present' : 'Listopad 2023 – obecnie');
    });

    test('states 5 NAQA accreditation evaluations across three fields', async ({ page }) => {
      await expect(page.locator('#naqa .naqa-big .n')).toHaveAttribute('data-count', '5');
      const fields = code === 'en'
        ? ['Biomedical Engineering', 'Computer Science', 'Computer Engineering']
        : ['inżynierii biomedycznej', 'informatyki', 'inżynierii komputerowej'];
      for (const where of ['#naqa .findings li >> nth=0', '#experience .role-card >> nth=1']) {
        for (const f of fields) await expect(page.locator(where)).toContainText(f);
      }
      await expect(page.locator('#naqa .findings li').first()).toContainText(code === 'en' ? '5 accreditation evaluations' : '5 ocen akredytacyjnych');
    });

    test('matches the current CV (Kseniia_Horina_QAE.pdf)', async ({ page }) => {
      const body = page.locator('body');
      const facts = code === 'en'
        ? ['3.5+ years', 'QA Lead', '10 QA engineers', 'Meharry Medical College', 'MSc, Biomedical Engineering',
           'Sep 2026 – Dec 2027', 'IEC 62304', 'EF SET', 'EU work rights in Poland', 'B2B', '~2,000', '30 / day']
        : ['Ponad 3,5 roku', 'QA Lead', '10 inżynierów QA', 'Meharry Medical College', 'Magister, inżynieria biomedyczna',
           'Wrz 2026 – gru 2027', 'IEC 62304', 'EF SET', 'Prawo do pracy w UE', 'B2B', '~2000', '30 / dzień'];
      for (const f of facts) await expect(body, f).toContainText(f);
      for (const stale of ['Meherry', 'Medical School', 'two QA engineers', 'dwóch inżynierów', 'Three years', 'Trzy lata']) {
        await expect(body, stale).not.toContainText(stale);
      }
      await expect(page.locator('#impact .imp')).toHaveCount(5);
    });

    test('the terminal summary count matches its checks', async ({ page }) => {
      const checks = await page.locator('#term .ok').count();
      await expect(page.locator('#term .sum')).toContainText(`${checks} passed, 0 failed`);
    });

    test('does not publish a phone number', async ({ page }) => {
      await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
      const html = await page.content();
      expect(html).not.toMatch(/\+?48[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}/);
    });

    test('loads fonts from this site, not from Google', async ({ page, externalRequests }) => {
      await page.reload();
      await page.evaluate(() => document.fonts.ready);
      expect(externalRequests.filter(u => /fonts\.(googleapis|gstatic)\.com/.test(u))).toEqual([]);
      const loaded = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '')));
      expect(loaded).toEqual(expect.arrayContaining(['Space Grotesk', 'Source Serif 4']));
    });

    test('analytics stay off until a code is configured', async ({ page, externalRequests }) => {
      await page.waitForLoadState('networkidle');
      expect(externalRequests.filter(u => u.includes('goatcounter') || u.includes('gc.zgo.at'))).toEqual([]);
    });
  });
}

test('robots.txt and sitemap.xml are served and list both languages', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Sitemap: https://kseniia-horina.github.io/sitemap.xml');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('<loc>https://kseniia-horina.github.io/</loc>');
  expect(sitemap).toContain('<loc>https://kseniia-horina.github.io/pl/</loc>');
});

// Uses the plain Playwright page: the browser rightly logs the 404 status as a console error.
base.test('unknown pages get a friendly 404 with a way home', async ({ page }) => {
  const res = await page.goto('/no-such-page');
  expect(res.status()).toBe(404);
  await base.expect(page.locator('#path')).toHaveText('/no-such-page');
  await page.getByRole('link', { name: 'Back to the portfolio' }).click();
  await base.expect(page).toHaveURL(/\/$/);
});
