# Development, synchronization, and deployment

## What is automatic?

| Direction/component | Verified behavior |
| --- | --- |
| Home Page: TRMNL → GitHub | Automatic GitHub Sync exports saves to root `src/`; `trmnl-sync[bot]` commits and matching live files were verified |
| GitHub → Home Page | **Manual deployment**: use TRMNL's GitHub import or explicitly write the reviewed files through MCP |
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

For visual/data changes, inspect actual merge-variable schemas, verify real
source availability, then inspect an X preview for every modified layout.
Check seven local dates, busy days, NLT text, zero precipitation, missing-data
states, and game times/TBD labels. Never commit private preview data or images.

Optional local/cloud template preview uses
[trmnlp](https://github.com/usetrmnl/trmnlp) and the root [.trmnlp.yml](../.trmnlp.yml).
That config watches `src/` and supplies empty overrides; it does not reproduce
the native calendar and helper merge data. There is no RSpec `tests/` suite in
this repository. Do not treat a fixture-only local preview as live verification.

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
