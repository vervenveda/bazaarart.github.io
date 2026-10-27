# Bazaar Art 101 — 36-week instructional evidence matrix (Phase 1)

Date: 2026-10-27 · Source: GitHub **main** · Audit mode: read-only inspection of the 36 existing lessons. This file records observations and review priorities; **not an educator certification**.

## Baseline and non-destructive boundaries
- Source baseline immediately before this report: `8d07847336c96af9e962c249ed154530cdcbff0e`. The authorized assessment plan is `2535a07e772b1490388c53ecb66f78c689d6e56f`.
- 36 lesson pages exist under `academy/grade-9/unit-01` through `unit-13`; thirteen unit hubs exist. Legacy grade-9 paths remain because Art 101 is proficiency-based and URLs must remain compatible.
- Do not change lesson HTML, existing question IDs, localStorage evidence keys, shared engines, menus, artwork, or learner records as part of this matrix.
- The older creative-arts standard uses a nine-unit proposed map and a 30→10 formative specification; these conflict with the implemented thirteen-unit 15→5 course and need versioned educator approval, not a silent rewrite.

## Definitions and test limits
- **Expandable stages** = source count of HTML `<details>` elements; this count is a structural proxy, not a measurement of educational quality. An accessible lesson may teach stages in ordinary sections.
- **SVG / image elements** = source HTML element counts, not proof of original authorship, accurate content, accessible descriptions, or loaded assets.
- **Quiz** = parsed bank of fifteen unique IDs per weekly page; all 540 records have four choices, in-range integer answer indices, and non-empty explanation fields. These *structural* checks do not verify academic correctness, distractor quality, cognitive depth or runtime shuffle/lock behavior.
- Rubric, save, print and export are **present by source indicators**, not certified through a browser. Week 01 does not match the same Export JSON or rubric text patterns as Weeks 02–36 and requires a separate functional/interface audit.
- Scores and issue priorities are withheld pending close reading by an art educator, user testing, source checking and actual visual inspection.

## Whole-course structural matrix

| Week | Unit | Expandable stages | Inline SVGs | Image elements | Formative bank | Priority observation |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| 01 | 01 | 6 | 2 | 1 | 15/15 | Priority: atypical evidence UI |
| 02 | 02 | 5 | 1 | 1 | 15/15 | Source audit only; instructional review pending |
| 03 | 02 | 5 | 2 | 1 | 15/15 | Source audit only; instructional review pending |
| 04 | 02 | 5 | 1 | 1 | 15/15 | Source audit only; instructional review pending |
| 05 | 03 | 1 | 3 | 0 | 15/15 | Priority: fewer disclosed stages |
| 06 | 03 | 5 | 7 | 1 | 15/15 | Source audit only; instructional review pending |
| 07 | 03 | 3 | 3 | 1 | 15/15 | Source audit only; instructional review pending |
| 08 | 04 | 5 | 2 | 0 | 15/15 | Source audit only; instructional review pending |
| 09 | 04 | 6 | 2 | 1 | 15/15 | Source audit only; instructional review pending |
| 10 | 04 | 7 | 0 | 2 | 15/15 | Image-based demonstration; verify asset and alt |
| 11 | 05 | 6 | 0 | 1 | 15/15 | Image-based demonstration; verify asset and alt |
| 12 | 05 | 6 | 0 | 1 | 15/15 | Image-based demonstration; verify asset and alt |
| 13 | 05 | 7 | 0 | 2 | 15/15 | Image-based demonstration; verify asset and alt |
| 14 | 06 | 6 | 0 | 1 | 15/15 | Image-based demonstration; verify asset and alt |
| 15 | 06 | 6 | 0 | 1 | 15/15 | Image-based demonstration; verify asset and alt |
| 16 | 06 | 6 | 0 | 1 | 15/15 | Image-based demonstration; verify asset and alt |
| 17 | 07 | 6 | 0 | 1 | 15/15 | Image-based demonstration; verify asset and alt |
| 18 | 07 | 6 | 0 | 1 | 15/15 | Image-based demonstration; verify asset and alt |
| 19 | 07 | 7 | 0 | 2 | 15/15 | Image-based demonstration; verify asset and alt |
| 20 | 08 | 5 | 1 | 0 | 15/15 | Source audit only; instructional review pending |
| 21 | 08 | 5 | 1 | 0 | 15/15 | Source audit only; instructional review pending |
| 22 | 08 | 5 | 1 | 0 | 15/15 | Source audit only; instructional review pending |
| 23 | 09 | 5 | 1 | 0 | 15/15 | Source audit only; instructional review pending |
| 24 | 09 | 5 | 1 | 0 | 15/15 | Source audit only; instructional review pending |
| 25 | 09 | 5 | 1 | 0 | 15/15 | Source audit only; instructional review pending |
| 26 | 10 | 5 | 1 | 0 | 15/15 | Source audit only; instructional review pending |
| 27 | 10 | 5 | 1 | 0 | 15/15 | Source audit only; instructional review pending |
| 28 | 10 | 5 | 1 | 0 | 15/15 | Source audit only; instructional review pending |
| 29 | 11 | 5 | 1 | 0 | 15/15 | Source audit only; instructional review pending |
| 30 | 11 | 5 | 1 | 0 | 15/15 | Source audit only; instructional review pending |
| 31 | 11 | 5 | 1 | 0 | 15/15 | Source audit only; instructional review pending |
| 32 | 12 | 5 | 1 | 0 | 15/15 | Source audit only; instructional review pending |
| 33 | 12 | 5 | 1 | 0 | 15/15 | Source audit only; instructional review pending |
| 34 | 12 | 5 | 1 | 0 | 15/15 | Source audit only; instructional review pending |
| 35 | 13 | 5 | 1 | 0 | 15/15 | Source audit only; instructional review pending |
| 36 | 13 | 5 | 1 | 0 | 15/15 | Source audit only; instructional review pending |

## First five surgical investigation bubbles

1. **Week 01 — unusual evidence and studio structure.** The portfolio-building page is unusually extensive and includes interactive cover/catalog functions; its interface is not uniform with later lesson pages. Check save→reload→export→import→print, attachment persistence, labels, all buttons and whether the portfolio entry truly serves beginner needs before altering any markup.
2. **Week 05 — stage presentation inconsistency.** Hue/value/saturation has one disclosure element rather than the prevalent five; however, its page includes original illustrated teaching, a palette laboratory and a studio assignment. Determine whether the five-stage *instructional process* is actually taught; only add missing guidance, without replacing its working tools or design.
3. **Weeks 10–19 — image dependency and accessibility.** These ten lessons have no inline SVG illustrations and depend on one or two image elements. Verify each real asset path, instructional purpose, descriptive alternatives, print readability and offline behavior before prioritizing original images.
4. **Assessment breadth versus integrity.** All 36 banks have fifteen distinct IDs, four choices and non-empty explanations. Review all 540 prompts for accuracy, repetitive answer patterns, misconception diagnosis, cultural care and cognitive level. Confirm the five-question engine's actual behavior by browser tests; do not change its identifiers or stored attempts.
5. **Course certification architecture.** No standalone midterm or final exam file appears under `academy/` in the repository tree. The proposal in `academy/ART101_ASSESSMENT_ARCHITECTURE_REVIEW_2026-10-27.md` is design-only. Draft objective-aligned midterm/final blueprints and an educator-controlled practical assessment before attempting implementation; do not expose final keys in static HTML.

## Required next certification pass — evidence fields by week
Each row still needs educator-inspected entries for: measurable objectives; original teaching depth; primary/secondary art-historical sources; accessible worked visual and alt text; guided investigation; exploration + independent studio + critique/revision; vocabulary used in context; optional tools and paper alternatives; question-bank misconception coverage; authentic artifact; reflection and human review; link integrity; browser save/export/import/print; and 255px/keyboard testing. Mark findings **PASS**, **REPAIR**, or **UNTESTED**, referencing the relevant file/commit and test evidence. Do not convert these outstanding tests into PASS based on source counts alone.

## Phase 1 result
**Source inventory and structural bank checks recorded for all 36 lessons.** Actual art-history fact checking, item validity, live-browser behavior, multi-learner privacy and educator mastery decisions remain **UNTESTED**. **No existing lesson or runtime file changed by this report.**
