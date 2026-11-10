// Protein Social completed and partial workout-day summaries. No personal payloads in source.
const ZONE="America/Indiana/Indianapolis";
function localDay(value){const p=new Intl.DateTimeFormat("en-US",{timeZone:ZONE,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date(value));const g=k=>p.find(x=>x.type===k).value;return g("year")+"-"+g("month")+"-"+g("day");}
function addDay(day,n){const [y,m,d]=day.split("-").map(Number);return new Date(Date.UTC(y,m-1,d+n)).toISOString().slice(0,10);}
function summarize(records,now,complete=true){
 const today=localDay(now),weekday=(new Date(today+"T12:00Z").getUTCDay()+6)%7,monday=addDay(today,-weekday),start=addDay(monday,-49);
 const seen=new Set(),byDay=new Map();let duration=0,knownDuration=0;
 for(const r of records){
  if(!r||!r.id||seen.has(String(r.id))||!["completed","partial"].includes(r.status)||!Number.isFinite(Date.parse(r.started_at)))continue;
  const day=localDay(r.started_at);if(day<start||day>today)continue;seen.add(String(r.id));
  const current=byDay.get(day)||{count:0,full:0,partial:0};current.count++;current[r.status==="completed"?"full":"partial"]++;byDay.set(day,current);
  const minutes=r.duration_minutes;if(typeof minutes==="number"&&Number.isFinite(minutes)&&minutes>=0){duration+=minutes;knownDuration++;}
 }
 const weeks=Array.from({length:8},(_,w)=>{const cells=Array.from({length:7},(_,d)=>{const date=addDay(start,w*7+d);const sessions=byDay.get(date)||{count:0,full:0,partial:0};return {date,count:sessions.count,full:sessions.full,partial:sessions.partial,future:date>today,known:complete||byDay.has(date)};});return{start:addDay(start,w*7),cells,count:cells.reduce((n,c)=>n+(c.count>0?1:0),0),partial_days:cells.filter(c=>c.partial>0&&!c.full).length};});
 return{status:complete?"ok":"partial",start,end:today,weeks,session_count:seen.size,active_days:byDay.size,this_week:weeks[7].count,last_week:weeks[6].count,minutes:Math.round(duration),duration_records:knownDuration,updated_at:new Date(now).toISOString()};
}
async function run(input){
 const ts=Number(input?.trmnl?.system?.timestamp_utc),now=Number.isFinite(ts)&&ts>0?ts*1000:Date.now(),today=localDay(now);
 const offset=(new Date(today+"T12:00Z").getUTCDay()+6)%7,start=addDay(addDay(today,-offset),-49);
 const base="https://proteinsocial.com/api/v1/public/workouts/stu";
 let cursor=null,records=[],complete=false;
 try{
  for(let page=0;page<5;page++){
   const url=base+"?start="+start+"&end="+today+"&limit=50"+(cursor?"&cursor="+encodeURIComponent(cursor):"");
   const response=await fetch(url,{method:"GET",headers:{Accept:"application/json","User-Agent":"Mozilla/5.0"},redirect:"error",signal:AbortSignal.timeout(7000)});
   if(!response.ok)throw Error("Feed unavailable");
   const data=await response.json();if(data.schema_version!=="1.0"||!Array.isArray(data.data))throw Error("Invalid schema");
   records.push(...data.data);cursor=data.pagination?.next_cursor||null;
   if(!cursor){complete=true;break;}
  }
  return summarize(records,now,complete);
 }catch{return{...summarize(records,now,false),status:records.length?"partial":"unavailable"};}
}
