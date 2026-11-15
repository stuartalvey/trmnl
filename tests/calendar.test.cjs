// Synthetic events only. Run with LiquidJS 10 available (see docs/DEPLOYMENT.md).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Liquid } = require('liquidjs');
const file = process.env.CALENDAR_TEMPLATE || path.join(__dirname, '../src/full.liquid');
const source = fs.readFileSync(file, 'utf8');
const section = name => source.split('{% comment %}CalendarMerge:' + name + ':start{% endcomment %}')[1].split('{% comment %}CalendarMerge:' + name + ':end{% endcomment %}')[0];
const template = section('setup') + section('day').replaceAll('{% render "agenda_owner_icon", owner: owner %}', '<svg class="gz-agenda-icon" data-owner-icon="{{ owner }}"></svg>');
const engine = new Liquid({ preserveTimezones: true });
const e = (overrides = {}) => ({summary: 'Sample event', location: 'Office', start_full: '2026-01-15T09:00:00-05:00', end_full: '2026-01-15T10:00:00-05:00', start: '9:00 AM', all_day: false, status: 'confirmed', ...overrides});
async function render(stu, ali, day = '2026-01-15') {
  return engine.parseAndRender(template, {apple_calendar_535612: stu === null ? {} : {events: stu}, apple_calendar_536125: ali === null ? {} : {events: ali}, day});
}
const count = (html, text) => html.split(text).length - 1;
(async () => {
  let html = await render([e()], [e({summary: ' SAMPLE EVENT ', location: ' office '})]);
  assert.equal(count(html, 'data-clamp="1"'), 1);
  assert.match(html, /data-owner="S\+A"/);
  html = await render([e()], [e({start_full: '2026-01-15T14:00:00Z', end_full: '2026-01-15T15:00:00Z'})]);
  assert.equal(count(html, 'data-clamp="1"'), 1, 'same instant with different offsets');
  for (const change of [{start_full:'2026-01-15T11:00:00-05:00'}, {end_full:'2026-01-15T11:00:00-05:00'}, {location:'Elsewhere'}, {all_day:true}, {summary:'Another event'}]) {
    html = await render([e()], [e(change)]);
    assert.equal(count(html, 'data-clamp="1"'), 2, JSON.stringify(change));
    assert.match(html, /data-owner="S"/);
    assert.match(html, /data-owner="A"/);
  }
  html = await render([e(), e()], [e()]);
  assert.equal(count(html, 'data-clamp="1"'), 1, 'duplicates within a feed too');
  html = await render([e({status:'cancelled'})], [e()]);
  assert.equal(count(html, 'data-clamp="1"'), 1);
  assert.match(html, /data-owner="A"/);
  assert.doesNotMatch(html, /data-owner="S\+A"/);
  html = await render([e({calname:'US Holidays'})], []);
  assert.match(html, /data-owner="H"/);
  assert.match(html, /data-owner-icon="H"/);
  html = await render([e({summary:'Holiday planning', calname:'Work'})], []);
  assert.match(html, />S<\/span>/, 'titles do not determine holiday membership');
  // Event title precedes the time, aligned with the Sports agenda format.
  html = await render([e()], []);
  assert.match(html, /class="gz-agenda-title"[^>]*>Sample event<\/span>[\s\S]*?<span class="gz-agenda-when">9:00 AM<\/span>/);
  assert.match(html, /data-owner-icon="S"/);
  const iconSource = fs.readFileSync(path.join(__dirname, '../src/shared.liquid'), 'utf8');
  assert.match(iconSource, /{% template agenda_owner_icon %}/);
  for (const who of ["S", "A", "S+A", "H"]) assert.ok(iconSource.includes("owner == '"+who+"'"), 'missing owner branch '+who);
  const allDay = e({all_day:true, start_full:'2026-01-14T00:00:00-05:00', end_full:'2026-01-16T00:00:00-05:00'});
  html = await render([allDay], [allDay]);
  assert.equal(count(html, 'data-clamp="1"'), 1);
  assert.match(html, /All day/);
  html = await render([allDay], [allDay], '2026-01-16');
  assert.equal(count(html, 'data-clamp="1"'), 0, 'all-day end is exclusive');
  const multi = e({start_full:'2026-01-14T23:00:00-05:00', end_full:'2026-01-16T00:00:00-05:00'});
  assert.match(await render([multi], []), /Continues/);
  assert.equal(count(await render([multi], [], '2026-01-16'), 'data-clamp="1"'), 0);
  assert.match(await render([], []), /No events scheduled/);
  assert.match(await render(null, [e()]), /Stuart calendar unavailable/);
  assert.match(await render([e()], null), /Ali calendar unavailable/);
  assert.match(await render(null, null), /Calendar unavailable/);
  console.log('Passed: actual Liquid merge, deduplication, ownership, cancellation, date spans, and missing sources.');
})().catch(err => {console.error(err); process.exitCode = 1;});
