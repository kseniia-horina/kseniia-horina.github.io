// Shared test setup:
//  - the site must work offline: external requests are stubbed (badge, analytics, Google Fonts)
//  - any console error or uncaught exception fails the test
const base = require('@playwright/test');

const STUB_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="110" height="20"/>';

exports.LANGS = [
  { code: 'en', path: '/' },
  { code: 'pl', path: '/pl/' },
];

exports.test = base.test.extend({
  externalRequests: async ({}, use) => { await use([]); },

  page: async ({ page, externalRequests }, use) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));
    await page.route(/^https?:\/\/(?!localhost[:/])/, route => {
      externalRequests.push(route.request().url());
      return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: STUB_SVG });
    });
    await use(page);
    base.expect(errors, 'console errors on the page').toEqual([]);
  },
});

exports.expect = base.expect;
