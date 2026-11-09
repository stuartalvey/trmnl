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
