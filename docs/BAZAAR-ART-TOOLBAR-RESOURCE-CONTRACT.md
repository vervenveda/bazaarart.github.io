# Bazaar Art Lower-Left Toolbar Resource Contract

The lower-left toolbar is the page-context tool surface. The lower-right ecosystem toolbar remains separate.

## Resource families
- Studio & Drawing
- Color & Composition
- Prompts & Inspiration
- Photo & Portfolio
- Learning & Academy
- Calls / Professional Practice
- Music Creation

`assets/bazaar-page-tools.js` is the single configuration owner. Page-local `KhaemenesClassToolsConfigV1` blocks are retired during normalization.

Every managed Bazaar Art HTML page loads exactly one:
- Bazaar page-tools router
- Khaemenes Linguistics translator loader
- VNV language control
- canonical class-tools toolbar

The router selects only resources relevant to the current page path.
