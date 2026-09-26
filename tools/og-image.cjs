/*
  Vygeneruje obrázky na zdieľanie (1200 × 630 px):
    assets/img/og-image.png     (slovenčina, index.html)
    assets/img/og-image-en.png  (angličtina, en/index.html)

  Ilustráciu (tabuľka + telefón) berie priamo z hero sekcie stránok, texty sú nižšie v TEXTS.
  Po zmene ceny alebo nadpisu upravte TEXTS a spustite z koreňa repozitára:

    npm install --no-save playwright
    npx playwright install chromium
    node tools/og-image.cjs
*/
"use strict";

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");

const TEXTS = {
  sk: {
    page: "index.html",
    out: "assets/img/og-image.png",
    size: 86,
    title: 'Priloží mobil.<br><span class="mark">Ohodnotí vás</span><br><span class="mark">na Google.</span>',
    lead: "NFC tabuľky na Google recenzie pre slovenské firmy. <strong>50&nbsp;€ aj s&nbsp;montážou.</strong>"
  },
  en: {
    page: "en/index.html",
    out: "assets/img/og-image-en.png",
    size: 80,
    title: 'They tap.<br><span class="mark">They review</span><br><span class="mark">you on Google.</span>',
    lead: "NFC plates for Google reviews in Slovakia. <strong>€50&nbsp;including installation.</strong>"
  }
};

function extract(html, re, what, file) {
  const m = html.match(re);
  if (!m) throw new Error("V " + file + " chýba " + what);
  return m[0];
}

function build(lang, t) {
  const html = fs.readFileSync(path.join(ROOT, t.page), "utf8");
  const sprite = extract(html, /<svg width="0"[\s\S]*?\n  <\/svg>/, "sprite s ikonami", t.page);
  const scene = extract(html, /<div class="scene" [\s\S]*?<div class="scene-tag">[\s\S]*?<\/div>\s*<\/div>/, "ilustrácia .scene", t.page);
  const logo = extract(html, /<svg class="logo-mark"[\s\S]*?<\/svg>/, "logo", t.page);
  const css = pathToFileURL(path.join(ROOT, "assets/css/style.css")).href;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<link rel="stylesheet" href="${css}">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: var(--paper); }
  .og { display: grid; grid-template-columns: 590px 480px; gap: 10px; align-items: center; height: 630px; padding: 0 20px 0 70px; box-sizing: border-box; }
  .og-copy { display: grid; gap: 26px; justify-items: start; }
  .og .logo { font-size: 2.3rem; gap: 12px; }
  .og .logo-mark { width: 50px; height: 50px; }
  .og h1 { font-size: ${t.size}px; line-height: 1.02; letter-spacing: -0.035em; margin: 0; max-width: none; }
  .og-copy p { font-size: 25px; line-height: 1.45; color: var(--muted); margin: 0; max-width: 30rem; }
  .og-copy p strong { color: var(--ink); }
  .og .scene { width: 480px; }
</style></head><body>
${sprite}
<div class="og">
  <div class="og-copy">
    <span class="logo">${logo}ťukni.sk</span>
    <h1>${t.title}</h1>
    <p>${t.lead}</p>
  </div>
  <div class="hero-visual">${scene}</div>
</div>
</body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: "reduce" });
  for (const [lang, t] of Object.entries(TEXTS)) {
    const tmp = path.join(ROOT, "tools", ".og-" + lang + ".html");
    fs.writeFileSync(tmp, build(lang, t));
    try {
      await page.goto(pathToFileURL(tmp).href);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(ROOT, t.out) });
      console.log("OK " + t.out);
    } finally {
      fs.unlinkSync(tmp);
    }
  }
  await browser.close();
})().catch((err) => { console.error(err); process.exit(1); });
