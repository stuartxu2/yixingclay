import puppeteer from "/Users/stuartxu/node_modules/puppeteer/lib/puppeteer/puppeteer.js";

const url = process.argv[2];
const out = process.argv[3];
const browser = await puppeteer.launch({
  headless: "new",
  protocolTimeout: 180000,
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1600, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await new Promise((r) => setTimeout(r, 5000));
await page.screenshot({ path: out, fullPage: false });
await browser.close();
console.log("saved", out);
