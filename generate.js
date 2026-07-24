/*
 * Static generator for the printable sign-in / sign-up sheet site.
 * Run: node generate.js   ->   writes everything into ./public
 *
 * Page families:
 *   /<slug>/    one page per sheet purpose (data/sheets.json) — live printable preview
 *   /           homepage
 *
 * The artifact IS the page: a paper-styled sheet with editable title and column
 * headings, adjustable rows/orientation, printed via the browser (or saved as PDF
 * from the print dialog). Print CSS strips everything but the sheet.
 */
const fs = require("fs");
const path = require("path");

// ---- config -------------------------------------------------------------
const DOMAIN = process.env.DOMAIN || "https://sheets.elevatedprogress.com";
const BASE = process.env.BASE || "";
const SITE = "Sheet Maker";
const OUT = path.join(__dirname, "public");
const ASSETS = path.join(__dirname, "assets");
const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "sheets.json"), "utf8"));
const SHEETS = DATA.sheets;

const DEFAULT_ROWS = 20;

// ---- html layout --------------------------------------------------------
function layout({ title, desc, urlPath, h1, body }) {
  const canonical = DOMAIN + BASE + urlPath;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<link rel="stylesheet" href="${BASE}/styles.css">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5580575158570188" crossorigin="anonymous"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TJY4TRRKD6"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-TJY4TRRKD6');</script>
</head>
<body>
<header class="site-head no-print"><div class="wrap">
  <a class="brand" href="${BASE}/">🖨️ ${SITE}</a>
  <nav class="nav"><a href="${BASE}/#sign-in">Sign-In</a><a href="${BASE}/#sign-up">Sign-Up</a><a href="${BASE}/#logs">Logs</a></nav>
</div></header>
<main class="wrap">
  <div class="crumbs no-print"><a href="${BASE}/">Home</a> ›&nbsp;${h1}</div>
  <h1 class="no-print">${h1}</h1>
  ${body}
</main>
<footer class="site-foot no-print"><div class="wrap">
  <a href="${BASE}/">Home</a><a href="${BASE}/#sign-in">Sign-In Sheets</a><a href="${BASE}/#sign-up">Sign-Up Sheets</a>
  <span>· ${SITE} — free printable sign-in and sign-up sheets. No downloads, no signups: customize and print. Part of <a href="https://elevatedprogress.com/">Elevated Progress</a>. · <a href="https://elevatedprogress.com/privacy/">Privacy Policy</a></span>
</div></footer>
<script src="${BASE}/tool.js" defer></script>
</body>
</html>`;
}
function grid(links) {
  return `<div class="grid">` + links.map(l =>
    `<a href="${BASE}${l.href}">${l.emoji ? `<span class="chip-emoji">${l.emoji}</span>` : ""}${l.label}</a>`).join("") + `</div>`;
}

// ---- write helpers ------------------------------------------------------
const urls = [];
function writePage(urlPath, html) {
  const dir = path.join(OUT, urlPath.replace(/^\/+|\/+$/g, ""));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  urls.push(urlPath);
}

// ---- build --------------------------------------------------------------
fs.mkdirSync(OUT, { recursive: true });
for (const entry of fs.readdirSync(OUT)) {
  if (entry === ".git" || entry === "CNAME") continue;
  fs.rmSync(path.join(OUT, entry), { recursive: true, force: true });
}
for (const f of fs.readdirSync(ASSETS)) fs.copyFileSync(path.join(ASSETS, f), path.join(OUT, f));

const linkFor = s => ({ href: `/${s.slug}/`, emoji: s.emoji, label: s.title });
const IN_SHEETS = SHEETS.filter(s => s.type === "in");
const UP_SHEETS = SHEETS.filter(s => s.type === "up");
const LOG_SHEETS = SHEETS.filter(s => s.type === "log");
const GROUP = {
  in: { list: IN_SHEETS, label: "sign-in" },
  up: { list: UP_SHEETS, label: "sign-up" },
  log: { list: LOG_SHEETS, label: "log" },
};

for (const s of SHEETS) {
  const urlPath = `/${s.slug}/`;
  const title = `Free Printable ${s.title} — Print or Save as PDF`;
  const desc = `${s.blurb.split(". ")[0]}. Customize the title, columns, and rows right on the page, then print — or save as a PDF from the print dialog. No download or signup.`;

  const controls = `<div class="controls no-print">
    <div class="row">
      <div><label for="t">Sheet title (prints at the top)</label><input type="text" id="t" data-ctl="title" value="${s.title}"></div>
      <div><label for="r">Rows</label><select id="r" data-ctl="rows">${[10, 15, 20, 25, 30, 40].map(n => `<option value="${n}"${n === DEFAULT_ROWS ? " selected" : ""}>${n} rows</option>`).join("")}</select></div>
      <div><label for="o">Paper</label><select id="o" data-ctl="orient"><option value="portrait">Portrait</option><option value="landscape"${s.cols.length >= 5 ? " selected" : ""}>Landscape</option></select></div>
      <div><label for="d">Date line</label><select id="d" data-ctl="dateline"><option value="1">Show</option><option value="0">Hide</option></select></div>
    </div>
    <div class="ctl-foot">
      <button type="button" class="print-btn" data-ctl="print">🖨️ Print this sheet</button>
      <span class="hint">Tip: click any column heading to edit it. "Save as PDF" is a destination in the print dialog.</span>
    </div>
  </div>`;

  const sheet = `<div class="sheet${s.cols.length >= 5 ? " landscape" : ""}" data-sheet>
    <h2 class="sheet-title" contenteditable="true" spellcheck="false">${s.title}</h2>
    <div class="dateline">Date: ____________________ &nbsp;&nbsp; Location/Event: ____________________</div>
    <table class="sheet-tbl"><thead><tr><th class="rownum">#</th>${s.cols.map((c, i) => `<th contenteditable="true" spellcheck="false"${i === 0 ? ` class="wide"` : ""}>${c}</th>`).join("")}</tr></thead>
    <tbody>${Array.from({ length: DEFAULT_ROWS }, (_, i) => `<tr><td class="rownum">${i + 1}</td>${s.cols.map(() => "<td></td>").join("")}</tr>`).join("\n")}</tbody></table>
  </div>`;

  const related = GROUP[s.type].list.filter(o => o.slug !== s.slug).map(linkFor)
    .concat(SHEETS.filter(o => o.generic && o.slug !== s.slug).map(linkFor));

  const body = `${controls}
  ${sheet}
  <div class="ad-slot no-print">Advertisement</div>
  <div class="prose no-print">
    <p>${s.blurb}</p>
    <p>${s.tip}</p>
    <p><b>To print:</b> adjust the title, rows, and columns above (column headings are click-to-edit), then hit Print. <b>To save a PDF instead:</b> choose "Save as PDF" as the printer in the print dialog — same result, no software needed. Everything except the sheet is stripped from the printout automatically.</p>
  </div>
  <h2 class="no-print">More ${GROUP[s.type].label} sheets</h2>
  <div class="no-print">${grid(related)}</div>
  <div class="ad-slot no-print">Advertisement</div>`;

  writePage(urlPath, layout({ title, desc, urlPath, h1: `Printable ${s.title}`, body }));
}

// -- homepage --
{
  const title = `Free Printable Sign-In & Sign-Up Sheets — Customize and Print`;
  const desc = `Printable sign-in sheets and sign-up sheets for daycare, meetings, open houses, potlucks, volunteers, and more. Edit the title and columns on the page, choose rows, print or save as PDF. Free, no signup.`;
  const body = `<p class="lead">Pick a sheet, tweak the title and columns right on the page, and print. Every sheet also saves as a PDF from the print dialog — no downloads, no account, nothing to install.</p>
  <h2 id="sign-in">Sign-in &amp; attendance sheets</h2>
  ${grid(IN_SHEETS.map(linkFor).concat([linkFor(SHEETS.find(s => s.slug === "sign-in-sheet"))]))}
  <h2 id="sign-up">Sign-up sheets</h2>
  ${grid(UP_SHEETS.map(linkFor).concat([linkFor(SHEETS.find(s => s.slug === "sign-up-sheet"))]))}
  <h2 id="logs">Log sheets &amp; trackers</h2>
  ${grid(LOG_SHEETS.map(linkFor))}
  <div class="ad-slot no-print">Advertisement</div>
  <div class="prose"><p>These are working tools, not template downloads: the sheet you see on each page is the sheet that prints. Click a column heading to rename it, add rows for big groups, flip to landscape for wide tables, and the print stylesheet strips everything else off the page automatically.</p></div>`;
  writePage(`/`, layout({ title, desc, urlPath: `/`, h1: `Printable Sign-In &amp; Sign-Up Sheets`, body }));
}

// -- sitemap + robots + meta files --
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${DOMAIN}${BASE}${u}</loc></url>`).join("\n")}
</urlset>`;
fs.writeFileSync(path.join(OUT, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${DOMAIN}${BASE}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
fs.writeFileSync(path.join(OUT, "CNAME"), "sheets.elevatedprogress.com\n");
fs.writeFileSync(path.join(OUT, "ads.txt"), "google.com, pub-5580575158570188, DIRECT, f08c47fec0942fa0\n");

console.log(`Generated ${urls.length} pages into ./public`);
