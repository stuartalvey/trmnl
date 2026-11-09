# Current project status

Last compared **2026-11-09**, after adding Today's Balance. Starting documentation
baseline: [c0bd596](https://github.com/stuartalvey/trmnl/commit/c0bd596a98d87734c0f547cb3fcc8ca6c4ef6649).
See this file's latest commit for the implementation handoff.

## Implemented

- Home Page `535610`, headed **Alvey Command Center**, full-screen landscape.
- Seven-day grid: family events, five teams' games, weather icons, Fahrenheit
  highs/lows, and precipitation; current Noblesville temperature.
- Daily NLT verse beside **Today's Balance**: Stuart/Ali readiness scores,
  normalized percentages, and a black/gray donut with a small heart.
- Apple Calendar `535612`; verse/weather/sports `536052` / `536062` / `536071`.
- Healthy third-party Oura instances **Stu's Oura** `536089` and **Ali's Oura**
  `536097`. Home reads their rendered snapshots; no personal payload is committed.

## Active priorities and pending work

- Iterate on Home Page appearance with the owner. Separate Weather, Sports,
  Health, and Markets/News detail screens remain planned.
- Verify on physical TRMNL X when available; server preview is the current visual check.

## Deployment and synchronization

- Home full/shared templates deployed through MCP; X-model full-screen preview
  verified with both accounts. Seven dates, verse, and existing integrations remain.
- Matching runtime source, synthetic tests, and documentation captured in GitHub.
- TRMNL → GitHub export is automatic for Home Page; reverse deployment is manual.
  Helpers still require explicit capture; no Actions deployment is configured.
- Existing Home settings differ only in empty headers/body YAML representation
  (empty strings versus null). No detected functional template drift.
- Device `75111`, model `v2`, landscape, 900-second wake, 4-bit render context;
  no physical screen/check-in verification established.
- Oura entries remain visible in the playlist; existing Welcome, Calendar,
  unrelated BTC entry, and three hidden helper entries were left intact.

## Validation and known limitations

- Synthetic balance tests pass: percentages, boundary values, missing/invalid
  scores, stale/prior-day/future timestamps, and timezone offsets.
- Both actual source snapshots parse privately; readiness values and screenshots
  stay out of this public repository.
- Oura HTML is an upstream dependency. Missing/stale/combined-zero input shows
  neutral/dashes. Same-day, six-hour freshness uses the plugin's Last updated
  footer, which is not proof of the readiness measurement date.
- No automated full-layout or device tests; crowded days may clamp/hide content.
  Source polling, Home refresh, and device wake schedules are independent.
- See [ARCHITECTURE.md](ARCHITECTURE.md) and [DEPLOYMENT.md](DEPLOYMENT.md)
  before editing or deploying. Fetch current GitHub and live state first.
