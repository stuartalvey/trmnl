// Direct, GET-only ESPN collector. Secrets are read from TRMNL password fields,
// never returned, logged, or sent to public sports hosts. No Sites dependency.
const SD_TZ = "America/Indiana/Indianapolis";
const TEAM_SOURCES = [
  { key: "pacers", label: "Pacers", id: "11", league: "nba", sport: "basketball", url: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/11/schedule" },
  { key: "colts", label: "Colts", id: "11", league: "nfl", sport: "football", url: "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/11/schedule" },
  { key: "purdue_football", label: "Purdue FB", id: "2509", league: "college-football", sport: "football", url: "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/2509/schedule" },
  { key: "purdue_basketball", label: "Purdue BB", id: "2509", league: "mens-college-basketball", sport: "basketball", url: "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/2509/schedule" },
  { key: "butler_basketball", label: "Butler", id: "2086", league: "mens-college-basketball", sport: "basketball", url: "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/2086/schedule" }
];
const FANTASY_LEAGUES = [{key:"apex",name:"APEX",id:244513322,team_id:7},{key:"nob",name:"NOB",id:35481112,team_id:3}];
function number(value) {
  if(value===null||value===undefined||value===""||typeof value==="boolean")return null;
  const n=Number(value);return Number.isFinite(n)?n:null;
}
function text(value,fallback="—"){return value===null||value===undefined||value===""?fallback:String(value);}
function day(value){const parts=new Intl.DateTimeFormat("en-US",{timeZone:SD_TZ,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date(value));const get=k=>parts.find(p=>p.type===k).value;return get("year")+"-"+get("month")+"-"+get("day");}
function clock(value){return new Intl.DateTimeFormat("en-US",{timeZone:SD_TZ,hour:"numeric",minute:"2-digit",hour12:true}).format(new Date(value));}
function when(value){return new Intl.DateTimeFormat("en-US",{timeZone:SD_TZ,weekday:"short",month:"short",day:"numeric"}).format(new Date(value));}
function score(c){return number(typeof c?.score==="object"?c.score?.value:c?.score);}
function normalizeTeam(feed,source,now) {
  const base={key:source.key,name:source.label,status:feed?.error||"unavailable",logo:"",record:"—",standing:"",next:null,last:null};
  if(!feed||feed.error||String(feed.team?.id)!==source.id||!Array.isArray(feed.events))return base;
  base.status="ok";base.logo=feed.team.logo||"";base.record=text(feed.team.recordSummary);base.standing=text(feed.team.standingSummary,"");
  const games=[],seen=new Set();
  for(const e of feed.events){
    const c=e.competitions?.[0],date=c?.date||e.date;
    if(!c||!Number.isFinite(Date.parse(date))||seen.has(String(e.id)))continue;seen.add(String(e.id));
    const ours=c.competitors?.find(x=>String(x.team?.id||x.id)===source.id);
    const opp=c.competitors?.find(x=>String(x.team?.id||x.id)!==source.id);
    if(!ours||!opp?.team)continue;
    const type=c.status?.type||e.status?.type||{},state=type.state||"pre";
    const tbd=c.timeValid===false||e.timeValid===false||c.status?.isTBDFlex===true||/TBD/i.test(text(type.detail,""));
    const cancelled=/CANCEL/i.test(text(type.name,"")),postponed=/POSTPON/i.test(text(type.name,""));
    const my=score(ours),their=score(opp),completed=type.completed===true;
    const result=completed&&my!==null&&their!==null?(my>their?"W":my<their?"L":"T"):null;
    games.push({id:source.league+":"+e.id,date,local_day:tbd&&/T00:00(?::00)?Z$/.test(date)?date.slice(0,10):day(date),sort_time:Date.parse(date),matchup:(ours.homeAway==="home"||c.neutralSite?"vs ":"@ ")+text(opp.team.abbreviation||opp.team.shortDisplayName||opp.team.displayName),
      date_label:tbd&&/T00:00(?::00)?Z$/.test(date)?date.slice(5,10):when(date),
      time_label:cancelled?"Cancelled":postponed?"Postponed":completed?"Final":state==="in"?text(type.shortDetail,"In progress"):tbd?"TBD":clock(date),
      state:cancelled?"cancelled":postponed?"postponed":state,completed,result,my_score:my,opponent_score:their,
      score_label:my!==null&&their!==null?my+"–"+their:"—",tbd});
  }
  games.sort((a,b)=>a.sort_time-b.sort_time);
  base.next=games.find(g=>g.state==="in")||games.find(g=>!g.completed&&!["cancelled","postponed"].includes(g.state)&&(g.sort_time>=now||(g.tbd&&g.local_day>=day(now))))||null;
  base.last=games.filter(g=>g.completed&&g.sort_time<=now).at(-1)||null;
  return base;
}
function normalizePga(feed,now){
  const empty={status:feed?.error||"unavailable",name:"PGA Tour",state:"Unavailable",leaders:[],next:null};
  if(!feed||feed.error||!Array.isArray(feed.events))return empty;
  const events=feed.events;
  const event=events.find(e=>(e.status?.type||e.competitions?.[0]?.status?.type)?.state==="in")
    ||events.find(e=>(e.status?.type||e.competitions?.[0]?.status?.type)?.state==="pre")
    ||events.slice().sort((a,b)=>Date.parse(b.date)-Date.parse(a.date))[0];
  const future=(feed.leagues?.[0]?.calendar||[]).filter(e=>Number.isFinite(Date.parse(e.startDate))&&e.startDate.slice(0,10)>day(now)).sort((a,b)=>a.startDate.localeCompare(b.startDate));
  const upcoming=future[0]?{name:text(future[0].label),date:future[0].startDate.slice(0,10)}:null;
  if(!event)return {...empty,status:"ok",state:"No tournament returned",next:upcoming};
  const c=event.competitions?.[0]||{},type=event.status?.type||c.status?.type||{};
  const leaders=(c.competitors||[]).filter(x=>x.athlete).slice().sort((a,b)=>(number(a.order)??999)-(number(b.order)??999)).slice(0,5).map(x=>({
    name:text(x.athlete.displayName||x.athlete.fullName),position:text(x.status?.position?.displayName||x.status?.position?.displayValue||x.order),
    score:text(typeof x.score==="object"?x.score?.displayValue:x.score),detail:text(x.status?.displayValue||x.status?.shortDetail,"")}));
  return {status:"ok",name:text(event.name,"PGA Tour"),state:type.completed?"Final leaderboard":type.state==="in"?"In progress":type.state==="pre"?"Upcoming tournament":text(type.description,"Status unavailable"),leaders,next:upcoming};
}
function normalizeFantasy(feed,config,season) {
  const base={key:config.key,name:config.name,league_id:config.id,user_team_id:config.team_id,season,status:feed?.error||"unavailable",team:"",record:"—",rank:null,week:null,matchup:null,previous:null};
  if(!feed||feed.error)return base;
  if(String(feed.id)!==String(config.id)||Number(feed.seasonId)!==season||!Array.isArray(feed.teams)||!Array.isArray(feed.schedule))return {...base,status:"schema_error"};
  const ours=feed.teams.find(t=>Number(t.id)===config.team_id);
  if(!ours)return {...base,status:"team_not_found"};
  const period=number(feed.status?.currentMatchupPeriod);
  const scoring=number(feed.scoringPeriodId??feed.status?.scoringPeriodId);
  const periods=feed.settings?.scheduleSettings?.matchupPeriods||{};
  const matches=feed.schedule.filter(m=>Number(m.home?.teamId)===config.team_id||Number(m.away?.teamId)===config.team_id);
  function normalize(m){
    const home=Number(m.home?.teamId)===config.team_id,mine=home?m.home:m.away,other=home?m.away:m.home;
    const opponent=feed.teams.find(t=>Number(t.id)===Number(other?.teamId));
    const span=Array.isArray(periods[m.matchupPeriodId])?periods[m.matchupPeriodId].map(number).filter(x=>x!==null):[];
    const complete=span.length&&scoring!==null?Math.max(...span)<scoring:period!==null&&m.matchupPeriodId<period&&["HOME","AWAY","TIE"].includes(m.winner);
    const scheduled=span.length&&scoring!==null&&scoring<Math.min(...span);
    const myScore=complete?(number(mine?.totalPoints)??number(mine?.totalPointsLive)):(number(mine?.totalPointsLive)??number(mine?.totalPoints));
    const opponentScore=complete?(number(other?.totalPoints)??number(other?.totalPointsLive)):(number(other?.totalPointsLive)??number(other?.totalPoints));
    const result=complete&&other&&myScore!==null&&opponentScore!==null?(myScore>opponentScore?"W":myScore<opponentScore?"L":"T"):null;
    return {id:m.id,week:m.matchupPeriodId,opponent:other?text(opponent?.name||[opponent?.location,opponent?.nickname].filter(Boolean).join(" "),"Team "+other.teamId):"Bye",
      my_score:myScore,opponent_score:opponentScore,my_win_pct:!complete&&other?probability(mine?.winProbability):null,opponent_win_pct:!complete&&other?probability(other?.winProbability):null,my_projected:number(mine?.totalProjectedPointsLive)??number(mine?.totalProjectedPoints),opponent_projected:number(other?.totalProjectedPointsLive)??number(other?.totalProjectedPoints),
      state:!other?"Bye":complete?"Final":scheduled?"Scheduled":period===Number(m.matchupPeriodId)?"In progress":"Status unconfirmed",complete:!!complete,result};
  }
  const unique=new Map(matches.map(m=>[String(m.id),m]));
  const ordered=[...unique.values()].sort((a,b)=>a.matchupPeriodId-b.matchupPeriodId);
  const current=period===null?null:ordered.find(m=>Number(m.matchupPeriodId)===period);
  const previous=ordered.filter(m=>period!==null&&Number(m.matchupPeriodId)<period).map(normalize).filter(m=>m.complete).at(-1)||null;
  const record=ours.record?.overall||{};
  const rec=[number(record.wins),number(record.losses),number(record.ties)];
  return {...base,status:feed.status?.isActive===false||period!==null&&period<=0?"inactive":period===null?"period_unknown":"ok",team:text(ours.name||[ours.location,ours.nickname].filter(Boolean).join(" "),"Team "+config.team_id),record:rec[0]!==null&&rec[1]!==null?rec.slice(0,rec[2]?3:2).map(text).join("-"):"—",
    rank:number(ours.playoffSeed??ours.rankCalculatedFinal),week:period,matchup:current?normalize(current):null,previous};
}

// ESPN group standings supply conference positions, not an overall league rank.
function standingsFor(feed,source,summary){
  let found=null;
  function walk(group){
    const entry=(group?.standings?.entries||[]).find(e=>String(e.team?.id)===source.id);
    if(entry&&(!found||group.isConference))found={group,entry};
    for(const child of group?.children||[])walk(child);
  }
  if(feed&&!feed.error)walk(feed);
  const aliases={"Eastern Conference":"East","Western Conference":"West","American Football Conference":"AFC","National Football Conference":"NFC","Big Ten Conference":"Big Ten","Big East Conference":"Big East"};
  let conference=null,division=null,conference_record=null;
  if(found){
    const stats=found.entry.stats||[];
    const rank=number(stats.find(s=>s.name==="playoffSeed")?.value);
    const label=aliases[found.group.name]||text(found.group.shortName||found.group.name,"").replace(/ Conference$/,"");
    if(rank!==null&&rank>0)conference=label+" #"+rank;
    conference_record=text(stats.find(s=>s.name==="vs. Conf.")?.displayValue,"")||null;
  }
  const match=String(summary||"").match(/^(\d+)(?:st|nd|rd|th) in (.+?)(?: Division)?$/i);
  if(match&&["nba","nfl"].includes(source.league))division=match[2].replace(/^(AFC|NFC) /,"")+" #"+match[1];
  return {conference,division,conference_record};
}
function probability(value){const n=number(value);return n!==null&&n>=0&&n<=1?Math.round(n*1000)/10:null;}

async function fetchJson(url,headers={}){
  try{
    const response=await fetch(url,{method:"GET",headers:{Accept:"application/json",...headers},redirect:"error",signal:AbortSignal.timeout(4500)});
    if(!response.ok)return {error:[401,403].includes(response.status)?"auth_failed":"unavailable"};
    const data=await response.json();return data&&typeof data==="object"?data:{error:"schema_error"};
  }catch{return {error:"unavailable"};}
}
async function run(input){
  const now=number(input?.trmnl?.system?.timestamp_utc)!==null?number(input.trmnl.system.timestamp_utc)*1000:Date.now();
  const fields=input?.trmnl?.plugin_settings?.custom_fields_values||{};
  const year=number(fields.season)??Number(new Intl.DateTimeFormat("en-US",{timeZone:SD_TZ,year:"numeric"}).format(now));
  const season=Number.isInteger(year)&&year>=2018&&year<=2100?year:2026;
  const value=key=>typeof fields[key]==="string"?fields[key].trim():"";
  function credentials(config){
    const s2=value(config.key==="nob"?"nob_espn_s2":"espn_s2");
    const swid=config.key==="nob"?(value("nob_espn_swid")||value("espn_swid")):value("espn_swid");
    return {s2,swid,ok:!!s2&&!!swid&&!/[\r\n]/.test(s2+swid)&&s2!=="[set]"&&swid!=="[set]"};
  }
  const jobs=[...TEAM_SOURCES.map(s=>fetchJson(s.url)),fetchJson("https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard"),
    ...FANTASY_LEAGUES.map(c=>{
      const auth=credentials(c);
      return auth.ok?fetchJson("https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/"+season+"/segments/0/leagues/"+c.id+"?view=mTeam&view=mMatchupScore&view=mSettings",{Cookie:"espn_s2="+auth.s2+"; SWID="+auth.swid}):Promise.resolve({error:"needs_auth"});
    })];
  const leagueSources=[...new Map(TEAM_SOURCES.map(s=>[s.league,s])).values()];
  jobs.push(...leagueSources.map(s=>fetchJson("https://site.api.espn.com/apis/v2/sports/"+s.sport+"/"+s.league+"/standings")));
  const feeds=await Promise.all(jobs);
  const teams=TEAM_SOURCES.map((c,i)=>({...normalizeTeam(feeds[i],c,now),standings:standingsFor(feeds[8+leagueSources.findIndex(s=>s.league===c.league)],c,feeds[i]?.team?.standingSummary)})),pga=normalizePga(feeds[5],now);
  const fantasy=FANTASY_LEAGUES.map((c,i)=>normalizeFantasy(feeds[6+i],c,season));
  const statuses=[...teams.map(t=>t.status),pga.status,...fantasy.map(f=>f.status)];
  return {teams,pga,fantasy,updated_at:new Date(now).toISOString(),status:statuses.every(x=>x==="ok")?"ok":statuses.some(x=>x==="ok")?"partial":"unavailable",time_zone:SD_TZ,season};
}
