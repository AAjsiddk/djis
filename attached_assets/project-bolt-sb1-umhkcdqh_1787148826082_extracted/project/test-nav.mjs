import puppeteer from 'puppeteer-core';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

await page.goto('http://localhost:4179', { waitUntil: 'networkidle0' });
await sleep(1500);

// Login
await page.type('input[type="password"]', 'AAO818');
const btns0 = await page.$$('button');
for (const b of btns0) {
  const t = await page.evaluate(el => el.textContent, b);
  if (t && t.trim() === 'دخول') { await b.click(); break; }
}
await sleep(2000);

// After login — check all h1 elements
const h1s = await page.$$eval('h1', els => els.map(e => e.textContent));
console.log('After login, all h1 texts:', JSON.stringify(h1s));

// Navigate to courses
const navBtns = await page.$$('nav button');
console.log('Nav buttons count:', navBtns.length);
for (let i = 0; i < navBtns.length; i++) {
  const t = await page.evaluate(el => el.textContent, navBtns[i]);
  console.log(`  nav[${i}]:`, t.trim());
}
await navBtns[1].click();
await sleep(1500);
const h1s2 = await page.$$eval('h1', els => els.map(e => e.textContent));
console.log('After nav to courses, all h1 texts:', JSON.stringify(h1s2));

// Check main content area
const mainH1 = await page.$eval('main h1', el => el.textContent);
console.log('main h1:', mainH1);

await browser.close();
