# Decision log

Keep entries short. Add a dated entry when architecture or an established design
convention changes; include reasoning, known alternatives, and consequences.
Do not turn proposals into implemented decisions.

Dates below are recording dates. Existing implementation choices were audited
on 2026-11-09; where an original decision date or rationale is unknown, that
uncertainty is stated.

## 2026-11-09 — Shared GitHub context and explicit deployment

**Decision:** GitHub is the canonical code/documentation record across ChatGPT
and Codex. MCP may edit the live account, but work is complete only after the
reviewed state is captured in GitHub and deployment status is explicit.

**Reason:** The owner requested seamless cross-environment development without
repeating project context or overwriting newer work.

**Alternatives:** Conversation-only memory or assuming two-way automatic sync.

**Consequences:** Read current state before edits, compare live files, use
SHA/expected-head checks, and update STATUS.md. No new automation is introduced.

## Recorded 2026-11-09 — Plugin Merge composition

**Decision:** Native Apple Calendar plus separate polling helpers feed one
`plugin_merge` Home Page.

**Reason:** This is the verified existing implementation. Historical rationale
and original decision date were not recorded in the repository.

**Alternatives:** Historical alternatives are unknown; direct per-provider
fetching in the display template is not implemented.

**Consequences:** Keep source instance IDs/namespaces and hidden playlist
dependencies intact. Helpers are not additional core dashboard views.

## Recorded 2026-11-09 — Seven-day visual Home Page

**Decision:** Keep one full-screen landscape Command Center: NLT verse followed
by a local-date grid of family events, games, weather icons, and precipitation.

**Reason:** The owner requested integrated calendar/weather, more visual icons,
and the five teams' games within the same seven-day grid.

**Alternatives:** Earlier iterations used a calendar list and text weather
conditions. Separate detail views remain future work.

**Consequences:** Preserve visual readability and all-day/multi-day handling.
Use framework classes, inline vector weather icons, and dithered team logos.
Framework 3.4.6 is pinned; the original reason for that pin is unknown.

## Recorded 2026-11-09 — Open-Meteo weather helper

**Decision:** Poll Open-Meteo for Noblesville current weather and 14 forecast
days; display seven matching local dates with Fahrenheit units.

**Reason:** The inspected native Weather payload exposed today/tomorrow and
did not supply the required precipitation probability.

**Alternatives:** Native Weather was tried before choosing the custom helper.

**Consequences:** No API key is needed; retain attribution and distinguish
missing forecasts from a genuine 0% precipitation chance.

## Recorded 2026-11-09 — NLT verse through DailyVerses RSS

**Decision:** Use the first item of DailyVerses' NLT RSS feed, polled daily.
Display the reference and NLT text without the former OurManna label.

**Reason:** The owner requested NLT. OurManna supplied NIV; a Bible Gateway NLT
test succeeded from the development environment but was region-blocked from
TRMNL. DailyVerses was verified through TRMNL.

**Alternatives:** OurManna and Bible Gateway were tested.

**Consequences:** Source and displayed translation must remain consistent.
The daily refresh is not a promise of a local-midnight rollover.

## Recorded 2026-11-09 — Node Serverless sports normalization

**Decision:** Fetch five public ESPN team schedules inside a Node Serverless
helper, normalize to seven Eastern calendar days, and refresh hourly.

**Reason:** Full schedules exceeded TRMNL's standard polling payload limit.
The VM returns only the fields required by the dashboard.

**Alternatives:** Direct multi-URL polling was attempted and rejected for size.

**Consequences:** Node must be selected in TRMNL's Serverless browser tab;
the MCP language-change request was explicitly rejected. Keep the small polling
seed, test date/DST/TBD behavior, and show partial/unavailable feed states.
The sports test fixtures are public, fixed historical schedules, not live data.

## 2026-11-09 — Compact Oura balance beside the verse

**Decision:** Add a black/gray readiness donut, percentages, and both raw scores
in a small card beside the NLT verse; preserve the seven-day grid below.

**Reason:** The owner requested an iOS-like simple visual expressing relative
capacity: hypothetical readiness 90/80 becomes 53%/47%.

**Alternatives:** A separate health screen would not meet the requested Home
Page placement. A raw JSON adapter would be preferable if the connected plugin
exposed one; the inspected third-party plugin supplies HTML only.

**Consequences:** Strictly parse the readiness label from escaped inert snapshots.
Require current-day snapshot timestamps within six hours; show neutral/dashes
for missing, stale, malformed, or combined-zero data. The snapshot footer does
not prove the readiness measurement date. Keep raw scores visible, use synthetic
tests only, and revisit the adapter if the provider changes its HTML contract.

## 2026-11-09 — Merge both calendars with source labels

**Decision:** Merge Stuart `535612` and Ali `536125` in the existing Family
column, using small S / A / S+A labels and conservative matching by normalized
title, start/end, all-day flag, and normalized location.

**Reason:** The owner requested one combined calendar, shared-event deduplication,
and an unobtrusive distinction between individual and shared items.

**Alternatives:** Separate columns cost horizontal space. Color-only ownership
would be unclear on grayscale. No stable event UID is exposed; fuzzy title/time
matching risks removing genuinely different events.

**Consequences:** Source membership is not attendance. Minor field differences
can leave duplicates; distinct times/locations remain separate. No upstream
calendar records or settings are changed. Preserve cancellation, multi-day,
missing-source behavior, and verify the seven-day X preview.

### Holiday label refinement, 2026-11-09

The owner requested **H** for the synced holiday calendar. The inspected source
name is `US Holidays`; use it for classification instead of assigning those
events to the account owner or guessing from event titles.

## 2026-11-09 — Standalone Weather Detail

**Decision:** Create Weather Detail `536164` with its own hourly Open-Meteo
polling query, full/shared templates under `views/weather/`, framework 3.4.6,
and a visible playlist entry immediately after Home Page.

**Reason:** The owner requested the next detail view, in the same simple visual
style. Hourly forecast, wind, sunrise/sunset, and UV need more data than Home's
working weather helper supplies.

**Alternatives:** Expand the shared helper and merge it into this page. Independent
polling avoids modifying Home's source contract at the cost of another request.

**Consequences:** Manual capture/deployment for this view; root `src/` remains
Home Page. Show next precipitation probability ≥40% over 24 hourly samples,
explicit incomplete/stale states, eight three-hour checkpoints, and seven days.
No radar, alerts, or exact precipitation onset claim. Validate Liquid with
synthetic data and inspect a full X preview before completion.

## 2026-11-09 — Curve-first Weather Detail and current conditions cards

**Decision:** Replace the hourly checkpoint/daily tile layout with a seven-day
high/low curve, precipitation shading, and four cards for sunrise/sunset,
current-hour estimated UV, current wind, and current humidity.

**Reason:** The owner requested a more visual design like Weather Curve recipe
500572, retaining these four useful metrics for the current time window.

**Alternatives:** Installing the reference as a separate plugin or retaining the
existing tile layout. We inspected its seven-day design and wrote an independent
Liquid/SVG implementation within Weather Detail; no copied recipe code or
additional playlist entry is needed.

**Consequences:** Add hourly UV to the polling query; never substitute daily
maximum UV for current UV. Gap missing chart values, handle flat/negative
forecasts, retain the 24-hour precipitation summary and stale-source warning,
and continue manual GitHub capture. Home Page and playlist order stay intact.

## 2026-11-09 — Direct ESPN Sports Detail, independent of Sites

**Decision:** Build Sports Detail `536256` with five public team feeds, PGA,
and APEX/NOB fantasy fetched directly by a GET-only TRMNL transform. Keep its
source under `views/sports/`, separate from Home and Weather.

**Reason:** The owner explicitly rejected reliance on the Fantasy Parlay site
and accepted storing ESPN credentials in TRMNL password fields.

**Alternatives:** Reuse or extend the Sites backend; host a separate collector.
The site was inspected for request logic but is not a runtime dependency.

**Consequences:** Use separate per-league S2 cookies and optional separate NOB
SWID. Keep cookies out of Git/source/outputs. Check real private schemas before
claiming live support; live score fields differ from finalized totals. Isolate
source failures and show snapshot age. Native async runtime worked without a
manual Node change; verify actual refresh jobs. No fantasy account mutations.

**Design:** Five small team cards above PGA and two large fantasy matchup cards;
PGA's next tournament has its own card. Match the simple grayscale visual style
of Weather Detail, preserve long team names with clamping, and keep projections
and previous results secondary to current scores.

## 2026-11-09 — Symmetric enclosed sports sections and provider odds

**Decision:** Move subtitle beside the title, enclose PGA leaderboard/next event
in one card, and enclose the two nested league panels under Fantasy Football.
Add provider conference/division standings and fantasy win probabilities.

**Reason:** The owner requested less unused space, matching enclosures, a clear
Fantasy header, standings in team cards, and win odds where available.

**Alternatives:** Overall league ranks calculated from records would require
unverified tiebreaks. Use accurately named ESPN conference positions plus known
division summaries; college conferences get their conference record. Display
actual ESPN model probabilities instead of deriving odds from projected scores.

**Consequences:** Four additional public standings fetches per refresh, with
shared feeds and independent schedule fallbacks. Validate probabilities and
preserve zero/missing distinctions. Verify both outer borders and the final
fantasy result row fit above the footer in an X preview.

## 2026-11-09 — Health Detail draft using available sources

**Decision:** Add a Plugin Merge Health Detail with Stuart's daily movement,
both Oura score panels, and an eight-week Protein Social workout heatmap and
weekly bars. Use a separate hidden hourly workout normalization helper.

**Reason:** The owner requested a visual first draft immediately, without waiting
for Ali's Apple Health. The existing public Protein Social API was inspected
and a fresh read verified; it needs no new backend or token.

**Alternatives:** Wait for both phones or fabricate an hourly step baseline.
Neither meets the request. The current Apple Health feed lacks intraday data,
so show honest daily totals and a configurable 10,000-step reference goal.

**Consequences:** Ali's Apple Health remains an explicit pending state. Same-hour
step averages need a later detailed export/history collection workflow. Treat
logged sessions separately from all exercise; preserve missing dates, partial
coverage, Oura freshness, and health-data privacy. Use synthetic tests only.

## 2026-11-09 — Bind Ali's independent Apple Health sync

**Decision:** Keep Ali's new raw webhook payload intact and normalize selected
current-day movement samples in Health Detail's shared script. Keep Stuart's
existing summary feed and the Oura adapters independent.

**Reason:** Ali successfully synced Companion, but her payload schema differs
from Stuart's. A display adapter connects the new data without rewriting either
source or waiting for a full hourly chart implementation.

**Consequences:** Exact sample deduplication and unit validation, nullable fields,
and separate timestamps are required. This is not Apple's cross-device source
reconciliation. No reminders or personal payloads are stored in GitHub; the
intraday baseline remains future work.

## 2026-11-09 — Compact Ali's Companion export in Node

**Decision:** Add an explicit Node transform to Ali's webhook plugin, returning
seven days of daily step/energy/latest resting-HR summaries and compact hourly
step buckets, without unrelated metrics or reminders.

**Reason:** The raw upload exceeded the rendering size limit. Selecting Node
alone did not supply the missing `run(input)` transformation.

**Alternatives:** Repeated health resets or dropping the connection would not
address the payload size. Asking for a smaller phone export would lose useful
history that the selected runtime can summarize.

**Consequences:** Processed source schema becomes compact while preserving the
Health Detail metric contract. Raw source pass-through is superseded. Synthetic
size/bounds/privacy tests are required, and recovery must be confirmed using a
fresh Companion upload rather than a health reset alone.

## 2026-11-10 — Personal markets / local housing / briefing screen

**Decision:** Build a standalone fifth ePaper view, **Alvey Market Intelligence**, with three market tiles (S&P 500 points, LLY USD, BTC USD/24h), Hamilton County real estate statistics and mortgage rates, and three categories of curated news (world/U.S., Eli Lilly, real estate). No personal portfolio value, balances, or identifying financial data.

**Rationale:** Owner requested a screen pertinent to both their investments and their spouse's real-estate work. Free public data can power the display without exposing connected accounts.

**Source selection:** Reviewed native TRMNL Stock Price and several stock/Bitcoin/news recipes; they either lack index support, need keys, render standalone graphics, or don't provide the requested combined composition. Chose a single Node Serverless collector that fetches Yahoo Chart quotes, CoinGecko BTC, public Indiana REALTORS report, FRED CSV (monthly Realtor.com county listing metrics plus weekly Freddie Mac rates), and BBC/Google RSS. FRED was specifically suggested by the owner. This avoids paid API keys and extra visible playlist entries, at the cost of tracking upstream format changes.

**Consequences:** Quotes are not guaranteed real-time; 30-minute screen refresh and provider timestamps are distinct. Never confuse the IAR median sold price with Realtor.com/FRED listing price. Use source-specific date/metric labels. Failed sources remain unavailable instead of fabricated. A GitHub feature branch can be merged only after review; a TRMNL preview is separate from physical screen verification.

**Implementation verification, 2026-11-10:** Live sources returned all three quotes, four FRED datasets, the IAR county report, and categorized RSS headlines. The first X preview overflowed vertically, so card typography and spacing were reduced. The second X preview fit all sections, and the new screen was made visible as playlist item 903384. Physical-device confirmation is still outstanding.

## 2026-11-10 — Equal real estate cards and longer history

**Decision:** Replace the unequal hero/2×2 real-estate section with four equal-width cards: median sold price, days to pending, inventory, and 30-year fixed mortgage. Display IAR's MoM and YoY values for county cards; show 4-week and 1-year mortgage rate deltas in percentage points. Use source-matched rolling year sparklines, independent from the current daily/24h financial changes.

**Reason:** Owner identified unused space and preferred four equally prominent metrics; long-term trend conveys context without replacing current market movement. Headlines previously truncated at two lines.

**Consequences:** Collector fetches up to twelve archived IAR reports for matching actual county figures; missing historical months are labelled. Separate one-year weekly Yahoo chart requests improve market sparklines but add external calls; maintain fallback when unavailable. Preview and test after changes. Headline clamp raised to four lines; ePaper layout remains bounded.

## 2026-11-11 — Contextual headlines within two main sections

**Decision:** Remove the standalone three-column `The Briefing` section; put World/U.S. and Eli Lilly news directly below Financial Markets, and Real Estate news directly below the four Hamilton County cards. Headlines now use wide horizontal rows with right-side publisher/date.

**Reason:** User reported substantial bottom whitespace and wanted headlines to span the screen and stay adjacent to their corresponding market data.

**Consequences:** Exactly two information sections; existing source schema, financial markets, IAR metric card selection and calculations remain unchanged. The latest TRMNL X preview fits all article titles, sources and footer; physical-screen receipt remains unverified.
