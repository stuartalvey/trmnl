# The iOS Gazette — TRMNL visual design system

**Status:** v1.2 • adopted and rolled out across the five visible custom screens on 2026-11-15.  
**Device target:** TRMNL X, 1040 × 780 layout canvas scaled to 1872 × 1404 on 4-bit grayscale e-paper.  
**Canonical stylesheet:** [`design/gazette.css`](../design/gazette.css).  
**Reference implementation:** [`views/news-markets/full.liquid`](../views/news-markets/full.liquid) (Market Intelligence).

## 1. The design idea

**Apple-inspired editorial minimalism, interpreted for monochrome e-paper.** Combine the clarity and disciplined hierarchy of iOS with the confidence, distinctive headings and information density of a good modern newspaper. It should feel like a carefully edited daily briefing rather than a series of disconnected framework widgets.

**“The iOS Gazette” is an internal design-system name only. NEVER place the words “iOS Gazette” on a rendered screen.** Keep functional page names: Alvey Command Center, Noblesville Weather, Alvey Sports Center, Alvey Health, Market Intelligence. No ornamental masthead logos, distressed paper effects, faux vintage styling, unnecessary decorative rules, remote fonts, or tiny labels.

### Non-negotiable principles

1. **Hierarchy over decoration:** every screen has a readable page title, meaningful section titles, primary figures, and quiet metadata. Use typography and spacing before cards or fills.
2. **Legible at actual device scale:** design for 1040 × 780, then verify an X-model preview; a browser zoom is not proof of legibility.
3. **Serif for editorial voice; sans-serif for information:** serif on page titles and major section titles; sans-serif for numbers, tables, captions, chart labels, event text, and body copy. Never force a serif onto dense data.
4. **Unboxed by default:** white or near-white background; differentiate sections with alignment, whitespace, hairlines and deliberate typography. Do not bring back gray-tile grids or rounded outline cards unless the grouping actually needs them.
5. **Purposeful whitespace:** preserve easy scanning but don't truncate data or waste whole rows on empty containers. Layout must fit source attribution and relevant status cues.
6. **Consistency without false equivalence:** reuse the same location for comparative KPIs while keeping correct periods and units. Never relabel Bitcoin's 24h change as a stock day or weekly rate changes as MoM.
7. **Trustworthy data visuals:** show what is measured, over the period actually observed. Missing/stale/partial are not zero. Label incomplete trend history, data freshness, and source attribution.
8. **Content-first:** longest plausible headlines, multi-day events, busy sport schedules, empty feeds and old snapshots must remain understandable.
9. **No functional regressions:** redesigns must preserve Liquid logic, data sources, credentials, time zone, chart data, security and playlist scheduling. Treat presentation and data-collector changes as separate tasks.
10. **Same family, not cloned pages:** Home is a family briefing; Weather emphasizes the forecast curve; Sports emphasizes scores/fixtures; Health emphasizes movement/recovery; Markets uses financial comparisons and a news hierarchy.

## 2. Source of truth, inheritance and tokens

The **shared, tracked base style** is [`design/gazette.css`](../design/gazette.css). The four additional custom screens currently embed a verbatim copy inside their `full.liquid`, immediately before the root `.gz` layout. **That embedding is necessary:** the TRMNL plugin settings are independent; a GitHub CSS change does not automatically inject styles into the live account.

Paths that embed the base style:

| Rendered screen | GitHub template | TRMNL plugin setting |
| --- | --- | --- |
| Alvey Command Center | [`src/full.liquid`](../src/full.liquid) | `535610` |
| Noblesville Weather | [`views/weather/full.liquid`](../views/weather/full.liquid) | `536164` |
| Alvey Sports Center | [`views/sports/full.liquid`](../views/sports/full.liquid) | `536256` |
| Alvey Health | [`views/health/full.liquid`](../views/health/full.liquid) | `536354` |
| Market Intelligence | [`views/news-markets/full.liquid`](../views/news-markets/full.liquid) | `537634` |

Market Intelligence's existing `.ig` scoped CSS is the **first reference implementation** and uses its own carefully tuned, compatible spacing and type scale. Do not automatically paste `.gz` onto it or accidentally change its successful headline fitting. Longer-term, a shared generator can replace the duplicated `.gz` CSS only after automated equality and render tests exist; **there is currently no automatic CSS propagation or GitHub-to-TRMNL deployment**.

### Implemented starting scale

All values refer to the **renderer layout** in CSS pixels, not native physical pixels.

| Role | Current rule | Usage |
| --- | --- | --- |
| Page heading | Georgia / Times / serif; ~36px; bold | Functional page name; no system-name branding |
| Major section | Georgia / Times / serif; ~23px; bold | Recovery, PGA Tour, Fantasy Football, Workout consistency |
| Supporting section | Georgia / Times / serif; ~19px; bold | Today's Balance, relevant secondary headings |
| Primary metric | Arial / Helvetica / sans-serif; ~31px; tabular | Steps and current conditions; Markets uses tuned 30–33px |
| Data body | Sans-serif through the TRMNL framework | Calendar events, sports results, news body, supporting information |
| Date and context | Sans-serif ~14px | Small right-hand dateline |
| Label / attribution | Sans-serif ~12–13px | Units, source, freshness, chart captions; do not shrink further without previewing |
| Main rhythm | 8px root spacing, tighter rows as needed | Balance clarity against content fit |
| Separator | 1px light gray, 2px for section breaks | Section/horizontal rules and aligned column boundaries |
| Cards | Transparent, square, no shadow/outer outline | Panels are grouped by white space + faint column dividers |
| Chart strokes | Deliberate thin black/gray, explicit legend and references | Don't change the chart's data or sample window solely for aesthetics |
| Footer | Compact transparent band, hairline top border | Device/time/source status stays visible |

**Font fallback is part of the design:** use renderer-available local serif and sans-serif stacks, no remote font requests. Verify the *actual rendered fallback*, especially for numbers and variable-width text.

## 3. Components and semantics

### Masthead

Page title at upper left in serif; date and small freshness/context at the upper right when appropriate. The line beneath organizes the page; branding stays out. If a page has a hero metric beside its title (Weather), allow that one metric to be large but keep the overall masthead aligned.

### Sections and panels

Use `.gz-section` or `.gz-subsection` for editorial headers, `.gz-major-rule` to separate major workstreams, `.gz-panels` for aligned columns, and `.gz-panel` for clean unboxed sections. Use `.gz-panel--side` or the shared panel-grid divider for subtle internal separation. Avoid framework `outline--muted`, `rounded--large`, and `bg--gray-75` in exposed information containers; preserve gray only when it communicates a real measurement/visual encoding.

### Comparison cards

Whenever a metric also has a history chart, use **label → large value → comparison row → chart → period/source**. Place the comparison row at a stable vertical location across adjacent cards.

- Stocks: **Today ±x%**, compared with previous trading close.
- Bitcoin: **24h ±x%**, rolling 24-hour comparison.
- Hamilton County monthly housing: source-calculated **MoM** and **YoY**.
- National weekly 30-year mortgage survey: **4W** and **1Y**, measured in **percentage points** (`pp`), not relative percent.
- Progress goals/fitness: explicitly distinguish **current snapshot**, **goal line**, and modeled reference curve.

### News hierarchy

Within each World/U.S., Lilly, or Real Estate band, display the **lead story** with a restrained serif initial and higher weight. Separate the second story with a fine divider and **ALSO** label. Keep the full-width copy legible; source/date are secondary, right-aligned when they fit. Do not artificially clamp headlines to fill decorative whitespace.

### Chart integrity

A 12-month sparkline and “Today” change report different periods; both labels must remain visible. Display `11/12 mo` instead of inventing a twelfth data point. A rate chart cannot be interpreted as a house-price history. Weather precipitation shading/line references and Apple Health modeled goal curves must retain their truthful legends and independently observed points.

### Current state and fallbacks

Never convert an unavailable source to a zero or a fake current value. Label delayed quotes, unknown game times, disconnected health sources, stale weather, incomplete training histories and snapshot freshness in plain language. Never embed personal payloads into test fixtures or repository comments.

## 4. Screen-specific standards: the full playlist

### 01 — Alvey Command Center (`535610`)

- Editorial title and dateline; no Gazette masthead label.
- **Scripture pull quote:** daily NLT verse uses an oversized serif first-letter drop cap, modest sans-serif body, quiet reference/translation, and a vertical editorial rule. Preserve the complete source text; avoid fake quotes or invented scripture. Scale long verses modestly without breaking the seven-day view.
- **Readiness:** Stuart/Ali balance remains a compact two-person black/gray donut with raw scores, next to the verse.
- **One agenda visual grammar across Family and Games:** monochrome person/team icon at left, event/matchup **title on first line**, time **below** in lighter sans-serif. The time must never be moved into a leading column for Family events while Sports uses a secondary line.
- **Owner icons:** male silhouette for Stuart (`S`), female silhouette for Ali (`A`), two-person silhouette for shared (`S+A`), calendar/star for the `US Holidays` source (`H`). These owner codes remain in `data-owner` and the underlying merge logic but are **not a visible legend or letter badges**. The SVG definitions belong in `src/shared.liquid` (`agenda_owner_icon`); do not depend on emoji fonts.
- **Seven-day coverage is mandatory:** use fine row rules, compact agenda line-height, shortened weekday labels after Today, and controlled hero height. All seven dates **and the footer** must fit at the X `v2/markup_full` size with real busy-day event counts. Avoid row-hiding as a silent workaround; test the maximum practical live workload and disclose if extraordinarily crowded days exceed the display.
- Preserve exact calendar deduplication, shared-source ownership, cancellation, all-day/multi-day rules, missing-source warnings, game times/TBD and forecast provenance. Styling must not fabricate or remove events.
- Home-specific adjustments to typography/row density may be scoped in a second `<style>` block in `src/full.liquid`. Keep the *embedded canonical* `design/gazette.css` byte-identical to the shared stylesheet so `design/check_gazette.cjs` remains valid.

### 02 — Noblesville Weather (`536164`)

- Functional serif title + dominant current conditions on the same masthead.
- The **seven-day high/low curve is the hero**; grayscale high/low encodings, 0–100% precipitation reference, weather icons and correct daily labels stay intact.
- Below the chart, four **equal unboxed metrics**: sunrise/sunset, hourly estimated UV, wind/gusts/direction, humidity.
- Weather source may return stale dates. Refresh before diagnosing the preview; distinguish source staleness from a style change.
- Missing hourly conditions, precipitation chance, directional values and fresh/current readings must be labelled accurately.

### 03 — Alvey Sports Center (`536256`)

- Five compact, equal team columns with subtle vertical separators; records, standings, latest result and next game stay scannable.
- Treat **PGA Tour** and **Fantasy Football** as two large aligned editorial sections separated by one major rule, not giant rounded outline cards.
- PGA leaderboard rows are separated with faint lines; the next-tournament callout is a quiet continuation, not a gray tile.
- Fantasy APEX and NOB sections are visibly distinct via a fine divider, with score, opponent, projection, win chance and prior outcome preserved; never expose ESPN credentials.
- Live vs final vs offseason must remain correctly labelled.

### 04 — Alvey Health (`536354`)

- Serif page heading; two-column **Daily steps** and **Recovery** regions, then a distinct **Workout consistency** section.
- Keep the modeled time-of-day goal curve, dashed goal reference, real Stuart/Ali snapshots and source-age warnings intact.
- Oura Stuart/Ali three-ring recovery groups are unboxed; low-contrast gray backgrounds are removed. Show unknown/stale scores truthfully.
- Eight-week Protein Social bars retain zero weeks and count partial training sessions where the source logic does.
- No change to Health or Oura data connections merely for visual styling.

### 05 — Market Intelligence (`537634`)

- Existing reference screen; serif **Market Intelligence**, **Financial Markets**, **Hamilton County Real Estate**, with sans-serif metrics.
- 3 market panels + equal 4 housing panels; comparison labels live in consistent rows above 12-month charts.
- World/U.S. and Lilly news remain below financial metrics, housing news beneath housing metrics; no third independent “briefing” section.
- First lead story uses a restrained drop cap; second is separated and identified with **ALSO**.
- This screen's `.ig` CSS is already preview-tuned; preserve its existing semantics and footer fitting.

## 5. Publication process and quality gate

1. Read `README.md`, `AGENTS.md`, `docs/STATUS.md`, this file, relevant source templates, and `docs/DEPLOYMENT.md`.
2. Confirm exact **live versus GitHub** file contents, including current repository SHAs. Do not overwrite a newer independent edit.
3. For changes affecting shared tokens, edit `design/gazette.css` **first**, then synchronize the embedded CSS in Home/Weather/Sports/Health. Check the embedded text matches the canonical CSS byte-for-byte. Keep Market's separate tuned `.ig` styling under explicit review.
4. Preserve data contracts, Liquid loops, source fields and account credentials. Structural HTML changes must be tightly scoped.
5. Run relevant existing tests for any logic changes. For a visual-only change, inspect a live **TRMNL X `v2/markup_full` preview** for every modified page. If a source is stale, refresh it; do not judge a partial historical snapshot as a genuine seven-day forecast.
6. Verify seven Home days, 7-day Weather, 5 teams/2 fantasy leagues, Health chart + Oura + training, and all Market stories/metrics. Stress-test long labels, empty data and footer clipping. Record any coverage limitations rather than implying tests not performed.
7. Commit reviewed source and documentation to GitHub, deploy the matching template to the correct TRMNL private plugin, and re-read live files to confirm matching code. A GitHub commit alone **never** deploys the panel.
8. Report separately: **GitHub committed**, **TRMNL deployed**, **X-model preview verified**, **physical device observed**. A successful preview is not evidence the hardware has checked in.

The platform may warn against custom `<style>` blocks; these warnings are advisory and must be distinguished from a failed render. The framework version remains pinned at 3.4.6. Continue to follow `docs/DEPLOYMENT.md` for rollback and authentication safeguards.

## 6. Future evolution

Prefer a tested stylesheet-injection/build tool over permanent copy/paste CSS duplication. Do not introduce remote runtime CSS dependencies, blindly modify source plugins, or promote a design tweak to a full deployment without the X-model preview gate. Record deviations, decisions and remaining known issues in `docs/DECISIONS.md` and `docs/STATUS.md`.
