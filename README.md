# Alvey Command Center

A personal TRMNL X dashboard combining the family's calendar, Noblesville weather,
favorite teams' games, Oura readiness balance, and an NLT Bible verse in one rolling seven-day view.

This repository is the canonical source of code and shared project context for
both regular ChatGPT and Codex. The live TRMNL account is the running deployment.
**A GitHub commit does not automatically deploy the dashboard.**

## Start here

Read [AGENTS.md](AGENTS.md) and [current status](docs/STATUS.md) before making
changes. Then read the relevant [architecture](docs/ARCHITECTURE.md),
[deployment workflow](docs/DEPLOYMENT.md), and [decision log](docs/DECISIONS.md).

A fresh-chat prompt:

> Work on stuartalvey/trmnl. Read README.md, AGENTS.md, and docs/STATUS.md,
> then inspect the relevant architecture and deployment instructions.
> Check the current GitHub and live TRMNL state before editing.
> Report GitHub commits and TRMNL deployments separately.

Connections and permissions must be available in the new chat; documentation
does not transfer account authorization.

## Implemented today

- **Home Page**, headed **Alvey Command Center**: day/date, family events, games,
  weather icons, Fahrenheit highs/lows, and precipitation probability.
- Native Apple Calendar integration, with all-day and multi-day event handling.
- Noblesville, Indiana forecasts from Open-Meteo.
- Pacers, Colts, Purdue football, Purdue men's basketball, and Butler men's
  basketball schedules from ESPN, with team logos and Eastern start times.
- Daily NLT verse from DailyVerses.
- **Today's Balance**: Stuart/Ali readiness scores and a normalized percentage donut beside the verse.
- Full-screen landscape layout using TRMNL framework **3.4.6**.

Additional detail screens remain planned. See
[STATUS.md](docs/STATUS.md) for priorities and limitations.

## Repository structure

| Path | Purpose |
| --- | --- |
| [src/](src/) | Home Page Liquid templates and exported plugin settings |
| [tests/](tests/) | Synthetic Oura adapter and balance tests; no personal health data |
| [.trmnlp.yml](.trmnlp.yml) | Optional development-preview configuration |
| [data-sources/](data-sources/) | Reviewed helper-plugin manifests and sports processing/tests |
| [AGENTS.md](AGENTS.md) | Standing instructions shared by AI development environments |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Live plugin IDs, data contracts, screen and refresh behavior |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Synchronization, validation, deployment, drift checks, rollback |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Significant decisions and their evidence |
| [docs/STATUS.md](docs/STATUS.md) | Concise handoff and last verified deployment state |

## Working from ChatGPT or Codex

Regular ChatGPT is preferred for planning, targeted edits, configuration, and
troubleshooting; Codex is preferred for complex integrations, tests, refactoring,
and larger changes. These are preferences, not restrictions. The owner uses a
browser-only work device; development tools can run in a cloud environment.

MCP can inspect and edit live TRMNL plugins and request previews. Verified
TRMNL-to-GitHub Sync exports Home Page saves to this repository. GitHub-to-TRMNL
deployment is manual, and helper-plugin changes must be captured explicitly.
Follow [DEPLOYMENT.md](docs/DEPLOYMENT.md) in either environment.

The offline tests require Node.js 20+ and no installed packages:

```sh
node data-sources/indiana-sports/test-transform.cjs
node tests/balance.test.cjs
```

Optional local/cloud template preview uses [trmnlp](https://github.com/usetrmnl/trmnlp).
The current preview config does not populate live Plugin Merge data; it is not a
complete offline reproduction. Keep personal calendar and health data out of
committed fixtures, screenshots, and logs.
