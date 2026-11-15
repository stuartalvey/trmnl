// Verify the four independent TRMNL templates embed the canonical Gazette CSS.
// Run: node design/check_gazette.cjs
// No network, credentials, private data, or platform APIs required.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(__dirname, "gazette.css"), "utf8");
const views = ["src/full.liquid", "views/weather/full.liquid", "views/sports/full.liquid", "views/health/full.liquid"];
const prefix = "{% comment %}iOS Gazette: shared styles synced from design/gazette.css; no branding displayed{% endcomment %}\n<style>\n";
for (const view of views) {
  const markup = fs.readFileSync(path.join(root, view), "utf8");
  const start = markup.indexOf(prefix);
  assert.ok(start >= 0, view + ": missing shared-style marker");
  const end = markup.indexOf("</style>", start);
  assert.ok(end > start, view + ": style section not closed");
  const embedded = markup.slice(start + prefix.length, end);
  assert.equal(embedded, css, view + ": embedded CSS differs from canonical design/gazette.css");
  assert.ok(markup.includes("gz-title"), view + ": Gazette masthead not found");
  assert.ok(!markup.includes(">THE iOS GAZETTE<"), view + ": internal design name displayed");
  assert.ok(!/gap--small--muted|gap--medium--muted|w--full--muted/.test(markup), view + ": malformed framework class");
}
const market = fs.readFileSync(path.join(root, "views/news-markets/full.liquid"), "utf8");
assert.ok(market.includes("ig-mast-title") && market.includes("ig-section-name"), "Market Intelligence editorial treatment missing");
assert.ok(!market.includes(">THE iOS GAZETTE<"), "Market Intelligence incorrectly displays design-system name");
console.log("Gazette CSS and screen conventions OK: 5 visible pages");
