import puppeteer from "/Users/stuartxu/node_modules/puppeteer/lib/puppeteer/puppeteer.js";
const [url, out, scrollFrac] = [process.argv[2], process.argv[3], parseFloat(process.argv[4]||"0")];
const b = await puppeteer.launch({ headless: "new" });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
await p.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
await p.evaluate(async (frac) => {
  const h = document.body.scrollHeight;
  for (let y = 0; y < h; y += window.innerHeight*0.8){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,150)); }
  window.scrollTo(0, h*frac);
}, scrollFrac);
await new Promise(r=>setTimeout(r,4000));
await p.screenshot({ path: out });
await b.close();
console.log("saved", out);
