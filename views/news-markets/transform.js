// Alvey Market Intelligence: public, GET-only market/news collector.
// Independent failures remain unavailable; never synthesize prices or headlines.
const TZ="America/Indiana/Indianapolis";
const MONTHS="January February March April May June July August September October November December".split(" ");
const NUM=x=>x===null||x===undefined||x===""||typeof x==="boolean"?null:(Number.isFinite(Number(x))?Number(x):null);
const safe=s=>String(s??"").replace(/<[^>]*>/g,"").replace(/[\u0000-\u001f]/g," ").trim();
async function get(url,as="json"){
  try{
    const res=await fetch(url,{headers:{"Accept":as==="json"?"application/json":"text/html, text/plain, application/rss+xml, */*","User-Agent":"Alvey-TRMNL/1.0"},signal:AbortSignal.timeout(6500),redirect:"error"});
    if(!res.ok)return null;
    return as==="json"?await res.json():await res.text();
  }catch{return null;}
}
function observations(csv,key){
  if(typeof csv!=="string"||csv.length>1000000)return [];
  const lines=csv.replace(/^\uFEFF/,"").trim().split(/\r?\n/);
  if(!lines[0]||!lines[0].includes(key))return [];
  return lines.slice(1).map(line=>{
    const m=line.match(/^(\d{4}-\d{2}-\d{2}),(-?(?:\d+\.?\d*|\.\d+))$/);
    return m?{date:m[1],value:Number(m[2])}:null;
  }).filter(x=>x&&Number.isFinite(x.value));
}
function historical(rows){
  const latest=rows.at(-1)||null,prev=rows.at(-2)||null;
  const prior=latest?rows.find(x=>x.date===String(Number(latest.date.slice(0,4))-1)+latest.date.slice(4)):null;
  const yoy=latest&&prior&&prior.value!==0?100*(latest.value/prior.value-1):null;
  return {value:latest?.value??null,date:latest?.date??null,previous:prev?.value??null,yoy,trend:rows.slice(-12).map(x=>x.value)};
}
function quote(data,label){
  const row=data?.chart?.result?.[0],m=row?.meta;
  const price=NUM(m?.regularMarketPrice),prev=NUM(m?.chartPreviousClose??m?.previousClose);
  if(!row||price===null||prev===null||prev<=0)return {label,status:"unavailable",price:null,change:null,trend:[]};
  const v=row?.indicators?.quote?.[0]?.close||[];
  return {label,status:"ok",price,change:100*(price/prev-1),trend:v.map(NUM).filter(x=>x!==null).slice(-7),date:m?.regularMarketTime?new Date(m.regularMarketTime*1000).toISOString():null,source:"Yahoo Finance (delayed)"};
}
function bitcoin(data){
  const row=Array.isArray(data)?data.find(x=>x?.id==="bitcoin"):null;
  const price=NUM(row?.current_price),change=NUM(row?.price_change_percentage_24h);
  return {label:"Bitcoin",status:price===null?"unavailable":"ok",price,change,trend:[],date:row?.last_updated??null,source:"CoinGecko",change_label:"24h"};
}
function dec(s){return String(s||"").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/&(?:amp|quot|apos|lt|gt|nbsp);|&#(?:x[0-9a-f]+|\d+);/gi,ent=>{
  const map={"&amp;":"&","&quot;":'"',"&apos;":"'","&lt;":"<","&gt;":">","&nbsp;":" "};
  if(map[ent.toLowerCase()])return map[ent.toLowerCase()];
  const hex=/^&#x/i.test(ent),n=parseInt(ent.slice(hex?3:2,-1),hex?16:10);
  return n>0&&n<0x110000?String.fromCodePoint(n):" ";
}).replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim();}
function rss(raw,now){
  if(typeof raw!=="string")return [];
  const items=[...raw.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].slice(0,16);
  return items.map(match=>{
    const item=match[1];
    const field=k=>dec(item.match(new RegExp("<"+k+"(?:\\s[^>]*)?>([\\s\\S]*?)<\\/"+k+">","i"))?.[1]);
    const date=Date.parse(field("pubDate")||field("dc:date"));
    let title=field("title"),source=field("source");
    if(!source&&title.includes(" - ")){const at=title.lastIndexOf(" - ");source=title.slice(at+3);title=title.slice(0,at);}
    if(!title||title.length<12||!Number.isFinite(date)||date>now+3600000||date<now-5*86400000)return null;
    return {title:safe(title).slice(0,145),source:safe(source||"News").slice(0,40),date:new Date(date).toISOString()};
  }).filter(Boolean);
}
function shortlist(lists,max=2){
  const used=new Set(),all=lists.flat(),out=[];
  for(const item of all){
    const key=item.title.toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
    if(used.has(key))continue;used.add(key);out.push(item);
    if(out.length>=max)break;
  }
  return out;
}
function stripHtml(html){
  return dec(String(html||"").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ").replace(/<\/(?:div|section|p|h\d|li)>/gi," \n").replace(/<[^>]+>/g," ")).replace(/\s+/g," ");
}
function iarValue(plain,label){
  const at=plain.indexOf(label);if(at<0)return null;
  const snippet=plain.slice(at+label.length,at+650);
  const pattern=/\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+20\d{2})\s+(\$?[\d,]+(?:\.\d+)?%?)\s+Expected range[\s\S]{0,150}?Month-over-month\s+([+\-]?\d+%)\s+Typical change[\s\S]{0,100}?Year-over-year\s+([+\-]?\d+%)/i;
  const m=snippet.match(pattern);
  return m?{period:m[1],value:NUM(m[2].replace(/[$,%]/g,"")),mom:NUM(m[3].replace("%","")),yoy:NUM(m[4].replace("%",""))}:null;
}
function parseIar(html){
  if(!html||!String(html).includes("Monthly Market Report"))return null;
  const s=stripHtml(html);
  const labels={sold:"Median Sale Price",inventory:"Inventory",sales:"Closed Sales",days:"Median Days on Market",supply:"Months of Inventory"};
  const data={};for(const [k,v] of Object.entries(labels))data[k]=iarValue(s,v);
  const ok=["sold","inventory","sales","days","supply"].filter(k=>data[k]).length;
  return ok>=3?{...data,source:"Indiana REALTORS",status:"ok"}:null;
}
function periodUrl(now){
  const p=new Intl.DateTimeFormat("en-US",{timeZone:TZ,year:"numeric",month:"numeric",day:"numeric"}).formatToParts(new Date(now));
  const val=k=>Number(p.find(x=>x.type===k)?.value),y=val("year"),m=val("month"),d=val("day");
  const stamp=new Date(Date.UTC(y,m-(d<7?2:1),7));
  // Report path uses publication month and day 07 (the report shown is preceding calendar month).
  const publication=new Date(Date.UTC(stamp.getUTCFullYear(),stamp.getUTCMonth()+1,7));
  return "https://data.indianarealtors.com/viewreport/2/all/18057/"+publication.getUTCFullYear()+"/"+String(publication.getUTCMonth()+1).padStart(2,"0")+"/07/";
}
async function run(input){
  const now=NUM(input?.trmnl?.system?.timestamp_utc)!==null?Number(input.trmnl.system.timestamp_utc)*1000:Date.now();
  const fred=["MORTGAGE30US","MEDLISPRI18057","ACTLISCOU18057","MEDDAYONMAR18057"];
  const fredJobs=fred.map(id=>get("https://fred.stlouisfed.org/graph/fredgraph.csv?id="+id+"&cosd=2024-01-01","text"));
  const yurl=s=>"https://query1.finance.yahoo.com/v8/finance/chart/"+encodeURIComponent(s)+"?range=10d&interval=1d";
  const gnews=(q)=>"https://news.google.com/rss/search?q="+encodeURIComponent(q)+"&hl=en-US&gl=US&ceid=US:en";
  const queries=[
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",
    gnews('"Eli Lilly" when:4d'),
    gnews('"Hamilton County" Indiana real estate OR housing when:7d'),
    gnews('US mortgage housing market when:4d')
  ];
  const [spx,lly,btc,iar,...remaining]=await Promise.all([
    get(yurl("^GSPC")),get(yurl("LLY")),
    get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&price_change_percentage=24h"),
    get(periodUrl(now),"text"),...fredJobs,...queries.map(url=>get(url,"text"))
  ]);
  const fredRaw=remaining.slice(0,fred.length),newsRaw=remaining.slice(fred.length);
  const econ={};
  for(let i=0;i<fred.length;i++)econ[fred[i]]=historical(observations(fredRaw[i],fred[i]));
  const housing=parseIar(iar),mortgage=econ.MORTGAGE30US;
  const headlines=newsRaw.map(raw=>rss(raw,now));
  return {
    updated_at:new Date(now).toISOString(),
    markets:[quote(spx,"S&P 500"),quote(lly,"Eli Lilly"),bitcoin(btc)],
    housing:{
      report:housing,listing:econ.MEDLISPRI18057,active:econ.ACTLISCOU18057,
      listing_days:econ.MEDDAYONMAR18057,
      mortgage:{...mortgage,change_points:mortgage.value!==null&&mortgage.previous!==null?mortgage.value-mortgage.previous:null},
      status:housing||econ.MEDLISPRI18057.value!==null?"ok":"unavailable"
    },
    news:[
      {name:"WORLD & U.S.",items:shortlist([headlines[0],headlines[1]])},
      {name:"ELI LILLY",items:shortlist([headlines[2]])},
      {name:"REAL ESTATE",items:shortlist([headlines[3],headlines[4]])}
    ],
    source_status:{stock:!!spx&&!!lly,crypto:!!btc,iar:!!housing,fred:fredRaw.filter(Boolean).length,news:newsRaw.filter(Boolean).length},
    timezone:TZ
  };
}
