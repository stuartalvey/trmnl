# Current project status

Last compared **2026-11-09**, after the first Health Detail draft. Starting documentation
baseline: [c0bd596](https://github.com/stuartalvey/trmnl/commit/c0bd596a98d87734c0f547cb3fcc8ca6c4ef6649).
See this file's latest commit for the implementation handoff.

## Implemented

- Home Page `535610`, headed **Alvey Command Center**, full-screen landscape.
- Seven-day grid: family events, five teams' games, weather icons, Fahrenheit
  highs/lows, and precipitation; current Noblesville temperature.
- Daily NLT verse beside **Today's Balance**: Stuart/Ali readiness scores,
  normalized percentages, and a black/gray donut with a small heart.
- Apple Calendars Stuart `535612` and Ali `536125`, merged and deduplicated
  in Family with S / A / S+A source labels and H for US Holidays;
   verse/weather/sports `536052` / `536062` / `536071`.
- Healthy third-party Oura instances **Stu's Oura** `536089` and **Ali's Oura**
  `536097`. Home reads their rendered snapshots; no personal payload is committed.

- **Weather Detail** `536164`, playlist item `901626` immediately after Home:
  independent hourly Open-Meteo polling; seven-day high/low curves and precipitation
  shading, current conditions header, 24-hour precipitation summary, and four
  cards: sunrise/sunset, current-hour estimated UV, current wind/gusts/direction,
  and current humidity. Source: `views/weather/`.

- **Sports Detail** `536256`, playlist item `901764` after Weather Detail:
  five teams' next games/records/latest results, PGA leaderboard/next tournament,
  APEX and NOB current matchup/live score snapshots/projections, ESPN win chances,
  and previous results. Team cards include conference/division positions where
  applicable, centered within each team card; PGA and Fantasy are symmetric enclosed sections.
  Both fantasy leagues authenticated and returned valid matchups; separate S2 fields.
  Source: `views/sports/`. No Sites dependency; cookies remain in TRMNL.

- **Health Detail — first draft** `536354`, item `901897`
  after Sports: Stuart's daily steps/goal/reference chart, active energy/resting
  HR, both Oura readiness/sleep/activity gauges, and eight-week Protein Social
  workout heatmap/weekly counts. Hidden workout helper `536353`
  (item `901896`) polls hourly. Source: `views/health/` and
  `data-sources/workout-consistency/`.

## Active priorities and pending work

- Iterate on Home Page appearance with the owner. Markets/News detail remains planned.
- Health next: obtain validated hourly steps/history for both people
  for today-versus-usual-time curves. Neither blocks the deployed first draft.
- Verify on physical TRMNL X when available; server preview is the current visual check.

## Deployment and synchronization

- Home full/shared templates deployed through MCP; X-model full-screen preview
  verified with both Oura and calendar accounts. Seven dates, verse, games, and
  weather remain visible. Shared calendar matches appear once; holiday source events use H.
- Weather Detail deployed/configured; hourly polling succeeded and full X preview
  verified after the curve redesign, including all seven days, curve labels,
  precipitation shading, and the four cards.
- Sports Detail deployed/configured; direct public and both private ESPN sources
  verified, X/full preview inspected with connected, enclosed cards, standings, and win odds. Refresh interval 15 min;
  render updates periodically, not streaming. Source/settings captured manually.
- Matching runtime source, synthetic tests, and documentation captured in GitHub.
  Weather Detail is captured manually; automatic sync is not configured/verified.
- TRMNL → GitHub export is automatic for Home Page; reverse deployment is manual.
  Helpers still require explicit capture; no Actions deployment is configured.
- Existing Home settings differ only in empty headers/body YAML representation
  (empty strings versus null). No detected functional template drift.
- Device `75111`, model `v2`, landscape, 900-second wake, 4-bit render context;
  no physical screen/check-in verification established.
- Oura entries remain visible in the playlist; existing Welcome, Calendars,
  unrelated BTC entry, and three hidden helper entries were left intact.

## Validation and known limitations

- Health draft: live source namespaces inspected, workout API/read helper verified,
  X/full preview checked. Synthetic health/workout/Liquid tests pass. Goal defaults
  to 10,000 and is editable; missing days are dashes. Prior-day average uses only
  existing records, not a same-time baseline. No hourly curve is implemented.
- Ali's Apple Health `536547` now receives Companion samples and feeds a
  current-day movement summary in Health Detail; both Oura panels remain independent.
  Oura freshness uses snapshot footer time, not measurement date. Workout charts
  describe logged completed sessions, not all physical activity.
- Health view and workout helper manually captured in GitHub; no automatic sync
  claim. Other existing dashboard/source definitions were left intact.

- Sports Detail transform and synthetic Liquid suites pass, including independent
  S2 routing, live/final fields, null/zero, expiry, byes/inactive, schema validation,
  partial failures, dates/DST, PGA, and escaped display values.
- No real private league payloads or credential values are committed. No write
  requests are made to ESPN. The season form currently targets 2026.
- Sports Detail default async runtime and polling jobs work; inline write-time
  transform trials intermittently reported a local runtime connection error.
  Home/Weather source and existing helper definitions were not changed.

- Synthetic weather Liquid tests pass: seven-day curves, gaps in temperature
  and precipitation, flat/negative temperatures, current-hour UV selection,
  precipitation threshold/window, zero values, stale and missing-data states.
- Home template and existing helper settings unchanged by Weather Detail work.
- Synthetic calendar Liquid tests pass: shared and within-feed deduplication,
  distinct events, source and holiday labels, cancellation, date spans, and missing feeds.
- Synthetic balance tests pass: percentages, boundary values, missing/invalid
  scores, stale/prior-day/future timestamps, and timezone offsets.
- Both actual source snapshots parse privately; readiness values and screenshots
  stay out of this public repository.
- Oura HTML is an upstream dependency. Missing/stale/combined-zero input shows
  neutral/dashes. Same-day, six-hour freshness uses the plugin's Last updated
  footer, which is not proof of the readiness measurement date.
- Calendar matching is conservative: title/start/end/all-day/location must match;
  S/A labels indicate calendar membership, not attendance. Neither source is edited.
- Weather Detail uses a 40% precipitation threshold over 24 hourly samples;
  it is not radar/nowcasting or an alert feed. DST repeated local hours are not
  disambiguated. Its separate request can briefly differ from Home's forecast.
- No automated full-layout or device tests; crowded days may clamp/hide content.
  Source polling, Home refresh, and device wake schedules are independent.
- See [ARCHITECTURE.md](ARCHITECTURE.md) and [DEPLOYMENT.md](DEPLOYMENT.md)
  before editing or deploying. Fetch current GitHub and live state first.

## Ali Apple Health connection setup

Ali's Apple Health `536547` was present but empty with Polling and no URL.
Changed live strategy to **Webhook** and verified the setting. Companion on
Ali's phone must refresh its plugin list, select this destination, and sync.
Her independent sync subsequently arrived with raw health metrics/workouts;
Health Detail now binds current-day steps, energy, and latest resting HR when
available. Synthetic adapter tests and an X preview pass.
no personal values or webhook URL are stored in GitHub.

Ali feed adapter: `private_plugin_536547.merge_variables.health.metrics` is
parsed in the Health Detail shared script. It filters local current-day samples,
removes exact duplicates, converts supported energy units, and preserves missing
values. No raw payloads or reminder data are committed or displayed. Oura stale
snapshot guards remain active; an old Oura snapshot can show Sync Oura even while
Apple Health is connected.

## Ali Apple Health size-limit repair

Ali's raw Companion payload exceeded TRMNL's 100 KB rendering limit. Node was
selected but no transform existed. Installed a Node transform under
`data-sources/ali-apple-health/transform.js` that retains seven local days of
compact step/energy/resting-HR records plus hourly step sums. Exact duplicate
samples are removed, unsupported metrics/reminders are omitted from render
output, and the Health Detail `health.metrics` contract is preserved.

Synthetic tests pass, including 3,500 samples with output under 30 KB. Source
and Node setting verified in TRMNL. Reset was requested, but refreshing the old
stored raw payload still reports the historical size error; **a fresh Companion
sync is required before end-to-end recovery can be confirmed**. No claim of a
successful new upload or healthy source is made by this update. Existing Health
Detail continues to use its last available data; raw personal payloads stay out
of GitHub. Update this status after the new sync is verified.
