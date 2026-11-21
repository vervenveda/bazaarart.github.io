# Call for Art Registry

This folder is the editable Bazaar Art / Verve N Veda Call for Art Registry application.

## File map

- `index.html` — folder entry point; forwards to the landing page.
- `call_for_art_registry_landing.html` — semantic page shell and visible landing-page content.
- `assets/registry.css` — all landing-page presentation and responsive styles.
- `assets/registry-app.js` — page behavior, canonical VNV ticker/header mounting, feature rendering and translator controls.
- `data/registry-config.json` — editable navigation, feature cards, registry paths and verification warning.
- `data/opportunities.json` — reserved source of truth for live opportunity records when the operational registry is built.
- `data/sources.json` — reserved source of truth for discovery sources and source metadata.

## Editing rule

Content/data belongs in `data/` whenever practical. Layout belongs in HTML. Presentation belongs in CSS. Behavior belongs in JavaScript. This keeps the registry easy to edit without reopening one large monolithic HTML file.

## Current status

The landing page is fully split and remains available at its original path.

The operational `call_for_art_registry.html` calendar/tracker application referenced by the landing page does not yet exist in this folder. The next build should create it from the reserved data contracts rather than putting the entire application back into one HTML file.

## Opportunity verification

The registry is a discovery and tracking tool. Students and artists should confirm deadlines, eligibility, fees, compensation, rights, shipping/installation requirements and application rules on the official organizer page before acting.
