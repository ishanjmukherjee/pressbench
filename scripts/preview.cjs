// Screenshots the page header and the first two charts into preview.png,
// the image link previews show. Expects the site served at PREVIEW_URL.
const { chromium } = require("playwright");

const URL = process.env.PREVIEW_URL || "http://localhost:8000/";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 900 },
    colorScheme: "dark",
  });
  await page.goto(URL);
  await page.waitForSelector("#stack .row svg");
  await page.evaluate(() => document.fonts.ready);
  // Keep the first two charts and the shared month axis.
  await page.evaluate(() => {
    const rows = [...document.querySelectorAll("#stack .row:not(.axis-row)")];
    rows.slice(2).forEach(r => r.remove());
  });
  await page.waitForTimeout(300);
  const main = await page.$("main");
  await main.screenshot({ path: "preview.png" });
  await browser.close();
})();
