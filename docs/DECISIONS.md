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
