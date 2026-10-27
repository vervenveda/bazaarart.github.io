/* Bazaar Art · shared two-row site header.
   Non-destructive enhancement; keeps every lesson and app engine intact.
   No external runtime libraries. */
(() => {
  "use strict";
  if (document.querySelector(".bazaar-shared-site-header")) return;
  const script = document.currentScript;
  const root = new URL("../", script.src);
  const href = path => new URL(path, root).href;
  const css = document.createElement("style");
  css.id = "bazaar-shared-header-styles";
  css.textContent = `
body > .bazaar-shared-site-header {
  position:relative;z-index:1000;box-sizing:border-box;width:100%;
  flex:0 0 auto;grid-column:1/-1;
  margin:0;padding:0;color:#302537;background:#f7f1e6;
  border-bottom:1px solid #cfc2c4;text-align:left;
  font:400 13px/1.45 "Avenir Next","Segoe UI",Arial,sans-serif;
}
.bazaar-shared-site-header, .bazaar-shared-site-header * {box-sizing:border-box;font-weight:400!important}
.bazaar-shared-site-header a {color:inherit;text-decoration:none}
.bazaar-shared-site-header .ba-top {
  min-height:53px;display:grid;grid-template-columns:minmax(0,1fr) 42px;
  align-items:center;gap:9px;padding:4px 12px;
}
.bazaar-shared-site-header .ba-brand {
  justify-self:start;display:inline-flex;align-items:center;gap:9px;min-width:0;
}
.bazaar-shared-site-header .ba-mark {
  width:33px;height:33px;flex:0 0 33px;display:grid;place-items:center;
  background:#4a2944;color:#fff;border-radius:7px;font:400 19px Georgia,serif;
}
.bazaar-shared-site-header .ba-identity{min-width:0;display:flex;flex-direction:column}
.bazaar-shared-site-header .ba-title {
  font:400 17px/1.15 "Cinzel",Georgia,serif;letter-spacing:.045em;white-space:nowrap;
}
.bazaar-shared-site-header .ba-sub {font-size:10px;letter-spacing:.045em;color:#68616b}
.bazaar-shared-site-header .ba-menu {justify-self:end;position:relative}
.bazaar-shared-site-header .ba-menu summary {
  list-style:none;cursor:pointer;display:grid;place-items:center;
  width:40px;height:40px;border:1px solid #bfb4bd;border-radius:7px;
  background:#fffdf8;color:#302537;font-size:22px;
}
.bazaar-shared-site-header .ba-menu summary::-webkit-details-marker{display:none}
.bazaar-shared-site-header .ba-panel {
  position:absolute;right:0;top:43px;width:min(285px,calc(100vw - 24px));
  max-height:65vh;overflow:auto;display:grid;gap:2px;padding:10px;
  border:1px solid #cfc2c4;border-radius:7px;background:#fffdf8;
  box-shadow:0 12px 35px rgba(38,22,36,.16);z-index:1005
}
.bazaar-shared-site-header .ba-panel a {padding:9px 11px;border-radius:5px}
.bazaar-shared-site-header .ba-panel a:hover,.bazaar-shared-site-header .ba-panel a:focus-visible{background:#eee5ef}
.bazaar-shared-site-header .ba-links {
  min-height:37px;display:flex;justify-content:center;align-items:center;
  gap:clamp(9px,2vw,24px);padding:5px 12px;border-top:1px solid #d8cdd0;
  overflow-x:auto;overflow-y:hidden;white-space:nowrap;scrollbar-width:thin
}
.bazaar-shared-site-header .ba-links a {flex:0 0 auto;font-size:11px;letter-spacing:.05em;text-transform:uppercase}
.bazaar-shared-site-header a:focus-visible,.bazaar-shared-site-header summary:focus-visible {outline:2px solid #4a2944;outline-offset:2px}
@media(max-width:680px){
  .bazaar-shared-site-header .ba-top{padding-inline:9px}
  .bazaar-shared-site-header .ba-links{justify-content:flex-start;gap:14px}
  .bazaar-shared-site-header .ba-title{font-size:15px}
}
`;
  document.head.appendChild(css);
  const nav = document.createElement("div");
  nav.className = "bazaar-shared-site-header";
  nav.setAttribute("role","banner");
  nav.innerHTML = `
  <div class="ba-top">
    <a class="ba-brand" href="${href("index.html")}" aria-label="Bazaar Art home">
      <span class="ba-mark" aria-hidden="true">✦</span>
      <span class="ba-identity"><span class="ba-title">Bazaar Art</span><span class="ba-sub">Creative Academy · Art Studios</span></span>
    </a>
    <details class="ba-menu"><summary aria-label="Open ecosystem directory">☰</summary>
      <nav class="ba-panel" aria-label="Bazaar Art ecosystem directory">
        <a href="${href("index.html")}">Bazaar Art home</a>
        <a href="${href("academy/index.html")}">Creative Academy</a>
        <a href="${href("academy/grade-9/unit-01/index.html")}">Art 101</a>
        <a href="${href("apps/Art_resources_index.html")}">Art resources</a>
        <a href="https://vervenveda.com/Khaemenes_Academy.github.io/">Khaemenes Academy</a>
        <a href="https://vervenveda.com/333.github.io/">333 Network</a>
        <a href="https://vervenveda.com/">Verve N Veda</a>
      </nav>
    </details>
  </div>
  <nav class="ba-links" aria-label="Creative Academy navigation">
    <a href="${href("index.html")}">Art Home</a>
    <a href="${href("academy/index.html")}">Academy</a>
    <a href="${href("academy/grade-9/unit-01/index.html")}">Art 101</a>
    <a href="${href("apps/Art_resources_index.html")}">Resources</a>
    <a href="https://vervenveda.com/333.github.io/">333 Network</a>
  </nav>`;
  document.body.insertBefore(nav, document.body.firstChild);
})();