const path = require("path");
const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

app.post("/screenshot", async (req, res) => {
  const cdkey = (req.body && req.body.cdkey ? String(req.body.cdkey) : "XXXXX-XXXXX-XXXXX").trim();
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1219, height: 1772, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "networkidle0" });
    await page.evaluate((value) => {
      const el = document.querySelector(".code-text");
      if (el) {
        el.textContent = value;
      }
    }, cdkey);
    await page.evaluate(() => {
      const btn = document.querySelector(".capture-btn");
      if (btn) {
        btn.style.display = "none";
      }
      const modal = document.querySelector(".modal");
      if (modal) {
        modal.style.display = "none";
      }
    });
    await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()));
    await page
      .waitForFunction(() => Array.from(document.images).every((img) => img.complete), { timeout: 5000 })
      .catch(() => undefined);
    const canvas = await page.$(".canvas");
    if (!canvas) {
      throw new Error("Canvas element not found.");
    }
    const buffer = await canvas.screenshot({ type: "png" });
    res.setHeader("Content-Type", "image/png");
    const filename = "订单截图.png";
    const encoded = encodeURIComponent(filename);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=\"order_screenshot.png\"; filename*=UTF-8''${encoded}`
    );
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("截图失败");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(port, () => {
  console.log(`Screenshot server running at http://localhost:${port}`);
});
