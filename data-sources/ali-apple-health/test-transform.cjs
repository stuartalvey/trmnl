// Synthetic samples only. Never add real Health exports.
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const ctx={Intl,Date,Map,Set};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,"transform.js"),"utf8"),ctx);
const now=Date.parse("2026-11-10T01:00Z"),s=(type,value,unit="count",start="2026-11-09T18:00Z",end="2026-11-09T18:10Z")=>({metric_type:type,value,unit,start_date:start,end_date:end});
let out=ctx.compact({health:{metrics:[s("steps",100),s("steps",100),s("steps",50,"count","2026-11-09T18:10Z","2026-11-09T18:20Z"),s("active_energy",41.84,"kJ"),s("resting_heart_rate",50,"bpm"),s("resting_heart_rate",48,"bpm","2026-11-09T19:00Z","2026-11-09T19:10Z")]},reminders:[{title:"SYNTHETIC PRIVATE NOTE"}]},now);
assert.equal(out.health.metrics.find(m=>m.metric_type==="steps").value,150);assert.equal(out.health.step_hours[0].steps,150);
assert(Math.abs(out.health.metrics.find(m=>m.metric_type==="active_energy").value-10)<.00001);
assert.equal(out.health.metrics.find(m=>m.metric_type==="resting_heart_rate").value,48);
assert(!JSON.stringify(out).includes("SYNTHETIC PRIVATE NOTE"));
assert.equal(JSON.stringify(ctx.compact(out,now)),JSON.stringify(out),"compact payload is idempotent");
out=ctx.compact({health:{metrics:[s("steps",0),s("steps",-1),s("steps",NaN),s("steps",1,"count","2026-10-01T12:00Z","2026-10-01T12:10Z"),s("steps",1,"count","2026-11-11T12:00Z","2026-11-11T12:10Z")]}},now);
assert.equal(out.health.metrics.length,1);assert.equal(out.health.metrics[0].value,0);
assert.equal(ctx.compact({},now).health.metrics.length,0);
assert.equal(ctx.compact({normalization_version:"ali-health-v1",health:{metrics:[s("steps",5),s("steps",5)]}},now).health.metrics[0].value,5,"fresh raw upload must not bypass transform when an old version marker remains");
const many=[];for(let i=0;i<3500;i++){const start=now-(i+1)*60000;many.push(s("steps",1,"count",new Date(start).toISOString(),new Date(start+30000).toISOString()));}
out=ctx.compact({health:{metrics:many}},now);assert.equal(out.health.metrics.reduce((n,x)=>n+x.value,0),3500);assert(Buffer.byteLength(JSON.stringify(out))<30000);
assert.equal(ctx.localDay(Date.parse("2026-11-01T05:30Z")),ctx.localDay(Date.parse("2026-11-01T06:30Z")));
console.log("Passed: aggregation, duplicate filtering, units, latest resting HR, zero/missing/invalid samples, seven-day window, idempotence, privacy, DST, and 3500-sample size reduction.");
