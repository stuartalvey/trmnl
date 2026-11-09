// Synthetic weather only. Requires LiquidJS 10; see docs/DEPLOYMENT.md.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { Liquid } = require('liquidjs');
const dir = process.env.WEATHER_TEMPLATE_DIR || path.join(__dirname, '../views/weather');
const full = fs.readFileSync(path.join(dir, 'full.liquid'), 'utf8');
const shared = fs.readFileSync(path.join(dir, 'shared.liquid'), 'utf8');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'trmnl-weather-test-'));
for (const m of shared.matchAll(/{% template (\w+) %}([\s\S]*?){% endtemplate %}/g)) fs.writeFileSync(path.join(tmp, m[1]+'.liquid'), m[2]);
const engine = new Liquid({root:tmp, extname:'.liquid', preserveTimezones:true});
function data() {
  const time = Array.from({length:48}, (_,i)=> '2026-01-'+(15+Math.floor(i/24))+'T'+String(i%24).padStart(2,'0')+':00');
  return {
    trmnl:{system:{timestamp_utc:Date.parse('2026-01-15T15:30:00Z')/1000},user:{utc_offset:-18000}},
    current:{time:'2026-01-15T10:15',temperature_2m:0,apparent_temperature:0,weather_code:0,is_day:1,wind_speed_10m:0,wind_gusts_10m:0,relative_humidity_2m:0},
    hourly:{time,temperature_2m:time.map(()=>0),precipitation_probability:time.map(()=>0),weather_code:time.map(()=>0),is_day:time.map((_,i)=>i%24>=7&&i%24<18?1:0)},
    daily:{time:Array.from({length:7},(_,i)=>'2026-01-'+(15+i)),temperature_2m_max:Array(7).fill(0),temperature_2m_min:Array(7).fill(-5),weather_code:Array(7).fill(0),precipitation_probability_max:Array(7).fill(0),sunrise:Array(7).fill('2026-01-15T07:00'),sunset:Array(7).fill('2026-01-15T17:30'),uv_index_max:Array(7).fill(0)}
  };
}
(async()=>{
  try {
    let d=data(), html=await engine.parseAndRender(full,d);
    assert.match(html,/Low chance ahead/);
    assert.match(html,/0 mph/);
    assert.match(html,/0% precip/);
    assert.match(html,/0°F/);
    assert.equal((html.match(/Hourly forecast<\/title>/g)||[]).length,8);
    assert.equal((html.match(/Daily forecast<\/title>/g)||[]).length,7);
    assert.match(html,/M35 34A17/, 'night moon path');
    d=data();d.hourly.precipitation_probability[12]=40;
    html=await engine.parseAndRender(full,d);assert.match(html,/40% chance/);assert.match(html,/12 PM/);
    d=data();d.hourly.precipitation_probability[25]=70;
    html=await engine.parseAndRender(full,d);assert.match(html,/Tomorrow 1 AM/);
    d=data();d.hourly.precipitation_probability[35]=90;
    html=await engine.parseAndRender(full,d);assert.match(html,/Low chance ahead/, 'beyond next 24 hourly samples excluded');
    d=data();d.hourly.precipitation_probability[12]=null;
    html=await engine.parseAndRender(full,d);assert.match(html,/Forecast incomplete/);
    d=data();d.current.time='2026-01-15T06:00';
    html=await engine.parseAndRender(full,d);assert.match(html,/Forecast needs refresh/);
    d=data();d.hourly={};d.daily={};d.current={};
    html=await engine.parseAndRender(full,d);assert.match(html,/Weather unavailable/);assert.match(html,/Hourly forecast unavailable/);assert.match(html,/Daily forecast unavailable/);assert.doesNotMatch(html,/NaN|undefined|Liquid error/);
    console.log('Passed: actual weather Liquid, eight hourly slots, seven days, wet threshold/window, night icons, zero values, stale and missing data.');
  } finally { fs.rmSync(tmp,{recursive:true,force:true}); }
})().catch(err=>{console.error(err);process.exitCode=1;});
