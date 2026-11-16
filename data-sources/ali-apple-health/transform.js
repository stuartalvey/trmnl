// Companion -> compact render data. No personal values are stored in source.
const TZ="America/Indiana/Indianapolis";
const VERSION="ali-health-v1";
const DAY_FORMAT=new Intl.DateTimeFormat("en-US",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit"});
const HOUR_FORMAT=new Intl.DateTimeFormat("en-US",{timeZone:TZ,hour:"2-digit",hourCycle:"h23"});
function localDay(ms){const p=DAY_FORMAT.formatToParts(new Date(ms));const g=k=>p.find(x=>x.type===k).value;return g("year")+"-"+g("month")+"-"+g("day");}
function shift(date,n){const [y,m,d]=date.split("-").map(Number);return new Date(Date.UTC(y,m-1,d+n)).toISOString().slice(0,10);}
function compact(input,now){
 if(input?.normalization_version===VERSION&&Array.isArray(input?.health?.metrics)&&input.health.metrics.every(m=>m.aggregation==="daily"))return {normalization_version:VERSION,updated_at:input.updated_at,health:input.health};
 const today=localDay(now),first=shift(today,-6),groups=new Map(),hours=new Map(),seen=new Set();
 const samples=Array.isArray(input?.health?.metrics)?input.health.metrics:[];
 for(const s of samples){
  if(!s||typeof s.value!=="number"||!Number.isFinite(s.value)||s.value<0)continue;
  const start=Date.parse(s.start_date),end=Date.parse(s.end_date);
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<start||end>now+300000)continue;
  const day=localDay(start);if(day<first||day>today)continue;
  const type=String(s.metric_type||"").toLowerCase().replace(/[^a-z]/g,""),unit=String(s.unit||"").toLowerCase();
  let metric,value=s.value;
  if(/(?:stepcount|steps)$/.test(type))metric="steps";
  else if(/activeenergy(?:burned)?$/.test(type)){metric="active_energy";if(unit==="kj")value/=4.184;else if(!["kcal","cal","kilocalories"].includes(unit))continue;}
  else if(/restingheartrate$/.test(type))metric="resting_heart_rate";
  else continue;
  const fingerprint=[metric,unit,start,end,s.value].join("|");if(seen.has(fingerprint))continue;seen.add(fingerprint);
  const key=day+"|"+metric,old=groups.get(key);
  if(!old)groups.set(key,{aggregation:"daily",metric_type:metric,unit:metric==="steps"?"count":metric==="active_energy"?"kcal":"bpm",value,start_date:new Date(start).toISOString(),end_date:new Date(end).toISOString()});
  else{
   if(metric==="resting_heart_rate"){if(end>Date.parse(old.end_date)){old.value=value;old.start_date=new Date(start).toISOString();old.end_date=new Date(end).toISOString();}}
   else{old.value+=value;if(start<Date.parse(old.start_date))old.start_date=new Date(start).toISOString();if(end>Date.parse(old.end_date))old.end_date=new Date(end).toISOString();}
  }
  if(metric==="steps"){
   const parts=HOUR_FORMAT.formatToParts(new Date(start));
   const hour=Number(parts.find(x=>x.type==="hour").value),hk=day+"|"+hour;
   const row=hours.get(hk)||{date:day,hour,steps:0};row.steps+=value;hours.set(hk,row);
  }
 }
 return{normalization_version:VERSION,updated_at:new Date(now).toISOString(),health:{metrics:[...groups.values()].sort((a,b)=>a.start_date.localeCompare(b.start_date)),step_hours:[...hours.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.hour-b.hour)}};
}

// Persist the latest *valid* step total across reminders-only and empty webhook uploads.
function validSavedSteps(s){return s&&/^\d{4}-\d\d-\d\d$/.test(s.date||"")&&Number.isFinite(s.count)&&s.count>=0&&s.count<200000?{date:s.date,count:Math.round(s.count),observed_at:typeof s.observed_at==="string"&&Number.isFinite(Date.parse(s.observed_at))?s.observed_at:null}:null;}
function freshest(a,b){if(!a)return b;if(!b)return a;if(b.date!==a.date)return b.date>a.date?b:a;const x=a.observed_at?Date.parse(a.observed_at):0,y=b.observed_at?Date.parse(b.observed_at):0;return y>=x?b:a;}
function run(input){
 const ts=Number(input?.trmnl?.system?.timestamp_utc);
 const now=Number.isFinite(ts)&&ts>0?ts*1000:Date.now();
 const out=compact(input,now);
 const past=input?.trmnl?.state&&typeof input.trmnl.state==="object"?input.trmnl.state:{};
 let last=validSavedSteps(past.last_valid_steps)||validSavedSteps(input?.trmnl?.previous_merge_variables?.health?.last_valid_steps);
 let hasSteps=false;
 for(const row of out.health.metrics){
   if(row?.metric_type!=="steps"||!Number.isFinite(row.value))continue;
   const date=localDay(Date.parse(row.start_date)),candidate=validSavedSteps({date,count:row.value,observed_at:row.end_date});
   if(!candidate)continue;
   last=freshest(last,candidate);hasSteps=true;
 }
 out.health.last_valid_steps=last;
 out.health_feed_valid=hasSteps;
 out.trmnl_state={last_valid_steps:last};
 return out;
}
