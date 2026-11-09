# Current project status

Last compared **2026-11-09 10:57 EST**, time zone `America/Indiana/Indianapolis`.
Implementation baseline:
[`d4662e3`](https://github.com/stuartalvey/trmnl/commit/d4662e374a608d94e280997ba52633261f019b0d).
This documentation update changes no runtime files and deploys nothing to TRMNL.

## Implemented

- Home Page `535610`, headed **Alvey Command Center**, full-screen landscape.
- Seven-day local-date grid: family events, five favorite teams' games with
  logos/Eastern times, vector weather icons, Fahrenheit highs/lows, precipitation.
- Daily NLT verse and current Noblesville temperature.
- Apple Calendar `535612`; verse/weather/sports helpers `536052`, `536062`,
  `536071`. Home Page, the calendar, and all three helpers were healthy.

## Next work

The owner is connecting separate Oura accounts for Stuart and Ali. Two native
instances appeared during the audit: **Stu's Oura** `536089` (connection healthy)
and **[Copy] Stu's Oura** `536093` (connection degraded at the snapshot time).
The copied instance's intended owner is not yet confirmed. These are operational
connection states, not personal health scores. No Oura data is displayed by
Home Page, and no Oura payload or credentials are stored in this repository.

After confirming each instance's owner and successful connection, inspect the actual readiness schemas
and freshness, then design **Today's Balance**: readiness divided by combined
readiness (hypothetical 90 and 80 → 53% / 47%). Missing/stale/zero scores need a
defined fallback before implementation. The chart is planned, not built.

Separate Weather, Sports, Health, and Markets/News detail screens are also
planned. No additional core views have been implemented.

## GitHub versus live TRMNL

| Item | Last verification |
| --- | --- |
| Home `full.liquid` and `shared.liquid` | Exact match with repository baseline |
| Sports `transform.js` | Exact match with repository baseline |
| Three helper manifests | Every represented setting matches live values |
| Home settings | Match except unset headers/body: repo empty strings, live YAML null |
| Helper export defaults | Additional defaults exist in live exports; manifests are intentionally partial |
| Oura connections | Account setup in progress; no Home Page binding or repository data-source implementation yet |
| GitHub → TRMNL | Manual; no CI/deployment workflow configured |
| TRMNL → GitHub | Automatic export verified for Home Page; helper auto-export not verified |
| Physical device | Record `75111`, `v2`, landscape, 900-second wake, 4-bit render context; no hardware check-in/firmware reported |

There is no detected functional code/configuration drift in the compared
components. This is not a claim of a complete account backup or physical-device
deployment verification. Calendar credentials, account/playlist configuration,
and other integrations are managed in TRMNL.

The playlist retains visible Welcome and Apple Calendar entries and an unrelated
unconfigured BTC recipe entry. Three data helpers are hidden. Nothing was
removed or reconfigured during the audit.

## Validation and known gaps

- Existing offline sports tests and syntax check pass in the cloud environment.
- Documentation links/references and unchanged runtime files are checked for
  this documentation-only update; no new render or live mutation is required.
- No automated deployment or full-layout tests. Local preview has no live merge
  fixtures. Crowded days may trigger row hiding/title clamping.
- Source polling and device waking have independent schedules. NLT daily
  polling does not guarantee a local-midnight change.
- API availability and fresh data still need verification when developing;
  current health alone does not prove every displayed value is current.

## Handoff checklist

Read the linked baseline/status, fetch current GitHub state, inspect affected
live definitions, and reconcile differences before editing. Follow
[DEPLOYMENT.md](DEPLOYMENT.md); record the final commit, actual deployment,
validation, pending work, and any drift here after significant changes.
