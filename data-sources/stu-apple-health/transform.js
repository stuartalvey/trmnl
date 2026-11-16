// Protect direct Companion webhook step readings against empty/partial replacement payloads.
// Only compact metadata is retained in TRMNL Saved State (no raw Health export).
const TZ="America/Indiana/Indianapolis";
const DAY_FMT=new Intl.DateTimeFormat("en-CA",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit"});
function dayOf(value){const ms=typeof value==="number"?value:Date.parse(value);if(!Number.isFinite(ms))return null;const parts=DAY_FMT.formatToParts(new Date(ms));const get=k=>parts.find(x=>x.type===k)?.value;return get("year")+"-"+get("month")+"-"+get("day");}
function validStep(s){return s&&/^\d{4}-\d\d-\d\d$/.test(s.date||"")&&Number.isFinite(s.count)&&s.count>=0&&s.count<200000?{date:s.date,count:Math.round(s.count),observed_at:typeof s.observed_at==="string"&&Number.isFinite(Date.parse(s.observed_at))?s.observed_at:null}:null;}
function bestStep(a,b){if(!a)return b;if(!b)return a;if(b.date!==a.date)return b.date>a.date?b:a;const at=a.observed_at?Date.parse(a.observed_at):0,bt=b.observed_at?Date.parse(b.observed_at):0;if(bt!==at)return bt>at?b:a;return b.count>=a.count?b:a;}
function run(input){
  const global=input?.trmnl||{},previousState=global.state&&typeof global.state==="object"?global.state:{};
  const now=Number(global.system?.timestamp_utc)>0?Number(global.system.timestamp_utc)*1000:Date.now();
  const timestamp=typeof input.updated_at==="string"&&Number.isFinite(Date.parse(input.updated_at))&&Date.parse(input.updated_at)<=now+300000?input.updated_at:null;
  const today=dayOf(now);
  let last=validStep(previousState.last_valid_steps)||validStep(global.previous_merge_variables?.last_valid_steps);
  const rows=[...(Array.isArray(previousState.daily_history)?previousState.daily_history:[]),...(Array.isArray(input.daily_history)?input.daily_history:[])];
  for(const row of rows){
    if(!row||typeof row.date!=="string"||!Number.isFinite(row.m?.step_count))continue;
    const candidate=validStep({date:row.date,count:row.m.step_count,observed_at:timestamp&&dayOf(timestamp)===row.date?timestamp:null});
    last=bestStep(last,candidate);
  }
  const newMetric=Array.isArray(input.metrics)?input.metrics.find(m=>m&&String(m.type||"").toLowerCase()==="step_count"&&Number.isFinite(m.value)):null;
  if(newMetric&&timestamp){const candidate=validStep({date:dayOf(timestamp),count:newMetric.value,observed_at:timestamp});last=bestStep(last,candidate);}
  // Keep the existing feed contract, and retain only a minimal last-valid backup.
  const out={};
  for(const [k,v] of Object.entries(input||{})){if(k!=="trmnl"&&k!=="trmnl_state"&&k!=="last_valid_steps"&&k!=="step_feed_valid"&&v!==undefined)out[k]=v;}
  out.last_valid_steps=last;
  out.step_feed_valid=Boolean(newMetric&&timestamp&&dayOf(timestamp)===today)||Boolean(Array.isArray(input.daily_history)&&input.daily_history.some(x=>x?.date===today&&Number.isFinite(x.m?.step_count)));
  let state={...previousState,last_valid_steps:last};
  if(JSON.stringify(state).length>7600)state={last_valid_steps:last,daily_history:Array.isArray(previousState.daily_history)?previousState.daily_history.slice(-8):[],steps_trend:previousState.steps_trend||null};
  if(JSON.stringify(state).length>7600)state={last_valid_steps:last};
  out.trmnl_state=state;
  return out;
}
