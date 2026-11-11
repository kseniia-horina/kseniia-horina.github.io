// Guards the CI setup: the Playwright Docker image must match the installed Playwright,
// otherwise the browsers inside the image won't be the ones the test runner expects.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('CI container image matches the pinned Playwright version', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'config check, run once');
  const root = path.join(__dirname, '..');
  const pinned = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).devDependencies['@playwright/test'];
  expect(pinned, 'pin an exact version, not a range').toMatch(/^\d+\.\d+\.\d+$/);
  const installed = require('@playwright/test/package.json').version;
  expect(installed).toBe(pinned);
  const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'tests.yml'), 'utf8');
  expect(workflow).toContain(`mcr.microsoft.com/playwright:v${pinned}-`);
});
