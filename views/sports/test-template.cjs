// Synthetic display data only. Requires LiquidJS 10 (see docs/DEPLOYMENT.md).
const fs=require("node:fs"),path=require("node:path"),os=require("node:os"),assert=require("node:assert/strict");
const {Liquid}=require("liquidjs");
const source=fs.readFileSync(path.join(__dirname,"full.liquid"),"utf8"),shared=fs.readFileSync(path.join(__dirname,"shared.liquid"),"utf8");
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"trmnl-sports-display-"));
for(const m of shared.matchAll(/{% template (\w+) %}([\s\S]*?){% endtemplate %}/g))fs.writeFileSync(path.join(tmp,m[1]+".liquid"),m[2]);
const liquid=new Liquid({root:tmp,extname:".liquid",preserveTimezones:true});
const base={trmnl:{system:{timestamp_utc:1794236400},user:{utc_offset:-18000}},updated_at:new Date(1794236400000).toISOString(),status:"partial",season:2026,teams:[],pga:{status:"unavailable"},fantasy:[]};
const league=()=>({name:"Sample league",week:3,status:"ok",team:'Sample <script>alert(1)</script>',record:"1-1",rank:2,matchup:{opponent:"Sample opponent",state:"In progress",my_score:0,opponent_score:12.34,my_win_pct:0,opponent_win_pct:100,my_projected:null,opponent_projected:null},previous:{result:"W",my_score:80,opponent_score:70}});
(async()=>{try{
 let html=await liquid.parseAndRender(source,{...base,fantasy:[league(),{...league(),name:"Second sample league"}]});
 assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);assert.match(html,/>0<\/span>/);assert.match(html,/12.3/);assert.match(html,/Last: W/);assert.doesNotMatch(html,/Projected/);assert.match(html,/Fantasy Football/);assert.match(html,/Win chance 0%/);
 for(const [status,label] of [["needs_auth","Connect ESPN"],["auth_failed","session expired"],["inactive","Offseason"],["schema_error","Fantasy data unavailable"]]){
  html=await liquid.parseAndRender(source,{...base,fantasy:[{...league(),status}]});assert.match(html,new RegExp(label));assert.doesNotMatch(html,/NaN|undefined|Liquid error/);
 }
 html=await liquid.parseAndRender(source,{...base,updated_at:"2026-01-01T00:00Z"});assert.match(html,/Data needs refresh/);
 const m=league();m.matchup.my_score=null;m.matchup.opponent_score=null;
 html=await liquid.parseAndRender(source,{...base,fantasy:[m]});assert.match(html,/>—<\/span>/);
 console.log("Passed: synthetic fantasy connected/unavailable/auth/inactive display, zero/missing scores, projections, stale timestamps, and HTML escaping.");
}finally{fs.rmSync(tmp,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
