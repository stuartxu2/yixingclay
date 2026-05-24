import puppeteer from "/Users/stuartxu/node_modules/puppeteer/lib/puppeteer/puppeteer.js";

const url = process.argv[2];
const out = process.argv[3];
const browser = await puppeteer.launch({
  headless: "new",
  protocolTimeout: 120000,
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await new Promise((r) => setTimeout(r, 3000));
await page.evaluate(async () => {
  const step = window.innerHeight * 0.8;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 250));
  }
  window.scrollTo(0, 0);
});
await new Promise((r) => setTimeout(r, 4000));
await page.screenshot({ path: out, fullPage: true, captureBeyondViewport: true });
await browser.close();
console.log("saved", out);
