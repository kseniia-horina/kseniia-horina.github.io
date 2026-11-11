// The English and Polish pages are separate files. These checks catch one being
// updated without the other: same sections, same products, same data.
const { test, expect } = require('./fixtures');

async function snapshot(page, path) {
  await page.goto(path);
  return page.evaluate(() => ({
    sections: [...document.querySelectorAll('main section[id], footer[id]')].map(s => s.id),
    nav: [...document.querySelectorAll('.navlinks a')].map(a => a.getAttribute('href')),
    products: [...document.querySelectorAll('#rows tr')].map(r => ({
      name: r.querySelector('.nm').textContent,
      domain: r.dataset.domain,
      sole: r.dataset.sole || '',
      devices: r.dataset.devices || '',
      color: r.style.getPropertyValue('--c'),
      tools: r.dataset.tools || '',
      ongoing: !!r.querySelector('.pill') && !r.querySelector('.pill').textContent.match(/access|dostęp/),
      marks: [...r.querySelectorAll('td.cell')].map(c => c.querySelector('.mark') ? (c.querySelector('.mark.team') ? 'team' : 'sole') : '-'),
      hasAbout: !!r.dataset.about,
    })),
    stats: [...document.querySelectorAll('[data-count]')].map(n => n.textContent),
    tabs: [...document.querySelectorAll('[role=tab]')].map(t => t.id),
    panelItems: [...document.querySelectorAll('[role=tabpanel]')].map(p => p.querySelectorAll('li').length),
    toolChips: [...document.querySelectorAll('.kit .chips')].map(c => c.children.length),
    education: document.querySelectorAll('.timeline .entry').length,
    certs: document.querySelectorAll('.cert').length,
    contacts: [...document.querySelectorAll('.contact a.contact-card')].map(a => a.getAttribute('href')),
    starts: [...document.querySelectorAll('[data-start]')].map(d => d.dataset.start),
  }));
}

test('English and Polish pages carry the same structure and data', async ({ page }) => {
  const en = await snapshot(page, '/');
  const pl = await snapshot(page, '/pl/');
  expect(pl).toEqual(en);
  expect(en.products).toHaveLength(12);
});

test('the Polish page has no untranslated interface text', async ({ page }) => {
  await page.goto('/pl/');
  const text = await page.locator('body').innerText();
  for (const phrase of ['Showing all', 'Get in touch', 'How I work', 'What I reach for', 'Sole QA', 'present']) {
    expect(text, `"${phrase}" on the Polish page`).not.toContain(phrase);
  }
  await page.locator('.chip[data-filter="sole"]').click();
  await expect(page.locator('#count')).toHaveText('Pokazano 9 z 12 — produkty, w których byłam jedyną osobą w QA');
  await page.getByRole('button', { name: 'Szczegóły: Nadi' }).click();
  await expect(page.locator('#drawerBody')).toContainText('Jedyna osoba w QA');
  await expect(page.locator('#drawerBody')).toContainText('Gdzie działało');
});
