const CONFIG_URL=new URL("../data/registry-config.json",import.meta.url);

async function loadConfig(){
  const response=await fetch(CONFIG_URL,{cache:"no-store"});
  if(!response.ok)throw new Error("Registry config unavailable");
  return response.json();
}

function mountTicker(config){
  window.VNV_TICKER?.autoPopulate?.({
    label:"Call for Art Registry · Quick Links",
    ariaLabel:"Call for Art Registry quick links",
    max:8,
    links:config.tickerLinks
  });
}

function mountHeader(config){
  window.VNV_HEADER?.mount?.({
    title:"Khaemenes Academy",
    subtitle:`${config.registry.name} · ${config.registry.subtitle}`,
    icon:"KA",
    home:"https://vervenveda.com/Khaemenes_Academy.github.io/",
    actions:[],
    replaceLegacy:true
  });
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

function moveTranslatorIntoCanonicalToolbar(){
  const mount=document.querySelector("#vnvClassToolsToolbar [data-vnv-language-mount]");
  const language=document.getElementById("vnv-language-switch");
  if(mount&&language&&!mount.contains(language))mount.append(language);
}

async function boot(){
  const config=await loadConfig();
  mountTicker(config);
  mountHeader(config);
  mountFeatures(config);
  document.querySelectorAll("[data-registry-warning]").forEach(el=>el.textContent=config.registry.warning);
  moveTranslatorIntoCanonicalToolbar();
  window.addEventListener("load",moveTranslatorIntoCanonicalToolbar,{once:true});
  setTimeout(moveTranslatorIntoCanonicalToolbar,500);
}

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",()=>boot().catch(console.error),{once:true});
}else{
  boot().catch(console.error);
}
