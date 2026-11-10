# Development, synchronization, and deployment

## What is automatic?

| Direction/component | Verified behavior |
| --- | --- |
| Home Page: TRMNL → GitHub | Automatic GitHub Sync exports saves to root `src/`; `trmnl-sync[bot]` commits and matching live files were verified |
| GitHub → Home Page | **Manual deployment**: use TRMNL's GitHub import or explicitly write the reviewed files through MCP |
| Sports Detail ↔ GitHub | Manual capture/deployment of `views/sports/`; never export saved credentials |
| Weather Detail ↔ GitHub | Manual capture/deployment of `views/weather/`; automatic sync is not verified |
| Helper data sources ↔ GitHub | Manifests and sports transform were captured manually; automatic synchronization is not verified |
| Tests/deployment from GitHub Actions | None: no `.github/workflows/` files exist |
| Rendered image → physical device | Device downloads content on its wake/playlist schedule; a commit or preview is not proof of display |

TRMNL Sync may debounce saves; wait for export and inspect the resulting commit
rather than assuming an immediate update. See
[GitHub Sync](https://help.trmnl.com/en/articles/15977899-github-sync).

## Start a task in either interface

1. Read README.md, AGENTS.md, STATUS.md, and relevant architecture/decisions.
2. Fetch the current branch head and the files you will change. Record the
   starting SHA; use a branch/PR for larger work when useful.
3. Read the affected live plugin files/settings through MCP and compare them
   with GitHub. Source IDs and mappings are in [ARCHITECTURE.md](ARCHITECTURE.md).
4. Reconcile differences first. GitHub is canonical, but an older GitHub file
   must not overwrite newer live work from another environment.
5. Recheck affected files and the branch head before writing. Use current file
   SHAs or an expected-head lease. If another writer intervened, inspect and
   reconcile their changes instead of force-pushing or blindly retrying.

Regular ChatGPT is preferred for targeted edits/configuration; Codex for larger
engineering tasks. Either may perform either workflow. A cloud workspace can
run development tools for the browser-only owner.

## Validate the intended change

For sports logic, run the existing offline suite and syntax check:

```sh
node --check data-sources/indiana-sports/transform.js
node data-sources/indiana-sports/test-transform.cjs
```

The test uses public fixtures and a fixed November 2026 clock. Nine fixture games
is an assertion about those fixtures, not today's live game count.

For the Oura adapter/calculation, run `node tests/balance.test.cjs`. It executes
the production shared script with synthetic HTML and a fixed clock, covering
rounding, bounds, missing data, and snapshot freshness. Never add real scores.

For calendar merging, test the production Liquid sections with synthetic events.
LiquidJS 10 is a test-only dependency; install it in a temporary directory:

```sh
npm install --prefix /tmp/trmnl-test-deps liquidjs@10 --no-audit --no-fund
NODE_PATH=/tmp/trmnl-test-deps/node_modules node tests/calendar.test.cjs
NODE_PATH=/tmp/trmnl-test-deps/node_modules node tests/weather.test.cjs
```

Weather tests execute full/shared Liquid with synthetic forecasts: seven-day temperature/precipitation paths, gap handling, flat/negative forecasts,
current-hour UV selection, 24-hour precipitation threshold/window, zero values,
and stale/missing-data states.

Calendar tests cover matching, individual/shared labels, cancellations, all-day and
multi-day boundaries, and missing feeds. LiquidJS preserves input time zones;
TRMNL's actual renderer still needs an X preview. Never add personal events.

For visual/data changes, inspect actual merge-variable schemas, verify real
source availability, then inspect an X preview for every modified layout.
Check seven local dates, busy days, NLT text, zero precipitation, missing-data
states, and game times/TBD labels. Never commit private preview data or images.

Optional local/cloud template preview uses
[trmnlp](https://github.com/usetrmnl/trmnlp) and the root [.trmnlp.yml](../.trmnlp.yml).
That config watches `src/` and supplies empty overrides; it does not reproduce
the native calendar and helper merge data. There is no RSpec suite; `tests/` contains Node tests (the calendar suite requires LiquidJS). Do not treat a fixture-only local preview as live verification.

For documentation-only tasks, validate links/references and confirm runtime
files are unchanged. Do not edit, refresh, or render the live dashboard just to
validate documentation.

## Deploy a GitHub change manually

1. Confirm the intended changes are committed and deployment is within the
   user's task. Inspect the live state again before overwriting anything.
2. For Home Page, either import the reviewed root plugin through its GitHub Sync
   interface, or write only the changed files through MCP:
   - `src/shared.liquid` → `535610`, `markup_shared`.
   - `src/full.liquid` → `535610`, `markup_full`.
   - `src/settings.yml` → reviewed, non-secret settings for `535610`.
3. Deploy source changes separately to the correct helper ID. The files under
   `data-sources/` are partial manifests, not a single root import package.
   Map sports `transform.js` to `536071`, `transform_js`.
   Preserve settings not represented by the manifest. Never replay masked
   credentials or indiscriminately overwrite secret fields.
4. Deploy/configure dependencies before templates that require them. If sports
   Node mode is missing, the owner must select **Edit Markup → Serverless → Node**
   in TRMNL; MCP cannot switch the language.
5. Refresh changed polling helpers, then poll the returned job IDs to completion.
   Validate output fields and source health before previewing Home Page.
6. Preview Home Page with `device_model: v2`, `size: markup_full`; inspect the
   rendered image. Refresh its rendered screen when deployment calls for it.
   Respect rate/render limits rather than repeatedly retrying rejected requests.
7. Re-read live files/settings, verify the expected versions, and check GitHub
   Sync output. Record deployment, preview, and device verification separately
   in STATUS.md. Hardware verification requires an actual device check-in/display
   check; this project has not established one.

No CI job, deploy script, or automatic repository-to-TRMNL rollout is configured.

## Handle direct ChatGPT/Codex MCP edits

Perform the same initial comparison and validation. After a live change:

- Verify Home Page's export in GitHub; inspect the actual file contents and
  commit, not only a successful MCP response.
- Capture changed helper manifests/transforms explicitly after inspecting their
  live definitions. Save only reviewed code and non-secret configuration.
- Fetch the latest head before committing; preserve other environments' updates.
- Update STATUS.md and any affected architecture/decisions.
- Report GitHub commit SHA and the deployed plugin(s), preview result, and any
  remaining device/synchronization checks.

## Detect drift

Read live exports into a temporary comparison area, not directly over a working
checkout. Do not save raw calendar/health payloads or secret-bearing exports.

| Compare | Method |
| --- | --- |
| Home templates | Exact text of live `full.liquid`/`shared.liquid` versus `src/` |
| Sports code | Exact text of live `transform.js` versus the sports source file |
| Configuration | Parse YAML and compare each documented key to the corresponding live setting |
| Playlist/device | Inspect source visibility/membership, model, orientation, wake interval, and time zone |
| Integrations | Confirm IDs, strategies, Node language, URLs, and source health; do not publish credentials |

Helper exports include defaults omitted from their partial manifests.
Home Page currently exports unset `polling_headers`/`polling_body` as YAML null,
while GitHub records empty strings. Record that representation difference; do not
treat it as a functional change or generalize it to real secret values.
Record unexplained differences in STATUS.md; do not silently choose a winner.

## Roll back

Retrieve the last known-good files from GitHub history and review their diff
against both current GitHub and live TRMNL. Revert only the affected change;
preserve newer unrelated work and avoid resetting/force-pushing the branch.

Commit the reviewed rollback and deploy it explicitly using the same procedure
above. A Git revert alone does not roll back TRMNL. Refresh/preview as needed,
verify live files again, and update STATUS.md. Calendar/Oura credentials cannot
be reconstructed from this public repository; reconnect them in TRMNL if needed.

## Deploy or roll back Weather Detail

Target **536164**, never Home **535610**. Files:

- [views/weather/full.liquid](../views/weather/full.liquid) → `markup_full`.
- [views/weather/shared.liquid](../views/weather/shared.liquid) → `markup_shared`.
- [views/weather/settings.yml](../views/weather/settings.yml) → reviewed polling
  URL, GET, framework 3.4.6, light/normal padding, hourly refresh. Preserve unknown
  live fields and never replay masked credentials.

Inspect live files and current GitHub first. Run the weather Liquid suite, write
changed files/settings through MCP, refresh polling and await its job, inspect
root current/hourly/daily fields, then preview `v2` / `markup_full`. Confirm all
seven day labels, both temperature curves, precipitation shading/percentages,
and all four current-condition cards fit above the title bar. Verify that UV
uses the current hourly estimate rather than the daily maximum.
Read back live files and explicitly capture changes here: Home's automatic root
export does not establish synchronization for this separate plugin.

Playlist item `901626` is visible immediately after Home. Preserve unrelated
items and schedules. For rollback, restore reviewed prior view files and deploy
them explicitly; to withdraw only the new view, hide that playlist item. Leave
Home and its hidden weather helper intact. A Git revert alone does not deploy.

## Sports Detail deployment and credentials

Target `536256`; source/manifest are [views/sports/](../views/sports/).
Map `full.liquid` / `shared.liquid` / `transform.js` to `markup_full` /
`markup_shared` / `transform_js`. The reviewed `settings.yml` is partial;
apply represented settings, preserve unknown live fields and saved form values.
Do not enable GitHub Sync without verifying it excludes credential values.

Tests:

```sh
node --check views/sports/transform.js
node views/sports/test-transform.cjs
NODE_PATH=/tmp/trmnl-test-deps/node_modules node views/sports/test-template.cjs
```

Use the LiquidJS installation instructions above for the template suite. Tests
use synthetic private-league data and cover both credential pairs/isolation,
missing/expired auth, current live versus final scores, projections, bye/inactive,
missing fields, deduplication, date/DST, public team statuses, PGA, and escaping.
Never save real league snapshots, cookies, or preview images in GitHub.

Enter cookies directly in the TRMNL form: APEX ESPN S2/SWID; NOB ESPN S2; optional
NOB SWID (blank reuses APEX SWID). Keep existing keynames when editing the form
so saved values survive. NOB never borrows APEX S2. Change the season explicitly
when needed. The existing secrets in the Sites app are unrelated to this setup.

Write reviewed code, start polling refresh, await completion, inspect sanitized
source statuses/schema, then preview X/full with both connected cards. A saved
transform's inline MCP trial can fail while its actual refresh works; inspect
the refresh job before diagnosing runtime failure. The current default runtime
was verified; a Node selection was not necessary for this new plugin.

Keep item `901764` visible after Weather Detail and preserve other playlist
items. Read back all three source files, confirm GitHub contents, and record
preview separately from physical-device verification. Roll back only affected
Sports Detail files; hiding this item withdraws the screen without touching
Home, Weather, helpers, or ESPN records. A Git revert alone does not deploy.

Sports Detail enclosure checks: ensure PGA and Fantasy outer borders are both
fully visible, the Fantasy Football heading is present, and NOB's previous
result row stays above the footer. Collector tests also cover group standings,
conference/division labeling, probability bounds, null values, and valid 0% odds.

## Health Detail draft deployment

Targets: Health Detail `536354`, Workout Consistency — Data
`536353`. Manifests are partial; never replay saved secret values.

- [views/health/full.liquid](../views/health/full.liquid) → Health `markup_full`.
- [views/health/shared.liquid](../views/health/shared.liquid) → Health `markup_shared`.
- [views/health/settings.yml](../views/health/settings.yml) → Plugin Merge,
  framework/padding, 15-minute refresh, configurable `step_goal` form definition.
- [data-sources/workout-consistency/transform.js](../data-sources/workout-consistency/transform.js)
  → workout helper `transform_js`; its sibling settings record polling seed,
  User-Agent, and hourly refresh. Set a new polling host before adding headers;
  MCP rejects combined host/header changes. No auth header is used here.

```sh
node --check data-sources/workout-consistency/transform.js
NODE_PATH=/tmp/trmnl-test-deps/node_modules node views/health/test-health.cjs
```

Use the LiquidJS 10 install instructions above. Tests use synthetic records and
markup: duplicate/completed/future sessions, local dates/DST, partial coverage,
pagination limits and failures, Oura stale/zero values, and missing-day display.

Deploy dependencies first, refresh/poll the workout job, verify compact status
and eight-week shape, then inspect an X/full Health preview. Verify all panels,
weekday labels, legends, and footer fit. Keep helper `901896`
hidden and Health `901897` visible after Sports. Capture code manually;
never commit live health data or previews. A successful preview does not verify
a physical screen. Roll back these new files/playlist entries independently of
existing source plugins; do not reset the phone's webhook data.

Ali's Health webhook `536547` is now bound to Health Detail through its existing
Merge namespace. Deploy only Health full/shared templates for the raw-sample
adapter; do not replace her source payload, webhook URL, or phone permissions.
The existing health suite additionally tests raw sample bounds, duplicate samples,
energy unit conversion, no-current-day/missing data, and genuine zero steps.
Private data and screenshots must remain outside GitHub.

### Ali Apple Health oversized-payload recovery

Keep `536547` as Webhook with Serverless **Node**. Deploy
[data-sources/ali-apple-health/transform.js](../data-sources/ali-apple-health/transform.js)
as `transform_js`; do not paste a personal export into source or static data.
Run `node data-sources/ali-apple-health/test-transform.cjs` before deployment.
This transform preserves the display's compact `health.metrics` field contract.

After saving, reset plugin health if necessary, then request one fresh sync from
Ali's Companion. A force refresh of the old cached raw variables may still hit
the 100 KB gate, so a reset alone is not proof of recovery. Verify
`normalization_version: ali-health-v1`, bounded metric/hour arrays, source health,
and a Health Detail X preview after the upload. Record whether upload verification
is complete or pending. Never replay raw data or expose webhook credentials.
