# ESPN Fantasy Football API — Codex Sports Detail Handoff

**Prepared:** 2026-11-09  
**Purpose:** Give Codex enough verified historical integration context to build an optional fantasy-football section within the planned TRMNL **Sports Detail** view.  
**Status:** Research/handoff only. No ESPN live request, authentication verification, production integration, or TRMNL deployment was performed as part of this handoff.

## 1. Relevant existing project

This repository already has a **public** ESPN schedule integration in:
- `data-sources/indiana-sports/settings.yml`
- `data-sources/indiana-sports/transform.js`

The existing hidden TRMNL helper is `Indiana Sports — Data` (plugin setting `536071`), used by Home Page `535610` to show Colts, Pacers, Purdue football/basketball, and Butler basketball fixtures. **Do not break or replace this path.**

The proposed Sports Detail view is a *separate planned feature*. Public NFL/NBA/NCAA schedules and private fantasy leagues have different authentication, refresh, and data-handling requirements. The user has not requested deployment in this handoff.

## 2. Historically confirmed fantasy setup

Provider: **ESPN Fantasy Football**, game code `ffl`, 2026 season.

| League | League ID | User team ID | Teams | Historical scoring/waiver notes |
| --- | --- | --- | --- | --- |
| APEX | `244513322` | `7` | 12 | Half-PPR; waiver priority |
| NOB (Benis Boyz) | `35481112` | `3` | 8 | Full-PPR; two-flex roster; FAAB |

Team names are not permanent identifiers: APEX has appeared as **Love Hurts** and **Nabers Know My Name**; NOB has appeared as **Filet Minions**. Resolve actual current team names/ownership from the API rather than hardcoding them.

Historical reference: earlier fantasy-project work used a Python script named `Pasted code.py` (not part of this repository), including the private ESPN connector. Prior sessions reported successful authenticated reads of both leagues, league settings, rosters, schedules, standings, matchups, and free-agent/waiver candidates. **This is historical evidence, not proof the cookies are currently valid or accessible to Codex.**

## 3. API contract / candidate requests

Base endpoint (historically used):

```text
https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/{SEASON}/segments/0/leagues/{LEAGUE_ID}
```

For 2026, substitute `SEASON=2026` and one of the league IDs above.

Previously used ESPN `view` query values:
- `mTeam`: league/team metadata
- `mRoster`: player rosters / player stats context
- `mMatchup`: matchup data
- `mSettings`: league configuration
- `mStandings`: standings
- `mSchedule`: scoring periods / schedule
- `mDraftDetail`: draft detail (historical draft tooling; not necessary for the initial screen)

ESPN API behavior is not guaranteed to remain stable. Verify requested views, response shapes, current scoring period, statuses, and access requirements against **fresh authenticated responses** before implementation. Do not assert these are official versioned endpoints. Keep requests GET-only.

### Authentication — never check secrets into Git

Private league access historically used ESPN session cookies:
- `espn_s2`
- `SWID`

They were provided privately to the fantasy project's earlier collector. Their actual values are **not included here**, and their availability to Codex is **not established**.

Use a secret manager or server-side environment configuration; never put cookies in Liquid, static assets, GitHub files, logged URLs, test fixtures, a publicly accessible TRMNL plugin configuration, or output/commit messages. Do not ask an agent to recover cookie values from chat history or commit historical `Pasted code.py` without rigorous secret removal. Redact request/response diagnostics. If authentication is missing/expired, use an explicit unavailable or manual/demo state rather than implying live sync succeeded.

Recommended private read-only collector:
```text
ESPN private league API
  -> trusted server-side collector (session secrets here only)
  -> minimal sanitized current-week JSON snapshot (access-controlled)
  -> TRMNL data integration / private plugin
  -> Sports Detail Liquid display
```

The trust boundary matters: a public GitHub repository is not a secret store, and a potentially inspectable client/feed URL must not carry ESPN cookies. Assess TRMNL's actual polling/serverless secret storage and output visibility *before* selecting the hosting approach. Prefer a server-side proxy if secure session handling cannot be verified.

## 4. Data model / possible detail screen

Normalize source data into a small schema rather than exposing ESPN's raw nested response to Liquid.

Suggested fields (examples, not verified response properties):
- `fetched_at`, `season`, `scoring_period_id`, `status` (ok/stale/auth_failed/partial/unavailable)
- `leagues[]`: `id`, `name`, `scoring_type`, `user_team_id`, `user_team_name`
- `matchup`: `opponent`, `my_score`, `opponent_score`, `my_projected`, `opponent_projected`, `matchup_status`
- `standings`: `rank`, `wins`, `losses`, `ties`, `points_for`, `points_against`
- `players[]`: `name`, `slot`, `team`, `game_status`, `actual_points`, `projected_points`, `injury_status`
- `next_game` / `last_completed_game` as relevant

For a TRMNL X ePaper Sports Detail, prioritize high-signal, low-density information: both fantasy leagues' current matchup and score/projection, current standing, and a few key players or next deadlines, alongside relevant Colts/Indiana sports information. Preserve timezone `America/Indiana/Indianapolis`, statuses, DST, missing projections, bye weeks, and updates after stat corrections.

This is a **display and informational insights project**. The owner's established fantasy-agent boundary is **read-only advice**: do not submit claims, add/drop players, alter lineups, accept trades, or take other account actions.

## 5. Development checklist for Codex

1. Read root `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md`, and `docs/STATUS.md`.
2. Inspect the existing ESPN public schedule helper and do not disturb it.
3. Decide whether Fantasy belongs on the main Sports Detail screen, a subordinate panel, or its own screen based on actual TRMNL X density/legibility.
4. Establish a safe authenticated collector that does not leak `espn_s2`/`SWID`. If credentials are not available, implement a **sanitized synthetic fixture** and document live activation as blocked.
5. Verify actual 2026 ESPN responses (league ID/team ID, team ownership, scoring settings, week, roster and matchup fields). Do not trust historical team names or week numbers.
6. Implement normalization, cache/freshness controls, partial-source failure handling, and explicitly labeled stale data. A private API failure must not disable public team schedules.
7. Test at least: both leagues; inactive/offseason; missing auth; cookie expiry; unknown player/status; no projection; bye/postponed game; duplicate data; missing fields; DST; empty schedule.
8. Preview against TRMNL X and assess ePaper readability before deploying.
9. Update documentation and decision log, commit source to GitHub, and report GitHub commit and TRMNL deployment status **separately**.

## 6. Sources and verification limitations

This handoff is based on previously captured user-project context and the earlier ESPN fantasy connector/script description. It is not a checked-in implementation, and no live private ESPN call was made in this task. The live GitHub repo's public schedule helper was inspected on 2026-11-09. No sensitive cookies were copied into this document.

**Next action for Codex:** plan and build the Sports Detail feature using this integration contract while verifying every external assumption and maintaining existing screens.

## Implementation update — 2026-11-09

The owner subsequently authorized direct ESPN calls from TRMNL and rejected a
Sites/proxy dependency. Sports Detail `536256` is now implemented under
[views/sports/](../views/sports/); see [ARCHITECTURE.md](ARCHITECTURE.md) and
[STATUS.md](STATUS.md) for the verified current state. Both leagues authenticated
successfully after credentials were entered directly in TRMNL. Separate APEX/NOB
S2 fields are supported; optional NOB SWID falls back to APEX SWID, never its S2.
Fresh responses confirmed `totalPointsLive` / `totalProjectedPointsLive` for active
matchups; finalized results use finalized totals. Historical recommendations
above are retained as provenance and do not override the later owner decision.
No real scores, team names, payloads, or cookies were added to the repository.
