# The iOS Gazette — TRMNL design system
Version: 0.1 — adopted 2026-11-15. Status: News & Markets Gazette v1 is deployed and X-preview verified; other core views are pending.

## North star
**Apple-inspired editorial minimalism on e-paper.** The product is named **The iOS Gazette**: calm, precise, legible, refined. Blend iOS information hierarchy with the measured rhythm of a modern newspaper. This is **not** a literal retro newspaper: avoid faux newsprint, distressed type, ornamented mastheads, decorative columns, and excessive rules.

## Design principles (priority order)
1. **Legibility at device distance.** Design and QA at TRMNL X's actual rendered layout (1040 × 780 CSS layout scaled to 1872 × 1404 physical pixels), not only a zoomed browser preview.
2. **Strong editorial hierarchy.** One primary message per section. Big meaningful metrics, clear section labels, quiet metadata; never make everything equally prominent.
3. **Whitespace with purpose.** Space establishes grouping and rhythm. Unused space should not crowd charts or force headlines to truncate. Do not fill every pixel merely to eliminate whitespace.
4. **Typography is the interface.** Use one reliable sans-serif family through the TRMNL framework, with optional serif editorial headline accents ONLY after confirming renderer font availability. Never depend on remote fonts. Favor weight, scale, tracking, and alignment over decoration.
5. **Restrained monochrome.** White/near-white canvas, near-black primary text, mid-gray secondary metadata, very light gray supporting surfaces. Check contrast after 4-bit grayscale/dithering.
6. **Fewer boxes, better grouping.** Prefer whitespace, alignment, and hairline separators; reserve cards/fills for genuinely distinct groups or comparisons. Avoid nested outlined cards.
7. **Data visualization with integrity.** Consistent thin lines, measured chart heights, restrained grids, explicit units and comparison windows. Do not invent history or conceal incomplete coverage. Make current value and directional context immediately understandable.
8. **Content-first responsive composition.** Prefer full-width readable headlines and deliberate grids; use truncation only when space is genuinely constrained, with tested worst-case content.
9. **Consistency across screens.** Shared visual tokens, masthead structure, labels, dates, source/freshness conventions, empty/stale states, and footers across Home, Health, Sports, Weather, and News & Markets.
10. **No data regressions.** Visual refactors preserve data sources, Liquid logic, timezone semantics, credentials, subscriptions, playlist settings, and error states unless explicitly scoped.

## Initial tokens — targets, tune via actual X previews
All sizes below refer to CSS/layout pixels in the TRMNL renderer, **not** physical panel pixels. These are starting targets; test and refine before claiming a final specification.

| Role | Initial target | Notes |
| --- | --- | --- |
| Masthead | 30–36px, bold | View title and slim quiet edition/date line |
| Section heading | 19–23px, semibold | Clear section starts; avoid multiple competing heading scales |
| Hero metric | 40–56px, bold/tabular | Only 1–2 dominant values per region |
| Standard KPI | 27–35px, semibold/tabular | Pair with short source/unit labels |
| Body / headline | 17–21px, medium | Aim for complete, readable headlines |
| Caption / source | 13–15px, medium | Never below 12px without visual inspection |
| Spacing scale | 4, 8, 12, 16, 24, 32px | Use tokens, not one-off gaps |
| Hairline separator | 1px, medium-light gray | Use selectively; test rendered contrast |
| Base geometry | 12-column grid | Shared margins, stable baselines, no gratuitous nested borders |
| Chart stroke | 1.5–2.5px | Test dither and antialiasing on actual preview |

Prefer established TRMNL classes when they already satisfy the specification; use scoped custom CSS for precise typography, spacing and chart design. TRMNL's plugin templates are independent: central code in GitHub **does not automatically propagate** into live plugin settings. A separate deployment or build process must explicitly carry shared styles to each screen. Do not introduce such automation without testing.

## Shared visual patterns
- **Masthead:** left-aligned screen title, unobtrusive local date/status right; recurring Gazette identity through spacing and typography, not large logos.
- **Section:** short uppercase or normal-case kicker only if useful; one clear heading; optional horizontal rule when transitioning major topics.
- **Metric:** concise label → large tabular value → adjacent change/units → historical chart where useful; clarify MoM, YoY, 4W/1Y, percent versus percentage points.
- **News:** headlines use generous horizontal width. Source and publication date visually secondary. Do not truncate arbitrarily to create decorative whitespace.
- **Chart:** labels, reference lines and marks are purposeful; sparklines should retain real ranges and accurate missing-data states.
- **Status:** show age/refresh and source failures accurately; a 0 measurement is not missing.
- **Footer:** compact, consistent source attribution / last updated without stealing visual focus.

## Rollout plan (News & Markets v1 completed; other screens pending)
1. Create reference layouts / style prototype for **News & Markets** first; compare current versus Gazette at TRMNL X preview size.
2. Validate headline fitting, market/housing trend readability and current-day deltas, including source outage states.
3. Consolidate proven styles into reusable tracked artifacts or a tested injection/build convention. Avoid duplicating unreviewed CSS across plugins.
4. Apply and verify **Home**, **Weather**, **Sports**, **Health** individually; preserve working functionality.
5. Update this document with *measured final tokens* from successful previews. Only then describe it as implemented.

## Review checklist
- Looks polished at 1040 × 780 layout size and on the resulting X-model preview.
- Clear 3-second information hierarchy; no microtext, accidental clipping, overflowing labels, giant empty cards or gray-on-gray ambiguity.
- Baselines, rhythm, spacings, separators and typography consistent with this document.
- News fits, charts truthfully labeled, no content sacrificed solely for a decorative layout.
- Mock long titles and missing/partial/stale data tested.
- Live deployment, server preview and physical-device check reported **separately**.
- No secrets or personal health/calendar payloads committed.

## Ownership
All ChatGPT, Codex, or other AI changes to visible layouts must follow this specification. Record deliberate deviations and design changes in `docs/DECISIONS.md`. Continue to follow `AGENTS.md` and `docs/DEPLOYMENT.md` for synchronization, testing and deployment.

## First implementation: News & Markets (2026-11-15)

Deployed to TRMNL private plugin `537634`; code in `views/news-markets/full.liquid`. The X-model preview with refreshed 2026-11-15 feed confirmed all six headlines, 3 market panels, 4 equal housing metrics, charts, comparisons, citations and bottom attribution fit. Body uses an explicit Arial/Helvetica/sans-serif stack (no remote fonts), 34px masthead, 22px section headings, 33px market figures, 30px housing figures, 17px news headlines, 12–13px source captions, hairline dividers and unboxed panels. Shared 7px primary vertical rhythm is intentionally compact to tolerate multi-line live news and maintain footer visibility. Treat these as measured v1 values, not yet universal cross-view tokens. Custom scoped CSS is supported in the preview though TRMNL warns that framework classes are generally preferred; no runtime or data logic changed.
