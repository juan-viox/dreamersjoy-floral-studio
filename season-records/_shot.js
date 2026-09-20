const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage({ viewport: { width: 1600, height: 2000 } });
  for (const [html, png] of JSON.parse(process.argv[2])) {
    await pg.goto('file://' + html, { waitUntil: 'networkidle' });
    await pg.waitForTimeout(900);
    await pg.screenshot({ path: png });
  }
  await b.close();
})();
