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
    current:{time:'2026-01-15T10:15',temperature_2m:0,apparent_temperature:0,weather_code:0,is_day:1,wind_direction_10m:270,wind_speed_10m:0,wind_gusts_10m:0,relative_humidity_2m:0},
    hourly:{time,uv_index:time.map(()=>1.2),temperature_2m:time.map(()=>0),precipitation_probability:time.map(()=>0),weather_code:time.map(()=>0),is_day:time.map((_,i)=>i%24>=7&&i%24<18?1:0)},
    daily:{time:Array.from({length:7},(_,i)=>'2026-01-'+(15+i)),temperature_2m_max:Array(7).fill(0),temperature_2m_min:Array(7).fill(-5),weather_code:Array(7).fill(0),precipitation_probability_max:Array(7).fill(0),sunrise:Array(7).fill('2026-01-15T07:00'),sunset:Array(7).fill('2026-01-15T17:30'),uv_index_max:Array(7).fill(0)}
  };
}
(async()=>{
  try {
    let d=data(), html=await engine.parseAndRender(full,d);
    assert.match(html,/Precipitation below 40%/);
    assert.match(html,/Gusts 0 mph/);
    assert.match(html,/>0%<\/text>/);
    assert.match(html,/0°F/);
    assert.equal((html.match(/Daily forecast<\/title>/g)||[]).length,7);
    assert.equal((html.match(/data-temperature-series=/g)||[]).length,2);
    assert.equal((html.match(/data-temperature-point=/g)||[]).length,14);
    assert.equal((html.match(/data-precipitation-day=/g)||[]).length,7);
    assert.match(html,/From W/);
    assert.match(html,/1.2/);
    d=data();d.hourly.uv_index.fill(0);d.daily.uv_index_max.fill(12);
    html=await engine.parseAndRender(full,d);assert.match(html,/UV INDEX · NOW/);assert.match(html,/>Low</);
    d=data();d.hourly.uv_index.fill(null);
    html=await engine.parseAndRender(full,d);assert.match(html,/Unavailable/);
    d=data();d.hourly.uv_index[10]=2.4;d.hourly.uv_index[11]=9.9;
    html=await engine.parseAndRender(full,d);assert.match(html,/UV INDEX · NOW<\/span>\s*<span[^>]*>2.4<\/span>/);
    d=data();d.daily.temperature_2m_max.fill(-10);d.daily.temperature_2m_min.fill(-10);
    html=await engine.parseAndRender(full,d);assert.doesNotMatch(html,/NaN|Infinity/);
    d=data();d.daily.temperature_2m_max[3]=null;
    html=await engine.parseAndRender(full,d);assert.equal((html.match(/data-temperature-point=/g)||[]).length,13);
    const highPath=html.match(/data-temperature-series="0" d="([^"]*)"/)[1];
    assert.equal((highPath.match(/M /g)||[]).length,2,'missing temperature breaks the curve');
    d=data();d.daily.precipitation_probability_max[3]=null;
    html=await engine.parseAndRender(full,d);
    const area=html.match(/data-precipitation-area d="([^"]*)"/)[1];
    assert.equal((area.match(/M /g)||[]).length,2,'missing precipitation breaks the area');
    d=data();d.hourly.precipitation_probability[12]=40;
    html=await engine.parseAndRender(full,d);assert.match(html,/Next ≥40% precipitation chance:/);assert.match(html,/12 PM/);
    d=data();d.hourly.precipitation_probability[25]=70;
    html=await engine.parseAndRender(full,d);assert.match(html,/tomorrow 1 AM/);
    d=data();d.hourly.precipitation_probability[35]=90;
    html=await engine.parseAndRender(full,d);assert.match(html,/Precipitation below 40%/, 'beyond next 24 hourly samples excluded');
    d=data();d.hourly.precipitation_probability[12]=null;
    html=await engine.parseAndRender(full,d);assert.match(html,/Precipitation timing unavailable/);
    d=data();d.current.time='2026-01-15T06:00';
    html=await engine.parseAndRender(full,d);assert.match(html,/Forecast needs refresh/);
    d=data();d.hourly={};d.daily={};d.current={};
    html=await engine.parseAndRender(full,d);assert.match(html,/Weather unavailable/);assert.match(html,/Temperature curve unavailable/);assert.doesNotMatch(html,/NaN|undefined|Liquid error/);
    console.log('Passed: actual weather Liquid, seven-day curves, missing/flat temperatures, current-hour UV, wet threshold/window, zero/stale/missing data.');
  } finally { fs.rmSync(tmp,{recursive:true,force:true}); }
})().catch(err=>{console.error(err);process.exitCode=1;});
