# Art 101 · Course stabilization and lesson standard v1
Date: 2026-10-26. Branch: main. Course: ART-101 (grade-independent).
## Non-destructive boundaries
- Keep existing academy/grade-9 URLs and browser storage keys until tested migrations and redirects exist.
- Preserve all existing lesson engines, student work, images, print/export and quizzes. Do not replace live lessons with the skeleton template.
- Existing 80% knowledge + studio policy is an authorization requirement, **not** a certificate issued by static HTML. An authenticated backend and real-browser tests are still outstanding.
- Adult and family enrollment are course entry points, not verified mastery or identity.
## Required visual standard
1. One local, non-scrolling Bazaar Art ticker above the centered header.
2. One upper-right hamburger menu, with ecosystem destinations in a closed dropdown; never inject the full directory below the lesson.
3. Centered course identity, title and footer; readable 16px+ body, responsive 7px-radius cards, restrained navy/parchment/gold.
4. Original professional instructional illustration(s), descriptive alt text and a meaningful guided analysis. Confirm file paths and loading in a browser.
5. Five progressively disclosed stages: observe; research; experiment; create/revise; reflect/archive. An original worked example and substantive studio assignment are mandatory.
6. Source-aware research, 100-point educator rubric, academic evidence metadata, offline/print/export where implemented.
7. Five randomized formative questions from >=15 with locked submitted attempts, 80% practice target, no progression authority.
8. Progression gate must fail closed without authenticated Academy authorization. Do not confuse a link-blocking UI with server authorization.
## Audit baseline
19 lessons, seven unit landing pages under academy/grade-9. Known recurring drift: /assets/vnv-beta-link.js and https://vervenveda.com/assets/vnv-beta-link.js reappear after edits. Both can inject unwanted ecosystem content. An independent repair must identify the upstream insertion source; hiding it in CSS is insufficient.
## Adoption process
1. Pre-audit a page, record its SHA and test existing controls.
2. Migrate only presentation shell and authoring structure; retain all functional IDs, scripts and storage keys.
3. Validate heading and footer alignment, one menu, one ticker, no injected directory, images load, no horizontal overflow.
4. Test fresh attempt, submit, answer lock, retake, reload, export, print and two fictional learner records.
5. Compare screenshot before/after, check desktop/mobile, commit on main only. Never claim browser certification from source review alone.
## Template
`academy/templates/art101-lesson-template.html` uses `academy/shared/art101-shell-v1.css`. Copy to a real lesson directory and adjust the relative stylesheet path. The sample is an **authoring skeleton**, not a completed lesson or functional assessment.
