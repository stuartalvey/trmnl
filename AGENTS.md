# Shared AI development instructions

These instructions apply to Codex, regular ChatGPT, and other agents working on
this repository, including agents editing TRMNL directly through MCP.

## Before editing

1. Read [README.md](README.md), this file, [docs/STATUS.md](docs/STATUS.md), and
   the relevant architecture, deployment, and decision documentation.
2. Inspect the latest repository state, branch head, and files you will touch.
   Re-read any nested agent instructions if they exist.
3. Treat GitHub as the canonical source of code and project documentation.
   TRMNL is the live deployment; compare both before changing deployed code.
4. Preserve existing functionality unless the user explicitly requests a change.
   Do not let incidental cleanup expand the task.

## Shared editing and synchronization rules

5. Keep documentation aligned with implementation. Update STATUS.md after
   significant work and record architecture/design decisions in DECISIONS.md.
6. Do not overwrite newer changes from another environment. Record the starting
   commit, compare live files, and recheck the branch head and affected live
   files before writing. Reconcile changes; never force-push over another task.
7. Use current file SHAs or an expected-head lease for GitHub updates. If a
   concurrent update rejects a write, fetch and inspect it before retrying.
   Prefer one active writer for a given plugin during deployment.
8. For direct TRMNL edits, capture the reviewed code and non-secret configuration
   in GitHub before declaring the task complete. Verify Home Page Sync output;
   capture helper manifests/transforms manually unless their sync is verified.
9. For GitHub edits, explicitly state whether the change is also deployed.
   Never assume a commit, an exported file, or a preview updates the physical device.
10. Follow [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for validation, deployment,
    drift checks, and rollback. Do not deploy during a documentation-only task.

## Implementation and validation

11. Inspect real merge-variable schemas before coding against a data source;
    do not guess field names or put personal data into examples.
12. Use the pinned TRMNL framework and its layout classes. The platform supplies
    the view wrapper. Keep icons compatible with ePaper: SVG/framework assets,
    no emoji dependencies; dither content images.
13. Keep family events, games, and forecasts aligned by Noblesville local date
    (`America/Indiana/Indianapolis`). Preserve all-day/multi-day semantics,
    missing-data states, TBD times, and incomplete-feed indications.
14. Validate changes before deployment: run relevant existing tests and syntax
    checks; inspect an X-model preview for visual changes. Do not claim an
    unperformed check passed. Documentation-only edits need link/reference and
    unchanged-runtime-file checks, not a new live render.
15. Never commit credentials, API tokens, app-specific passwords, private feed
    URLs, personal calendar/health data, or other secrets. Inspect exports before
    saving them. A masked secret such as `[set]` is not a value to write back.
    Test fixtures contain public sports data or synthetic examples only, never real
    private league, calendar, or health payloads.

## Handoff

16. Summarize completed work, validation, commit SHA, live deployment status,
    synchronization differences, and remaining steps. Distinguish:
    **committed to GitHub**, **configured/deployed in TRMNL**,
    **server preview verified**, and **physical device verified**.
17. Keep STATUS.md concise and factual: implemented features, active work,
    known issues, pending tasks, and the last comparison of GitHub with TRMNL.
    When access is unavailable, record what could not be verified.

The owner may use either interface for any task. A new chat should reconstruct
the project from this repository rather than rely on earlier conversations.
