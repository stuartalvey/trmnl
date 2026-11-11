// Synthetic health/workout fixtures only; never commit real personal payloads.
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict"),os=require("node:os");
const ctx={Intl,Date,Map,Set,AbortSignal,fetch:async()=>{throw Error("offline")}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,"../../data-sources/workout-consistency/transform.js"),"utf8"),ctx);
const now=Date.parse("2026-01-15T15:00Z"),records=[{id:"one",status:"completed",started_at:"2026-01-13T23:00Z",duration_minutes:30},{id:"one",status:"completed",started_at:"2026-01-13T23:00Z",duration_minutes:30},{id:"two",status:"partial",started_at:"2026-01-14T12:00Z"},{id:"three",status:"completed",started_at:"2026-01-16T12:00Z"},{id:"four",status:"completed",started_at:"2026-01-14T02:00Z",duration_minutes:null}];
let out=ctx.summarize(records,now,true);assert.equal(out.session_count,3);assert.equal(out.active_days,2);assert.equal(out.this_week,2);assert.equal(out.minutes,30);assert.equal(out.weeks.length,8);assert(out.weeks.every(w=>w.cells.length===7));assert.equal(out.weeks[7].cells[1].count,1);assert.equal(out.weeks[7].cells[2].count,1);assert(out.weeks[7].cells[6].future);
const sameDate=[{id:"full",status:"completed",started_at:"2026-01-13T23:00Z"},{id:"partial",status:"partial",started_at:"2026-01-13T23:30Z"}];
out=ctx.summarize(sameDate,now,true);assert.equal(out.session_count,2);assert.equal(out.active_days,1);assert.equal(out.weeks[7].cells[1].count,1);
const fullOnly=ctx.summarize([sameDate[0]],now,true),partialOnly=ctx.summarize([{...sameDate[1],id:"p"}],now,true);
assert.equal(fullOnly.active_days,partialOnly.active_days);assert.equal(fullOnly.this_week,partialOnly.this_week);
out=ctx.summarize([],now,false);assert.equal(out.status,"partial");assert(out.weeks.every(w=>w.cells.every(c=>!c.known)));
assert.equal(ctx.localDay("2026-11-01T05:30:00Z"),"2026-11-01");assert.equal(ctx.localDay("2026-11-01T06:30:00Z"),"2026-11-01");
const shared=fs.readFileSync(path.join(__dirname,"shared.liquid"),"utf8"),script=shared.split("/* HealthDetail:start */")[1].split("/* HealthDetail:end */")[0];vm.runInContext(script,ctx);
const markup=(score,label)=>'<span class="value">'+score+'</span><span class="label">'+label+'</span>';
const snapshot=markup(90,"Readiness")+markup(0,"Sleep")+markup(80,"Activity")+"<span>Last updated: 15 Jan 09:45</span>";
let m=ctx.HealthDetail.oura(snapshot,now/1000,-18000);assert.equal(m.status,"fresh");assert.equal(m.scores.Sleep,0);assert.equal(m.scores.Activity,80);
m=ctx.HealthDetail.oura(snapshot.replace("15 Jan","14 Jan"),now/1000,-18000);assert.equal(m.status,"stale");assert.equal(m.scores.Readiness,90);assert.equal(m.timestamp,"14 Jan 09:45");
m=ctx.HealthDetail.oura(snapshot.replace("09:45","02:00"),now/1000,-18000);assert.equal(m.status,"stale");assert.equal(m.scores.Sleep,0);
assert.equal(ctx.HealthDetail.oura("",now/1000,-18000).scores.Sleep,null);
const sample=(type,value,unit="count",start="2026-01-15T14:00Z",end="2026-01-15T14:10Z")=>({metric_type:type,value,unit,start_date:start,end_date:end});
let a=ctx.HealthDetail.appleSummary([sample("steps",0),sample("active_energy",41.84,"kJ"),sample("resting_heart_rate",50,"bpm")],now);
assert.equal(a.steps,0);assert(Math.abs(a.energy-10)<.00001);assert.equal(a.resting,50);
a=ctx.HealthDetail.appleSummary([sample("steps",100),sample("steps",100),sample("steps",25,"count","2026-01-15T14:10Z","2026-01-15T14:20Z")],now);assert.equal(a.steps,125);
a=ctx.HealthDetail.appleSummary([sample("steps",100,"count","2026-01-14T14:00Z","2026-01-14T14:10Z")],now);assert.equal(a.status,"no_today");assert.equal(a.steps,null);assert.equal(a.recentSteps,100);
a=ctx.HealthDetail.appleSummary([sample("steps",-1),sample("steps",NaN),sample("steps",10,"count","2026-01-15T16:00Z","2026-01-15T16:10Z")],now);assert.equal(a.steps,null);
assert.equal(ctx.HealthDetail.appleSummary(null,now).status,"missing");
(async()=>{
 ctx.fetch=async url=>({ok:true,json:async()=>({schema_version:"1.0",data:records.filter(r=>r.status===(url.includes("status=partial")?"partial":"completed")),pagination:{next_cursor:null}})});
 out=await ctx.run({trmnl:{system:{timestamp_utc:now/1000}}});assert.equal(out.status,"ok");assert.equal(out.session_count,3);
 let calls=0;ctx.fetch=async()=>{calls++;return {ok:true,json:async()=>({schema_version:"1.0",data:[],pagination:{next_cursor:"same-cursor"}})}};
 out=await ctx.run({trmnl:{system:{timestamp_utc:now/1000}}});assert.equal(out.status,"partial");assert.equal(calls,10);
 ctx.fetch=async url=>url.includes("status=partial")?{ok:false}:{ok:true,json:async()=>({schema_version:"1.0",data:records.filter(r=>r.status==="completed"),pagination:{next_cursor:null}})};
 out=await ctx.run({trmnl:{system:{timestamp_utc:now/1000}}});assert.equal(out.status,"partial");assert.equal(out.session_count,2);
 ctx.fetch=async()=>({ok:false});out=await ctx.run({trmnl:{system:{timestamp_utc:now/1000}}});assert.equal(out.status,"unavailable");
 const {Liquid}=require("liquidjs"),tmp=fs.mkdtempSync(path.join(os.tmpdir(),"health-template-"));
 try{
  for(const t of shared.matchAll(/{% template (\w+) %}([\s\S]*?){% endtemplate %}/g))fs.writeFileSync(path.join(tmp,t[1]+".liquid"),t[2]);
  const engine=new Liquid({root:tmp,extname:".liquid",preserveTimezones:true});
  const input={trmnl:{system:{timestamp_utc:now/1000},user:{utc_offset:-18000},plugin_settings:{custom_fields_values:{step_goal:10000}}},private_plugin_536212:{merge_variables:{daily_history:[{date:"2026-01-15",m:{step_count:0,active_energy:0,resting_heart_rate:50}}]}},private_plugin_536353:{merge_variables:ctx.summarize([],now,true)}};
  const html=await engine.parseAndRender(fs.readFileSync(path.join(__dirname,"full.liquid"),"utf8"),input);
  assert.match(html,/>0<\/span>/);assert.match(html,/data-current-step-point/);assert.match(html,/personalized goal pace/);assert.match(html,/data-ali-steps/);assert.doesNotMatch(html,/NaN|Infinity|undefined|Liquid error/);
  console.log("Passed: workout windows/deduplication/completion/missing coverage/DST/pagination/failure, Oura freshness/zero scores, and synthetic movement/missing-day rendering.");
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
