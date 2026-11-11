// Renders the social preview images (assets/img/og-en.png, og-pl.png) from scripts/og.html.
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

(async () => {
  const out = path.join(__dirname, '..', 'assets', 'img');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const lang of ['en', 'pl']) {
    await page.goto(pathToFileURL(path.join(__dirname, 'og.html')).href + '?lang=' + lang);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(out, `og-${lang}.png`) });
    console.log('wrote assets/img/og-' + lang + '.png');
  }
  await browser.close();
})();
