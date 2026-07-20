# CLAUDE.md — sheetkit

Project instructions for Claude Code working in this repo. Inherits the ElevatedProgress
venture playbook from the parent folder's CLAUDE.md.

## What this is

A zero-dependency static-site generator for **free printable sign-in / sign-up sheets**
(daycare, AA meetings, open house, potluck, volunteers…). `generate.js` reads
`data/sheets.json` + `assets/` and writes one page per sheet purpose into `public/`.
Target: https://sheets.elevatedprogress.com/. Born from the 2026-07-19 niche-mining run:
the biggest artifact-shaped query family found (100+ autocomplete variants), competition
is template mills (eForms/TemplateRoller), and these SERPs get no AI answer box because
the answer is a printable document.

## The product rule

**The artifact IS the page.** Each page server-renders the actual sheet (paper-styled
table); `assets/tool.js` only adjusts it (title, rows, orientation, date line) and calls
`window.print()`. Column headings and the title are `contenteditable`. Print CSS strips
everything with `.no-print`; "save as PDF" is just the print dialog. Never turn this into
a download/builder flow — instant-print is the differentiator vs the template mills.

## Deploy — just push

`git push` to `main` is the deploy — GitHub Actions (`.github/workflows/deploy.yml`).

- **Never manually build and commit output.** `public/` is git-ignored build output.
- **Never hand-edit anything in `public/`.**
- Commit as the neutral identity:
  `git -c user.name="sheetkit" -c user.email="sheetkit@users.noreply.github.com" commit …`

## Local build / preview

```
node generate.js     # writes ./public
node server.js       # preview at http://localhost:5062 (5060/5061 are Chrome-blocked SIP ports)
```

## Adding a sheet

Add an entry to `data/sheets.json`: slug (match the real search query, e.g.
"daycare-sign-in-sheet"), title, type ("in"/"up"), emoji, cols (the printed column
headings), blurb + tip (honest, practical copy — cite the real-world rule that makes the
sheet matter, like licensing/OSHA/HIPAA context). 5+ columns auto-defaults to landscape.

## Don't break these (generated, must keep serving)

- `ads.txt` + AdSense loader in `<head>` — publisher `ca-pub-5580575158570188`.
- `sitemap.xml`, `robots.txt`, `.nojekyll`, `CNAME` (sheets.elevatedprogress.com).
- GSC verification file once the property is verified.

## Config knobs

`DOMAIN` and `BASE`, same semantics as the other tools. Production values in the workflow.
