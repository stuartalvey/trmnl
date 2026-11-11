// Synthetic-only tests. Run: node views/news-markets/test-transform.cjs
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const code=fs.readFileSync(__dirname+"/transform.js","utf8");
const now=Date.UTC(2026,10,10,21,15,0);
const calls=[];
const titles={
 world:"Global security development changes international outlook",
 us:"US economic policy updates draw attention",
 lilly:"Eli Lilly advances important clinical trial",
 localBad:"Hamilton County sheriff race results released",
 localGood:"Hamilton County Indiana home listings rise",
 national:"US mortgage rates shape housing market"
};
function feed(title){
 return "<rss><channel><item><title>"+title+" - Example News</title><source>Example News</source><pubDate>Tue, 10 Nov 2026 18:00:00 GMT</pubDate></item></channel></rss>";
}
const response=async function(url){
 const u=String(url);calls.push(u);let val;
 if(u.includes("/chart/%5EGSPC")) val={chart:{result:[{meta:{regularMarketPrice:7520,previousClose:7550,chartPreviousClose:8000},indicators:{quote:[{close:u.includes("range=1y")?Array.from({length:53},(_,i)=>6000+i*25):[8000,7550,7520]}]}}]}};
 else if(u.includes("/chart/LLY")) val={chart:{result:[{meta:{regularMarketPrice:1450,previousClose:1400,chartPreviousClose:800},indicators:{quote:[{close:u.includes("range=1y")?Array.from({length:53},(_,i)=>1100+i*7):[1300,1400,1450]}]}}]}};
 else if(u.includes("/chart/BTC-USD")) val={chart:{result:[{meta:{regularMarketPrice:75000,previousClose:74000},indicators:{quote:[{close:Array.from({length:53},(_,i)=>40000+i*500)}]}}]}};
 else if(u.includes("coingecko")) val=[{id:"bitcoin",current_price:75000,price_change_percentage_24h:-2,sign:"test",sparkline_in_7d:{price:[74000,75500,75000]}}];
 else if(u.includes("fredgraph.csv")){
   const id=(u.match(/id=([A-Z0-9]+)/)||[])[1];
   const rows=id==="MORTGAGE30US"?
     Array.from({length:100},(_,i)=>new Date(Date.UTC(2025,0,2+i*7)).toISOString().slice(0,10)+","+(6.3+i*0.005).toFixed(3)):
     ["2025-10-01,100","2026-09-01,110","2026-10-01,120"];
   val="observation_date,"+id+"\n"+rows.join("\n")+"\n";
 }
 else if(u.includes("viewreport")){
   const match=u.match(/\/(\d{4})\/(\d{2})\/07\/$/);
   const pub=new Date(Date.UTC(Number(match[1]),Number(match[2])-1,7));
   const periodDate=new Date(Date.UTC(pub.getUTCFullYear(),pub.getUTCMonth()-1,1));
   const period=periodDate.toLocaleString("en-US",{month:"long",year:"numeric",timeZone:"UTC"});
   const position=(pub.getUTCFullYear()-2026)*12+pub.getUTCMonth()-10;
   val="<h1>Monthly Market Report</h1>"+[
     ["Inventory",String(1283+position*17),"+14%"],["Closed Sales",String(484+position*7),"-20%"],
     ["Median Days on Market",String(23+position),"+0%"],["Months of Inventory","2.3","+11%"],
     ["Median Sale Price","$"+String(455000+position*1000),"+2%"]
   ].map(a=>"<h3>"+a[0]+"</h3><p>"+period+"</p><b>"+a[1]+"</b><p>Expected range of 100–200</p><p>Month-over-month</p><b>+4%</b><p>Typical change is about +3%</p><p>Year-over-year</p><b>"+a[2]+"</b>").join("");
 }
 else if(u.includes("/news/world/us_and_canada"))val=feed(titles.us);
 else if(u.includes("/news/world/"))val=feed(titles.world);
 else if(u.includes("q=")&&u.includes("Eli%20Lilly"))val=feed(titles.lilly);
 else if(u.includes("q=")&&u.includes("Hamilton%20County"))val="<rss><item><title>"+titles.localBad+"</title><pubDate>Tue, 10 Nov 2026 18:00:00 GMT</pubDate></item><item><title>"+titles.localGood+"</title><pubDate>Tue, 10 Nov 2026 17:00:00 GMT</pubDate></item></rss>";
 else val=feed(titles.national);
 return {ok:true,json:async()=>val,text:async()=>val};
};
const ctx=vm.createContext({fetch:response,AbortSignal,URL,Intl,Date,console});
vm.runInContext(code+"\nthis.lib={run,quote,periodUrl,observations,parseIar,rss};",ctx);
const lib=ctx.lib;
assert.match(lib.periodUrl(now),/2026\/11\/07\/$/);
assert.match(lib.periodUrl(Date.UTC(2026,10,3)),/2026\/10\/07\/$/);
assert.equal(lib.observations("observation_date,X\n2026-10-01,5\n2026-11-01,.\n","X").length,1);
assert.equal(lib.quote({},"LLY").status,"unavailable");
assert.equal(lib.quote({chart:{result:[{meta:{regularMarketPrice:100,previousClose:80,chartPreviousClose:50},indicators:{quote:[{close:[50,80,100]}]}}]}},"LLY").change,25);
(async()=>{
 const data=await lib.run({trmnl:{system:{timestamp_utc:now/1000}}});
 assert.equal(data.markets.length,3);
 assert.equal(data.markets[0].change_str,"-0.40%");
 assert.equal(data.markets[0].price_str,"7,520.00");
 assert.equal(data.markets[1].change_str,"+3.57%");
 assert.equal(data.markets[2].change_str,"-2.00%");
 assert.equal(data.housing.report.sold.value,455000);
 assert.equal(data.housing.report.sold.yoy,2);
 assert.equal(data.housing.report.inventory.yoy,14);
 assert(data.housing.mortgage.value > 6);
 assert.equal(data.housing.cards.length,4);
 assert.equal(data.housing.county_history_count,12);
 assert.deepEqual(Array.from(data.housing.cards.map(c=>c.key)),["sold","days","inventory","mortgage"]);
 assert(data.markets.every(c=>c.trend_label==="12M trend"));
 assert(data.housing.cards.every(c=>c.spark.length>0));
 assert(data.housing.cards[0].change_short.startsWith("MoM"));
 assert(data.housing.cards[3].change_short.startsWith("4W"));
 assert.equal(calls.filter(x=>x.includes("viewreport")).length,12);
 assert.equal(data.news[0].items.length,2);
 assert(!data.news[2].items.some(x=>x.title.includes("sheriff")));
 assert(data.news[2].items.some(x=>x.title.includes("home listings")));
 assert.equal(data.source_status.fred,4);
 assert(calls.some(x=>x.includes("/2026/11/07/")));
 console.log("News & Markets synthetic collector tests passed");
})().catch(err=>{console.error(err);process.exitCode=1;});
