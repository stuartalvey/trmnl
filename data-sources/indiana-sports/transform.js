// Public ESPN schedules, reduced to the next seven Noblesville calendar days.
// Runs in TRMNL Serverless (Node). No account or API key is required.
const SPORTS_TZ = "America/Indiana/Indianapolis";
const TEAM_SOURCES = [
  { key: "pacers", label: "Pacers", id: "11", league: "nba", sport: "basketball", url: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/11/schedule" },
  { key: "colts", label: "Colts", id: "11", league: "nfl", sport: "football", url: "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/11/schedule" },
  { key: "purdue_football", label: "Purdue FB", id: "2509", league: "college-football", sport: "football", url: "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/2509/schedule" },
  { key: "purdue_basketball", label: "Purdue BB", id: "2509", league: "mens-college-basketball", sport: "basketball", url: "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/2509/schedule" },
  { key: "butler_basketball", label: "Butler", id: "2086", league: "mens-college-basketball", sport: "basketball", url: "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/2086/schedule" }
];
function localDay(value) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: SPORTS_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(value));
  const part = type => parts.find(p => p.type === type).value;
  return part("year") + "-" + part("month") + "-" + part("day");
}
function nextDate(day, count) {
  const parts = day.split("-").map(Number);
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + count)).toISOString().slice(0, 10);
}
function localTime(value) {
  return new Intl.DateTimeFormat("en-US", { timeZone: SPORTS_TZ, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(value)).replace(/[\u00a0\u202f]/g, " ");
}
function normalizeSchedules(feeds, nowMs) {
  const start = localDay(nowMs);
  const end = nextDate(start, 7);
  const games = [];
  const sources = [];
  const errors = [];
  const seen = new Set();
  TEAM_SOURCES.forEach((source, index) => {
    const feed = feeds[index];
    if (!feed || feed.error || !Array.isArray(feed.events) || String(feed.team?.id) !== source.id) {
      errors.push(source.label);
      sources.push({ key: source.key, label: source.label, ok: false });
      return;
    }
    sources.push({ key: source.key, label: source.label, ok: true });
    for (const event of feed.events) {
      const competition = event.competitions?.[0];
      const date = competition?.date || event.date;
      if (!competition || !date || !Number.isFinite(Date.parse(date))) continue;
      const competitors = competition.competitors || [];
      const ours = competitors.find(c => String(c.team?.id || c.id) === source.id);
      const opponent = competitors.find(c => String(c.team?.id || c.id) !== source.id);
      if (!ours || !opponent?.team) continue;
      const type = competition.status?.type || {};
      const statusName = String(type.name || "");
      const isTbd = competition.timeValid === false || event.timeValid === false || competition.status?.isTBDFlex === true || /TBD/i.test(statusName + " " + String(type.detail || ""));
      // An explicitly date-only TBD fixture must not move to the previous day.
      const day = isTbd && /T00:00(?::00)?Z$/.test(date) ? date.slice(0, 10) : localDay(date);
      if (day < start || day >= end) continue;
      const gameId = source.league + ":" + event.id;
      if (seen.has(gameId)) continue;
      seen.add(gameId);
      const trackedOpponent = TEAM_SOURCES.find(s => s.league === source.league && s.id === String(opponent.team.id));
      const opponentName = trackedOpponent?.label || opponent.team.abbreviation || opponent.team.shortDisplayName || opponent.team.displayName;
      const separator = competition.neutralSite || ours.homeAway === "home" ? "vs" : "@";
      let state = type.state || "pre";
      let timeLabel = isTbd ? "TBD" : localTime(date);
      if (/CANCEL/i.test(statusName)) { state = "cancelled"; timeLabel = "Cancelled"; }
      else if (/POSTPON/i.test(statusName)) { state = "postponed"; timeLabel = "Postponed"; }
      else if (type.completed) { timeLabel = "Final"; }
      else if (state === "in") { timeLabel = "Live"; }
      games.push({
        id: gameId,
        team_key: source.key,
        team: source.label,
        sport: source.sport,
        day: day,
        date: date,
        sort_time: Date.parse(date),
        time_label: timeLabel,
        time_tbd: isTbd,
        state: state,
        matchup: source.label + " " + separator + " " + opponentName,
        logo: feed.team.logo || ours.team.logos?.[0]?.href || ""
      });
    }
  });
  games.sort((a, b) => a.day.localeCompare(b.day) || a.sort_time - b.sort_time || a.matchup.localeCompare(b.matchup));
  return {
    games: games,
    sources: sources,
    status: errors.length === 0 ? "ok" : errors.length === TEAM_SOURCES.length ? "unavailable" : "partial",
    unavailable_teams: errors,
    time_zone: SPORTS_TZ,
    window_start: start,
    window_end_exclusive: end,
    updated_at: new Date(nowMs).toISOString()
  };
}
async function run(input) {
  const nowMs = input?.trmnl?.system?.timestamp_utc ? Number(input.trmnl.system.timestamp_utc) * 1000 : Date.now();
  const feeds = await Promise.all(TEAM_SOURCES.map(async source => {
    try {
      const response = await fetch(source.url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(3500) });
      if (!response.ok) return { error: "HTTP " + response.status };
      return await response.json();
    } catch (error) {
      return { error: "Schedule unavailable" };
    }
  }));
  return normalizeSchedules(feeds, nowMs);
}
