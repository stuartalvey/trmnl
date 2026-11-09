const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Execute the actual production adapter; every input below is synthetic.
const shared = fs.readFileSync(path.join(__dirname, "../src/shared.liquid"), "utf8");
const match = shared.match(/\/\* AlveyBalance:start \*\/([\s\S]*?)\/\* AlveyBalance:end \*\//);
assert.ok(match, "Production readiness adapter is present");
const context = vm.createContext({});
vm.runInContext(match[1], context);
const api = context.AlveyBalance;
const now = Date.parse("2026-01-15T15:00:00Z") / 1000;
const offset = -18000;
function snapshot(score, updated = "15 Jan 9:45") {
  return '<span class="value value--large" data-fit-value="true">' + score +
    '</span>\n<span class="label">Readiness</span><span class="instance">Last updated: ' + updated + "</span>";
}
const json = value => JSON.parse(JSON.stringify(value));
assert.deepEqual(json(api.calculate(90, 80)), { stuart: 53, ali: 47 });
assert.deepEqual(json(api.calculate(50, 50)), { stuart: 50, ali: 50 });
assert.deepEqual(json(api.calculate(0, 80)), { stuart: 0, ali: 100 });
assert.deepEqual(json(api.calculate(100, 0)), { stuart: 100, ali: 0 });
for (const [a, b] of [[0, 0], [null, 80], [undefined, 80], [-1, 80], [101, 80], [NaN, 80]]) assert.equal(api.calculate(a, b), null);
for (let a = 0; a <= 100; a++) for (let b = 0; b <= 100; b++) {
  const balance = api.calculate(a, b);
  if (balance) assert.equal(balance.stuart + balance.ali, 100);
}
const ready = api.buildState(snapshot(90), snapshot(80), now, offset);
assert.equal(ready.status, "ready");
assert.deepEqual(json(ready.balance), { stuart: 53, ali: 47 });
assert.equal(api.parseSnapshot(snapshot(0), now, offset).status, "fresh");
assert.equal(api.parseSnapshot(snapshot(100), now, offset).score, 100);
assert.equal(api.parseSnapshot(snapshot(101), now, offset).status, "invalid");
assert.equal(api.parseSnapshot(snapshot("NaN"), now, offset).status, "missing");
assert.equal(api.parseSnapshot(snapshot("—"), now, offset).status, "missing");
assert.equal(api.parseSnapshot(snapshot(90).replace("Readiness", "Sleep"), now, offset).status, "missing");
assert.equal(api.parseSnapshot("", now, offset).status, "missing");
assert.equal(api.parseSnapshot(snapshot(90, "14 Jan 9:45"), now, offset).status, "stale");
assert.equal(api.parseSnapshot(snapshot(90, "15 Jan 3:30"), now, offset).status, "stale");
assert.equal(api.parseSnapshot(snapshot(90, "15 Jan 10:10"), now, offset).status, "stale");
assert.equal(api.parseSnapshot(snapshot(90, "15 Jan 9:45 AM"), now, offset).status, "fresh");
assert.equal(api.parseSnapshot(snapshot(90, "15 Jan 29:45"), now, offset).status, "undated");
assert.equal(api.parseSnapshot(snapshot(90, "not a date"), now, offset).status, "undated");
assert.equal(api.buildState(snapshot(90), "", now, offset).balance, null);
assert.equal(api.buildState(snapshot(0), snapshot(0), now, offset).balance, null);
assert.equal(api.buildState(snapshot(90), snapshot(80, "14 Jan 9:45"), now, offset).balance, null);
assert.equal(api.parseSnapshot(snapshot(90, "15 Jan 9:45"), NaN, offset).status, "undated");
const summerNow = Date.parse("2026-07-15T14:00:00Z") / 1000;
assert.equal(api.parseSnapshot(snapshot(90, "15 Jul 9:45"), summerNow, -14400).status, "fresh");
console.log("Passed: production readiness parsing, rounded shares, zero/missing/invalid data, same-day freshness, clock skew, and summer offset.");
