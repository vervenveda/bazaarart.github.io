# Repository maintenance and migration notes

## Operating principle

This repository is the public GitHub Pages site for Bazaar Art Zone. Keep it portable: HTML, CSS, and vanilla JavaScript, with no build step required for ordinary edits. Make small, reviewable changes and preserve existing routes and app behavior.

## Source-of-truth map

- `index.html`: public landing page, navigation, cards, and the current main-page behavior.
- `mentor-manifest.json`: provisional machine-readable ecosystem anchor. Its own `mentorNotes` explicitly says it is not a complete inventory of child apps.
- `apps/**` and `classes/**`: individual experiences; treat each as an independently reachable page unless verified otherwise.
- `assets/**`: shared client-side assets, including the Beta Program link widget.
- `.github/workflows/beta-index-coverage.yml` and `.github/workflows/beta-index-rollout.yml`: existing automation that may rewrite HTML pages. Review these before changing script tags, CSP, or index filenames.
- `BETA_INDEX_COVERAGE.md`: generated coverage report; the coverage workflow owns this file.

## STOS preservation and future migration

The future Sovereign Terminal Operating System (STOS) and its secure server backend are a planned migration destination, not the current hosting runtime.

- Preserve STOS-related source, configuration, documentation, schemas, and prototypes wherever they are found, even if their filenames do not include “STOS”.
- Do not delete or rename files based only on naming, apparent age, duplication, or lack of current references.
- Before any cleanup, compare the full repository tree and search file contents; record the candidate and why it is safe to change.
- Keep hosting-specific integration separate from reusable application logic when practical, without adding abstractions that have no immediate purpose.
- Treat the current manifest as provisional. Do not infer that an unlisted app is obsolete or absent.
- A migration should be staged and tested against a verified inventory before any source is moved or retired.

## Security and CSP

The root page currently has inline JavaScript and CSS and uses a CSP that includes `'unsafe-inline'`. This is a known hardening task, not a reason to make an untested one-shot rewrite. First preserve current behavior and test payment widgets, the Beta Program link, navigation, and mobile layouts. Then move inline JavaScript to a same-origin asset and migrate inline style attributes/styles as feasible. Tighten CSP in a separate reviewed change after confirming required Stripe endpoints and any GitHub Actions rewrites.

Do not put secrets in this static repository. A client-side CSP meta tag is not a substitute for server-set security headers, and GitHub Pages does not provide arbitrary response-header configuration from this repository alone.

## Validation

Run the dependency-free smoke checks locally:

```sh
python3 tests/repository_smoke_check.py
```

The checks validate HTML parser readability, duplicate IDs, local asset references, baseline CSP directives on the root page, and JSON syntax for the mentor manifest. Warnings identify known inline-code/CSP work; they are not proof that an application is secure or fully accessible.

## Change discipline

1. Work on a feature branch and keep each change narrowly scoped.
2. Do not remove content or assets without a reference and usage audit.
3. Check existing workflow side effects before editing any `index.html`.
4. Review the pull request diff and CI output before merging.
5. Keep user-facing routes, payment flow, keyboard navigation, reduced-motion behavior, and mobile layout in regression checks.
