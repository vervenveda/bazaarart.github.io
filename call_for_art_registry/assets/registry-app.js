const CONFIG_URL=new URL("../data/registry-config.json",import.meta.url);
async function loadConfig(){
  const response=await fetch(CONFIG_URL,{cache:"no-store"});
  if(!response.ok)throw new Error("Registry config unavailable");
  return response.json();
}
function mountTicker(config){
  if(window.VNV_TICKER?.autoPopulate){
    window.VNV_TICKER.autoPopulate({
      label:"Call for Art Registry Quick Links",
      max:8,
      links:config.tickerLinks
    });
  }
}
function mountHeader(config){
  if(window.VNV_HEADER?.mount){
    window.VNV_HEADER.mount({
      title:"Verve N Veda",
      subtitle:`${config.registry.name} · ${config.registry.subtitle}`,
      icon:"ART",
      home:config.registry.canonicalHome,
      actions:[],
      replaceLegacy:true
    });
  }
}
function mountFeatures(config){
  const root=document.getElementById("featureGrid");
  if(!root)return;
  root.innerHTML=config.features.map(item=>`
    <article class="feature">
      <div class="feature-icon" aria-hidden="true">${item.icon}</div>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <a class="feature-link" href="${item.href}">${item.label}</a>
    </article>`).join("");
}
function bindTools(){
  document.getElementById("topBtn")?.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
  const button=document.getElementById("translateBtn"),panel=document.getElementById("translatePanel");
  button?.addEventListener("click",()=>{
    const open=!panel.hidden;
    panel.hidden=open;
    button.setAttribute("aria-expanded",String(!open));
  });
}
window.googleTranslateElementInit=function(){
  if(window.google?.translate?.TranslateElement){
    new google.translate.TranslateElement(
      {pageLanguage:"en",layout:google.translate.TranslateElement.InlineLayout.SIMPLE,autoDisplay:false},
      "googleTranslateElement"
    );
  }
};
async function boot(){
  const config=await loadConfig();
  mountTicker(config);
  mountHeader(config);
  mountFeatures(config);
  bindTools();
  document.querySelectorAll("[data-registry-warning]").forEach(el=>el.textContent=config.registry.warning);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>boot().catch(console.error),{once:true});
else boot().catch(console.error);
