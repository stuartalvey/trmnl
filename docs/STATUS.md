# 2026-11-16 — Apple Health step-feed reliability (partial, direct webhook only)
- Diagnosed the live direct sources: Stuart's recipe install `536212` has empty `metrics` and no latest `updated_at`; the newest populated `daily_history` day is Nov 10, even though a nonempty Nov 16 payload appeared earlier. TRMNL logs show source-only schedule skips, not proof the Companion webhook has stopped sending.
- Ali's independent webhook `536547` currently receives a reminders-only raw payload; normalized `health.metrics` and `step_hours` are empty. Earlier oversize errors were fixed by the compact Node transform, but no recent step sample has arrived.
- **Deployed:** Ali's Node `transform.js` now saves a bounded, dated `health.last_valid_steps` snapshot in TRMNL serverless saved state and preserves it across empty/reminders-only input. Future valid uploads bootstrap the retained reading; none is currently present. Existing direct webhook destination, Health metrics contract and step-hour aggregation remain unchanged.
- **Deployed:** Health Detail `536354` (full/shared) marks missing Stuart values stale, consumes current or retained dated snapshots where available, and never plots previous-day data as today's point. Ali's retained snapshot is now supported without a ChatGPT schedule. The Gazette layout, Oura and Protein Social data flow are unchanged. TRMNL X `v2/markup_full` preview completed and visually passed after changes. Physical display not verified.
- **Blocked at source:** Stuart's existing plugin `536212` is a *read-only recipe install*. TRMNL rejects Node language selection and transform writes in place. `data-sources/stu-apple-health/transform.js` is staged in GitHub with synthetic empty-update and genuine-zero tests **but is NOT deployed**. A user-controlled fork/new editable private Webhook destination, Node selection, and Companion destination switch will be necessary to get server-side last-good retention for Stuart. Do not replace the current source in Health Detail until an actual nonempty Companion upload is verified.
- **Next verification:** Fresh Companion health sync on both phones, confirm processed step samples/date and persistence across subsequent empty payloads, then check the physical TRMNL. Never substitute ChatGPT Health queries or manual edits for the direct webhooks.

# 2026-11-15 — Faith view renamed Alvey Sabbath
- Renamed the existing live TRMNL plugin and on-screen masthead to **Alvey Sabbath**, with the warm subtitle **TRADERS POINT · THIS WEEK’S WORSHIP & REFLECTION**. Existing sermon, Scripture, study prompts, layout, source/refresh logic and device rotation unchanged.
- Confirmed playlist item `908451` remains Sunday-only (day 0, 00:00–23:59). No Saturday evening schedule added.
- GitHub `views/faith/full.liquid` updated and deployed to TRMNL setting `541864`.

# 2026-11-15 — Sunday Study added and deployed
- New private webhook plugin **Sunday Study — Traders Point** (setting `541864`), independently deployed from `views/faith/full.liquid`, framework 3.4.6. Current confirmed message: **Beauty, Betrayal and Bread**, Nov 14, 2026, Mark 14:1–26, Aaron Brockett. Source: https://tpcc.org/messages/beauty-betrayal-and-bread.
- Displays a short verified NLT excerpt from Mark 14:8, concise three-scene contrast, two independently written questions, an original prayer, and one action. The wording is not presented as an official church study guide.
- Device `75111`: visible playlist item `908451` is scheduled **Sunday 00:00–23:59**, ordered first; the prior five main screens are preserved in their relative order. Stale sermon data older than 72 hours yields an awaiting-current-message fallback.
- X-model server preview completed and visually inspected after the initial layout fixes: full-width newspaper typography, three-scene strip, questions/prayer/action and footer visible, no clipping. After the timestamp guard was deployed, a fresh TRMNL X `v2/markup_full` server preview completed and was visually inspected; all study content and the footer fit. Physical device display remains unverified.
- Recurring ChatGPT task **Refresh Traders Point Sunday Study** (`6af9ddf858c0819193cf77ddc4b9e346`) created for Sunday mornings, starting Nov 22. It is designed to verify source date/passage, generate original prompts, and replace the entire webhook JSON. It has not run yet, so live automatic refresh remains **untested**. Verify after first execution.
- Code, non-secret manifest, and docs captured in GitHub; no other view templates or data pipelines changed.

# 2026-11-15 — Home agenda icons replaced with official Tabler outlines

- Owner selected professional Tabler icons after rejecting the custom female silhouette. Updated only Home Page `535610` `src/shared.liquid` `agenda_owner_icon` with official published **Tabler Icons** outline paths: `man`, `woman`, `users`, and `calendar-event`. All four have a consistent 24×24 viewBox, 2px stroke and monochrome local SVG rendering.
- X-model `v2/markup_full` preview completed and was inspected: all four owner categories retain clear differentiation, event title/time layout is unchanged, all seven days and footer fit. No calendar logic, sports icons, data, playlist settings or other pages changed.
- Repo [source](../src/shared.liquid) and live TRMNL plugin updated. Tabler artwork is MIT-licensed, with upstream source credited in the Liquid template. Physical hardware check-in not confirmed.

# 2026-11-15 — Home Page follow-up: editorial verse, owner icons, fit corrected

- Updated live Home Page plugin `535610` only. **Verse of the day** is an editorial scripture pull quote with a serif first-letter drop cap; today's readiness card remains unchanged in meaning.
- **Family entries now follow the Games format:** monochrome owner SVG at left, bold event title on first line, start time on second. Stuart = male silhouette; Ali = female silhouette; shared = two people; US Holidays = calendar/star. Removed visible S/A/S+A/H legend while retaining source IDs, accessibility labels, deduplication and date semantics. Sports logos/times remain as before.
- Applied Home-only spacing and legibility adjustments without modifying the canonical shared `design/gazette.css`. TRMNL X `v2/markup_full` preview completed with **all seven days and the entire footer visible**, even with multiple Family and Sports items on several days.
- Source: `src/full.liquid` and `src/shared.liquid` (owner icons); [design principles](DESIGN_SYSTEM.md) updated. Calendar synthetic test assertions updated to check `data-owner` and the title-then-time structure; offline Node/LiquidJS test execution has **not** been confirmed in this chat. No data collectors, credentials, schedules, playlist positions or other views touched. Device's physical display still unverified.

# 2026-11-15 — Full visible playlist overhaul: The iOS Gazette

- **Design standard updated:** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) now governs all five screens. A canonical stylesheet lives at [design/gazette.css](../design/gazette.css); Home, Weather, Sports and Health embed the same CSS. Added [design/check_gazette.cjs](../design/check_gazette.cjs), an offline equality/style guard. Market Intelligence continues to use its earlier preview-tuned editorial `.ig` styles.
- **All five visible screens:** Home `535610`, Weather `536164`, Sports `536256`, Health `536354` are now deployed with serif major headings, unboxed panels, thin separators and compact footers; Market Intelligence `537634` was already deployed in the same visual family. “The iOS Gazette” is **not** printed on any page.
- **Preview checks:** Each of the four new `v2/markup_full` server previews completed and was inspected. Home shows seven full days without event-time collisions (Today then weekday abbreviations); Weather showed a seven-day high/low chart after successful weather-feed refresh; Sports showed five teams plus PGA and two fantasy leagues; Health showed steps, Oura gauges and eight-week consistency including zero weeks. All footers fit at standard X preview resolution.
- **No business-logic changes:** No data collector, plugin settings, source credentials, standings/health logic, playlist order, visibility or schedules were intentionally modified. TRMNL's custom-style advisory warning is expected; previews completed. The account's physical device check-in/display has not been verified. Additional automated Node/Liquid regression suites were not executed during this visual-only pass because the runtime lacked GitHub network access; the same CSS equality checks were directly evaluated against connected GitHub source contents.
- **Next quality gate:** Inspect the appearance on the physical e-paper panel when it checks in; iterate only on proven readability/density issues, keeping the shared CSS and per-plugin deployment synchronized.

# 2026-11-15 — Market Intelligence typography, comparisons and headlines refined

- Owner requested the iOS Gazette name be internal only. Removed it from on-screen masthead; **Market Intelligence** now stands alone in a local Georgia/Times-style serif headline, with serif section headings and sans-serif metrics/news copy.
- All three financial cards now align their explicit comparison row below the value and above the 12-month sparkline: **Today vs previous close** for S&P/LLY, **24h vs 24h ago** for Bitcoin. Housing's comparable row remains **MoM/YoY** (mortgage **4W/1Y** as percentage-point differences). No calculations or collector data changed.
- Two headlines in each news band have an editorial hierarchy: bold lead with moderate serif initial, then an **ALSO** label and hairline divider before the secondary headline. All six live headlines, three market metrics, four real estate metrics, charts, and footer fit in completed TRMNL X `v2/markup_full` preview.
- GitHub `views/news-markets/full.liquid` updated and deployed to TRMNL `537634`; live GitHub match verified after deployment. No modification to other views, collector, account settings or playlist. Device hardware display still unverified.

# 2026-11-15 — iOS Gazette Market Intelligence redesign deployed

- Owner's **The iOS Gazette** editorial-minimalist standard applied to `News & Markets Detail` plugin `537634`. GitHub source: [views/news-markets/full.liquid](../views/news-markets/full.liquid). Scoped sans-serif CSS, Gazette masthead, unboxed 3-up market metrics/4-up housing metrics, subtle rules, 17px full-width news headlines and consistent source metadata. Retained all existing collector/market/housing/news logic, MoM/YoY comparison semantics and trends.
- GitHub template committed and the identical `markup_full` deployed through TRMNL MCP. Final live-source refresh succeeded on Nov 15, 2026; fresh headlines were deliberately used to stress-test wrapping. A `v2` TRMNL X full-screen server preview completed and was visually inspected: all six headlines, markets, housing charts, source credits and footer fit without clipping. Source code for `transform.js`, settings, playlist and other views not changed. A physical device check-in/display is **not** established.
- Custom scoped CSS and missing `title_bar` generate advisory validator warnings (the latter pre-existed). Do not assume GitHub commits auto-deploy to other independent plugins. Other four core views still await Gazette adaptation.

# Current project status

## 2026-11-11 — News relocated under its corresponding market section

- Merged into canonical GitHub main through [PR #3](https://github.com/stuartalvey/trmnl/pull/3), squash commit `9553fde`; main `full.liquid` matches the live TRMNL markup. Playlist item 903384 remains visible at row 4 (fifth screen), plugin healthy. Live playlist preview now reports updated version `v=1794401706` after the render.

- Reorganized `News & Markets Detail` `537634` from three sections into **two**: Financial Markets followed by World/U.S. and Lilly news bands, then Hamilton County Real Estate followed by a Real Estate News band.
- Each news article now receives a full-width row (10/12 grid for headline, 2/12 for source/date), instead of a 1/3-width news card. The separate `The Briefing` section was removed.
- The 3 financial cards, 4 equal real estate cards, previous-close/24h percent changes, 12-month market charts, IAR MoM/YoY and 12-month local charts were preserved. No changes to the data collector, sources or other screens.
- Deployed `markup_full` directly through TRMNL, forced source refresh (success, live source statuses: IAR, 4 FRED series, all 3 market feeds and 5 news feeds). TRMNL X `v2/markup_full` preview completed successfully and was inspected visually: all six headlines, cards and footer fit without clipping. Hardware display remains unverified; the private-plugin settings thumbnail may not update until its own Force Refresh.


## 2026-11-11 — Private-plugin thumbnail stale despite current source

- Owner's Safari screenshot of private-plugin page shows old hero-card layout, labelled refreshed ~9 hours earlier. Live TRMNL instance 537634 has **current** four-equal-card markup in `getPluginSettingFiles` and `readMarkup`; full/shared/Node files match GitHub `main`. Live playlist has 537634 visible in row 4.
- MCP `startRefresh` completed with success and valid current four-card source variables, including 11/12 county report history. Re-saving identical `markup_full` and plugin refresh interval 30 did not update the public preview URL version; playlist thumbnail remains `v=1794365923` from the older image. Preview jobs are separate from the persistent plugin-settings image.
- The account's device `75111` still has `last_ping_at=null` and timeline `never_seen` with no recorded check-ins, so physical device delivery remains unverified. TRMNL Help Center states that private plugin settings have a **Force Refresh** action to regenerate the screen; a Safari page reload alone does not invoke backend screen generation. User must try the web UI Force Refresh and confirm the refreshed timestamp. Do not claim this cached image has updated until verified.


## 2026-11-11 — News & Markets playlist visibility repair

- Investigated owner report that Markets screen was not visible in TRMNL. Live plugin `537634` existed, was marked healthy and visible, and `transform.js`, `full.liquid` and `shared.liquid` matched GitHub canonical `main` byte-for-byte.
- Playlist item `903384` had anomalous `row_order=1073741831`. Reordered the complete device `75111` playlist, preserving hidden source dependencies, so the five visible entries now have row orders 0–4 (Home, Weather, Sports, Health, Markets). Confirmed Markets `row_order=4`, `visible=true`, and `state=healthy` in a fresh MCP readback.
- Forced live polling refresh completed successfully, followed by an X-model preview render reporting completion. The device timeline reports **never_seen**, with no recorded hardware check-ins. This does NOT prove physical display; the owner should verify device account/connection when the unit is online. No dashboard code or other screen contents changed.


## 2026-11-10 — Four equal real estate cards and annual trends

- Update merged to canonical `main` via [PR #2](https://github.com/stuartalvey/trmnl/pull/2), squash commit `5b189244`. Latest `main` transform and full Liquid match the healthy live TRMNL instance exactly; playlist remains Home, Weather, Sports, Health, Markets. Physical ePaper display not verified.

- Live `News & Markets Detail` plugin `537634` redesigned with **four equal cards in a single row**: Hamilton County median sold price, days from listing to pending, average inventory, and national Freddie Mac 30-year fixed-rate survey. The former hero card and months-of-inventory card were removed from the display; their original collector fields remain available.
- Each housing card displays the latest official value plus IAR-reported **MoM and YoY percentage changes** (do not derive these from rounded headline values), and a matching county-history sparkline from up to 12 monthly IAR archives. Historical HTML responses are date-validated, and partial coverage is labelled explicitly. Last live collector run returned **11/12 monthly archives**, so cards show `11/12 mo · IAR`, not false `12M` coverage.
- Mortgage card uses the latest national **weekly** Freddie Mac/FRED rate, point differences versus about four weeks and one year earlier (`4W` and `1Y`), and about 12 months of observed weekly-rate history. These rate deltas are percentage **points**, not relative %.
- Financial cards retain the correct **previous-trading-close** daily change (BTC 24h) while 12M sparklines use separate weekly Yahoo Chart histories for S&P 500, LLY, and BTC-USD. On source failure, each chart falls back to a correctly labelled shorter trend, never an invented annual chart.
- News card titles now allow up to four lines at smaller text size. Latest `v2` full-screen preview was visually checked: all four equal cards, financial sparklines and both news headlines per category fit without headline clipping. No other screens changed.
- Mock-source collector regression tests passed for all four card keys, annual history responses, previous-close changes, and missing data. Live refresh succeeded, with matching statuses. Physical ePaper-device display remains unverified.


## News & Markets Detail — first implementation (2026-11-10)

- New private TRMNL instance **537634** created, framework 3.4.6, Node Serverless polling with a small Coinbase JSON seed, 30-minute refresh; playlist item **903384** visible as fifth screen after Health; full X preview validated.
- Source tracked in `views/news-markets/` on canonical `main` (merged PR #1, commit `df7e8cc`), separate from Home, Weather, Sports, and Health.
- Live refresh succeeded: S&P 500 and LLY quotes from Yahoo Chart (daily change using previous close, **not** chart-range starting close); Bitcoin from CoinGecko (24-hour percentage); Hamilton County October 2026 report from Indiana REALTORS; four FRED keyless CSV series including mortgage rate and listing stats; BBC and Google News RSS.
- IAR county report supplies **median SOLD price**, current inventory, sold units, days to pending, and months of supply, distinguished from FRED/Realtor.com **median LISTING price** and listing-based metrics. Freddie Mac 30-year rate is a national weekly survey, not an individualized mortgage quote.
- The Node data collector ran successfully in TRMNL and returned all four FRED series, IAR data, all three quotes, and news; corrected Yahoo daily-change baseline and filtered unrelated politics from real-estate headlines. Synthetic collector checks run in an in-memory harness; a standalone Node test script is versioned. In-memory synthetic validations completed successfully.
- A `v2` full-screen server preview **completed successfully**, revealing initial clipping/quote overlap; the markup was compressed and a second preview confirmed the full news region, all metrics, and the footer fit in 4-bit preview. Physical-device verification remains unavailable.
- The live instance was configured independently and the new playlist item was activated. Other plugin source files and playlist visibility were not modified. A successful repeat live refresh returned all four FRED series, IAR local data, all three quotes, and categorized news. Canonical `main` transform was re-fetched and confirmed identical to the live TRMNL transform after merge. Remaining: physical-device check and long-term source reliability monitoring. No private portfolio data/credentials are involved.


Last compared **2026-11-10**, after News & Markets Detail deployment. Starting documentation
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

- Iterate on Home Page appearance with the owner. Markets/News detail deployed; iterate on its appearance/feeds after physical-device feedback.
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
- Source visibility now follows the dependency inventory below: Oura and
  calendar feeds are hidden; main views remain visible. No unrelated removed
  playlist entries were restored.

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

Ali's raw Companion payload exceeded TRMNL's 100 KB rendering limit. The compact
Node transform in `data-sources/ali-apple-health/transform.js` retains seven local
days of selected daily metrics plus hourly step sums, preserves Health Detail's
metric contract, and omits unrelated render data. Synthetic size/privacy tests pass.

Initial attempts still reported the old oversized payload. During the subsequent
environment audit, `normalization_version: ali-health-v1` was verified in live
processed variables, arrays were compact, and source health was healthy with no
error/count. Recovery is now verified; no fresh-upload claim is made because the
audit cannot distinguish reprocessing from an independent phone upload. Continue
normal Companion syncing for newer data; no phone Health data was deleted.

## Playlist dependency audit

Compared all 15 account plugins with device `75111`'s playlist. Both calendar
instances had been removed; restored **Stu's iCal** `535612` as hidden item
`902150` and **Ali's iCal** `536125` as hidden item
`902151`. Their Home Merge namespaces were still present
before restoration, so removal was not treated as proof of immediate data loss.
Keep source-only dependencies hidden rather than deleting their playlist entries.

The five main views remain visible in order: Home, Weather, Sports, Health, News & Markets.
Welcome remains visible. Existing verse/weather/sports/Oura/Stuart Health/workout
sources remain present and hidden. Ali Health remains visible as configured by
the owner. The unrelated unconfigured BTC item is absent and was not restored.
No other playlist settings, source credentials, or dashboard code were changed.

Ali Health initially reported degraded, then its compacting Node transform
processed successfully. Final inspection reports **all 15 plugin states healthy**,
with no Ali Health error. Source health alone is not a freshness claim
for private phone/Oura data. Physical display verification remains unavailable.

Audit validation: all 12 versioned runtime template/transform files match live
TRMNL exactly. Represented non-secret settings match the reviewed manifests.
The workout helper's encrypted polling-header field is masked/omitted in export
but reported set by the settings API; no header loss was inferred or overwritten.
All four X/full previews rendered and were visually checked. Public polling
feeds were explicitly refreshed after stale snapshots were observed; this does
not force new phone Health uploads or establish measurement freshness.

## 2026-11-15 — iOS Gazette design system adopted (documentation only)

- Owner selected **The iOS Gazette**: Apple-inspired editorial minimalism with a subtle modern-newspaper influence. New [design contract](DESIGN_SYSTEM.md) specifies initial typography, spacing, composition and visualization targets and a staged rollout, starting with News & Markets.
- AGENTS.md now requires ChatGPT/Codex and other agents to use the design contract for future visible layouts. Existing Home, Health, Sports, Weather and News & Markets templates have **not yet been restyled**; no live TRMNL plugins or playlist settings were changed; no new previews or physical-device checks were performed.
- Next: implement and visually validate News & Markets Gazette prototype, refine measured tokens, then migrate remaining core views one at a time.
