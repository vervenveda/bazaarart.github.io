/* Verve N Veda ecosystem menu compatibility loader.
 * The legacy standalone floating Beta widget was retired.
 * Retain this path because the protected Bazaar Art landing page references it.
 * Beta access belongs in the unified ecosystem navigation.
 */
(() => {
  "use strict";
  try {
    if (document.getElementById("vnvEcosystemMenuButton") ||
        document.querySelector('script[data-vnv-ecosystem-menu]')) return;
    const script = document.createElement("script");
    script.src = "https://vervenveda.com/assets/vnv-ecosystem-menu.js";
    script.defer = true;
    script.dataset.vnvEcosystemMenu = "1";
    (document.head || document.documentElement).appendChild(script);
  } catch (_) {
    /* Navigation loader failure must not interrupt the protected page. */
  }
})();
