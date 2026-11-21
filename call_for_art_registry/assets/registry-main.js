const DATA={
 opportunities:new URL("../data/opportunities.json",import.meta.url),
 sources:new URL("../data/sources.json",import.meta.url),
 policy:new URL("../data/trust-policy.json",import.meta.url)
};
const STORAGE_KEY="bazaarArtCallRegistryUserV1";
const REVIEW_PREFIX="[CALL REVIEW]";
const SUBMIT_PREFIX="[CALL SUBMISSION]";
const GITHUB_REPO="vervenveda/bazaarart.github.io";
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
let opportunities=[],sources=[],policy={},publicReviews=[];
let user=loadUser();

function loadUser(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{saved:{},status:{},localReviews:[]}}catch{return{saved:{},status:{},localReviews:[]}}}
function saveUser(){localStorage.setItem(STORAGE_KEY,JSON.stringify(user));updateStats()}
async function getJSON(url){const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw new Error("Could not load "+url);return r.json()}
function today(){return new Date().toISOString().slice(0,10)}
function isExpired(o){return !!(o.deadline&&!o.rolling&&o.deadline<today())}
function validity(o){
 if(isExpired(o))return"expired";
 const s=o.verification?.status||"needs-recheck";
 return s;
}
function validityLabel(v){return({"verified-current":"Verified Current","needs-recheck":"Needs Recheck","flagged":"Flagged","expired":"Expired"})[v]||"Needs Recheck"}
function feeText(o){if(o.application_fee===0)return"No application fee";if(Number.isFinite(o.application_fee))return"$"+o.application_fee+" application fee";return o.application_fee_text||"Fee not confirmed"}
function daysUntil(d){if(!d)return null;return Math.ceil((new Date(d+"T23:59:59")-new Date())/86400000)}
function deadlineText(o){if(o.rolling)return"Rolling deadline";if(!o.deadline)return"Deadline not confirmed";const n=daysUntil(o.deadline);if(n<0)return"Expired "+o.deadline;return o.deadline+(n<=14?" · "+n+" days":"")}
function uniqueValues(key){return[...new Set(opportunities.map(o=>o[key]).filter(Boolean))].sort()}
function renderSelect(id,values){const s=$(id);for(const v of values){const op=document.createElement("option");op.value=v;op.textContent=v;s.append(op)}}
function getFiltered(){
 const q=$("#searchInput").value.trim().toLowerCase(),type=$("#typeFilter").value,loc=$("#locationFilter").value,val=$("#validityFilter").value,noFee=$("#noFeeFilter").checked,open=$("#openOnlyFilter").checked;
 let list=opportunities.filter(o=>{
  const hay=[o.title,o.organizer,o.location,o.opportunity_type,o.summary,(o.disciplines||[]).join(" ")].join(" ").toLowerCase();
  if(q&&!hay.includes(q))return false;if(type&&o.opportunity_type!==type)return false;if(loc&&o.location!==loc)return false;if(val&&validity(o)!==val)return false;
  if(noFee&&o.application_fee!==0)return false;if(open&&isExpired(o))return false;return true;
 });
 const sort=$("#sortSelect").value;
 list.sort((a,b)=>{
  if(sort==="title")return a.title.localeCompare(b.title);
  if(sort==="verified")return validity(a).localeCompare(validity(b))||(a.deadline||"9999").localeCompare(b.deadline||"9999");
  if(sort==="newest")return String(b.verification?.checked_at||"").localeCompare(String(a.verification?.checked_at||""));
  return (a.rolling?"9999-12-31":a.deadline||"9999-12-31").localeCompare(b.rolling?"9999-12-31":b.deadline||"9999-12-31");
 });
 return list;
}
function render(){
 const list=getFiltered(),root=$("#opportunityGrid");root.innerHTML="";
 $("#resultSummary").textContent=list.length+" of "+opportunities.length+" opportunities shown";
 $("#emptyState").hidden=!!list.length;
 list.forEach(o=>{
  const v=validity(o),saved=!!user.saved[o.id];
  const card=document.createElement("article");card.className="opportunity-card";
  card.innerHTML=`<p class="eyebrow">${esc(o.opportunity_type||"Opportunity")} · ${esc(o.location||"Location varies")}</p>
   <h3>${esc(o.title)}</h3><p><strong>${esc(o.organizer||"Organizer not confirmed")}</strong></p>
   <div class="badge-row"><span class="badge ${v==="verified-current"?"verified":v==="flagged"?"flagged":v==="expired"?"expired":"recheck"}">${validityLabel(v)}</span><span class="badge">${esc(feeText(o))}</span></div>
   <div class="meta-row"><span class="badge">◷ ${esc(deadlineText(o))}</span>${o.compensation?'<span class="badge">Compensation disclosed</span>':""}</div>
   <p class="summary">${esc(o.summary||"Open the detail panel for eligibility, terms and verification evidence.")}</p>
   <div class="card-actions"><button class="btn btn-charcoal" data-open="${esc(o.id)}">Review Call</button><button class="btn btn-cream" data-save="${esc(o.id)}">${saved?"Saved ✓":"Save"}</button></div>`;
  root.append(card);
 });
 root.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>openOpportunity(b.dataset.open));
 root.querySelectorAll("[data-save]").forEach(b=>b.onclick=()=>toggleSave(b.dataset.save));
 updateStats();
}
function updateStats(){
 $("#statOpen").textContent=opportunities.filter(o=>!isExpired(o)).length;
 $("#statVerified").textContent=opportunities.filter(o=>validity(o)==="verified-current").length;
 $("#statNoFee").textContent=opportunities.filter(o=>!isExpired(o)&&o.application_fee===0).length;
 $("#statSaved").textContent=Object.values(user.saved).filter(Boolean).length;
}
function toggleSave(id){user.saved[id]=!user.saved[id];saveUser();render()}
function checkItem(label,value,required=true){
 let cls="warn",txt="Not confirmed";
 if(value===true){cls="pass";txt="Checked"}
 else if(value===false){cls="fail";txt="Concern / mismatch"}
 else if(!required){cls="warn";txt="Not applicable / not recorded"}
 return `<div class="validation-item ${cls}"><strong>${esc(label)}</strong><span>${txt}</span></div>`;
}
function localReviewsFor(o){return(user.localReviews||[]).filter(r=>r.opportunity_id===o.id||(!r.opportunity_id&&r.organizer===o.organizer))}
function publicReviewsFor(o){return publicReviews.filter(r=>r.opportunity_id===o.id||(!r.opportunity_id&&r.organizer===o.organizer))}
function reviewHTML(r,publicFlag=false){return`<article class="review-card"><strong>${esc(r.experience||"Artist experience")}${r.rating?" · "+esc(r.rating)+"/5":""}</strong><blockquote>${esc(r.remarks||"")}</blockquote><small>${publicFlag?"Public community remark":"Private local remark"}${r.created_at?" · "+esc(r.created_at.slice(0,10)):""}</small></article>`}
function openOpportunity(id){
 const o=opportunities.find(x=>x.id===id);if(!o)return;const v=o.verification||{},community=[...localReviewsFor(o).map(r=>reviewHTML(r)),...publicReviewsFor(o).map(r=>reviewHTML(r,true))].join("");
 $("#opportunityDetail").innerHTML=`<div class="detail-hero"><p>${esc(o.opportunity_type||"Opportunity")}</p><h2>${esc(o.title)}</h2><p>${esc(o.organizer||"Organizer not confirmed")}</p></div>
 <section class="detail-section"><div class="badge-row"><span class="badge ${validity(o)==="verified-current"?"verified":validity(o)==="flagged"?"flagged":validity(o)==="expired"?"expired":"recheck"}">${validityLabel(validity(o))}</span><span class="badge">${esc(feeText(o))}</span><span class="badge">${esc(deadlineText(o))}</span></div></section>
 <section class="detail-section"><h3>Call Details</h3><div class="detail-grid">
  <div class="detail-box"><strong>Location</strong><p>${esc(o.location||"Not confirmed")}</p></div>
  <div class="detail-box"><strong>Eligibility</strong><p>${esc(o.eligibility||"Not confirmed")}</p></div>
  <div class="detail-box"><strong>Compensation / Award</strong><p>${esc(o.compensation||"Not confirmed")}</p></div>
  <div class="detail-box"><strong>Artist Rights / Usage</strong><p>${esc(o.artist_rights_notes||"Not confirmed")}</p></div>
 </div><p>${esc(o.summary||"")}</p>
 <div class="form-actions">${o.official_url?'<a class="btn btn-charcoal" target="_blank" rel="noopener" href="'+esc(o.official_url)+'">Open Official Call</a>':""}${o.discovery_url?'<a class="btn btn-cream" target="_blank" rel="noopener" href="'+esc(o.discovery_url)+'">Open Discovery Source</a>':""}</div></section>
 <section class="detail-section"><h3>Validity Check</h3><p class="review-note">Last checked: ${esc(v.checked_at||"not yet")} · Status is based on evidence below, not user ratings.</p><div class="validation-grid">
 ${checkItem("Official URL checked",v.official_url_checked)}${checkItem("Organizer identity matches",v.organizer_match)}${checkItem("Deadline checked",v.deadline_checked)}${checkItem("Application fee disclosed",v.fee_disclosed)}${checkItem("Compensation disclosed",v.compensation_disclosed)}${checkItem("Artist rights / usage checked",v.rights_checked)}
 </div>${v.notes?'<p>'+esc(v.notes)+'</p>':""}</section>
 <section class="detail-section"><h3>My Application Record</h3><div class="form-actions"><select id="applicationState"><option>Watching</option><option>Preparing</option><option>Submitted</option><option>Accepted</option><option>Declined</option><option>Withdrawn</option><option>Completed / Exhibited</option></select><button class="btn btn-charcoal" id="saveApplicationState">Save Status</button></div></section>
 <section class="detail-section"><h3>Artist Experience Reviews</h3><p>Community remarks are experience reports and may be incomplete or disputed. They do not change the validity badge automatically.</p><div class="review-grid">${community||'<div class="review-note">No artist remarks yet. You can be the first to document an experience.</div>'}</div><div class="form-actions"><button class="btn btn-charcoal" id="leaveReview">Leave a Review</button></div></section>`;
 const state=user.status[id]||"Watching";$("#applicationState").value=state;$("#saveApplicationState").onclick=()=>{user.status[id]=$("#applicationState").value;saveUser()};$("#leaveReview").onclick=()=>openReview(o);
 $("#opportunityDialog").showModal();
}
function openReview(o){
 $("#reviewDialogBody").innerHTML=`<div class="dialog-content"><h2>Review ${esc(o.organizer||o.title)}</h2><p>Keep remarks factual and specific to your experience. Do not include private addresses, phone numbers, medical information or unrelated personal details.</p>
 <form id="reviewForm" class="form-grid"><input type="hidden" name="opportunity_id" value="${esc(o.id)}"><input type="hidden" name="organizer" value="${esc(o.organizer||"")}">
 <label>Experience<select name="experience"><option>Applied</option><option>Accepted / Exhibited</option><option>Commissioned</option><option>Declined</option><option>Withdrew</option><option>Attended event</option><option>Other</option></select></label>
 <label>Rating<select name="rating"><option value="">No rating</option><option value="5">5 — excellent</option><option value="4">4 — good</option><option value="3">3 — mixed</option><option value="2">2 — poor</option><option value="1">1 — serious concerns</option></select></label>
 <label class="full">Remarks<textarea name="remarks" rows="6" required placeholder="Communication, fees, payment, contract terms, artwork handling, exhibition experience, follow-through…"></textarea></label>
 <div class="full form-actions"><button class="btn btn-charcoal" type="submit">Save Private Review</button><button class="btn btn-cream" type="button" id="publishReview">Publish Community Review</button></div></form></div>`;
 const form=$("#reviewForm");form.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(form));d.created_at=new Date().toISOString();user.localReviews.push(d);saveUser();$("#reviewDialog").close();$("#opportunityDialog").close();openOpportunity(o.id)};
 $("#publishReview").onclick=()=>{const d=Object.fromEntries(new FormData(form));if(!d.remarks.trim()){alert("Add remarks before publishing.");return}window.open(publicReviewURL(o,d),"_blank","noopener")};
 $("#reviewDialog").showModal();
}
function publicReviewURL(o,d){
 const title=`${REVIEW_PREFIX} ${o.id} · ${o.organizer||o.title}`;
 const body=`Opportunity-ID: ${o.id}\nOrganizer: ${o.organizer||""}\nExperience: ${d.experience||""}\nRating: ${d.rating||""}\n\nRemarks:\n${d.remarks||""}\n\n---\nCommunity experience report. This remark does not determine registry verification status.`;
 return `https://github.com/${GITHUB_REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}
function parseReviewIssue(i){
 const body=i.body||"";const get=k=>((body.match(new RegExp("^"+k+":\\s*(.*)$","mi"))||[])[1]||"").trim();const remarks=(body.split(/Remarks:\s*/i)[1]||"").split(/\n---/)[0].trim();
 return{opportunity_id:get("Opportunity-ID"),organizer:get("Organizer"),experience:get("Experience"),rating:get("Rating"),remarks,created_at:i.created_at,url:i.html_url};
}
async function loadPublicReviews(){
 try{const r=await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues?state=all&per_page=100&sort=created&direction=desc`,{headers:{Accept:"application/vnd.github+json"}});if(!r.ok)return;const issues=await r.json();publicReviews=issues.filter(i=>!i.pull_request&&i.title?.startsWith(REVIEW_PREFIX)).map(parseReviewIssue)}catch{}
}
function renderSources(){
 const root=$("#sourceGrid");root.innerHTML=sources.map(s=>`<article class="source-card"><h3>${esc(s.name)}</h3><div class="badge-row"><span class="badge">${esc(s.scope||"Artist opportunities")}</span><span class="badge">${esc(s.access||"Access varies")}</span></div><p>${esc(s.notes||"")}</p><a class="btn btn-charcoal" target="_blank" rel="noopener" href="${esc(s.url)}">Open Source</a></article>`).join("")
}
function setupEvents(){
 ["#searchInput","#typeFilter","#locationFilter","#validityFilter","#noFeeFilter","#openOnlyFilter","#sortSelect"].forEach(id=>$(id).addEventListener(id==="#searchInput"?"input":"change",render));
 $("#clearFilters").onclick=()=>{$("#searchInput").value="";$("#typeFilter").value="";$("#locationFilter").value="";$("#validityFilter").value="";$("#noFeeFilter").checked=false;$("#openOnlyFilter").checked=true;render()};
 $("#exportBtn").onclick=exportUser;$("#importInput").onchange=importUser;$("#submitOpportunityBtn").onclick=()=>$("#submitDialog").showModal();
 document.querySelectorAll("[data-close-dialog]").forEach(b=>b.onclick=()=>b.closest("dialog").close());
 $("#submitForm").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));const title=`${SUBMIT_PREFIX} ${d.title}`;const body=`Title: ${d.title}\nOrganizer: ${d.organizer}\nOfficial URL: ${d.url}\nDeadline: ${d.deadline}\nApplication fee: ${d.fee}\nLocation: ${d.location}\n\nNotes:\n${d.notes}\n\n---\nCommunity submission for registry review. Not verified until the registry validity checklist is completed.`;window.open(`https://github.com/${GITHUB_REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`,"_blank","noopener")};
}
function exportUser(){const blob=new Blob([JSON.stringify({schema:"bazaar-art-call-registry-user-records-v1",exported_at:new Date().toISOString(),records:user},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="bazaar-art-call-registry-records.json";a.click();URL.revokeObjectURL(a.href)}
async function importUser(e){const f=e.target.files?.[0];if(!f)return;try{const j=JSON.parse(await f.text());if(!j?.records)throw 0;user=j.records;saveUser();render();alert("Registry records imported.")}catch{alert("That file is not a valid Registry export.")}e.target.value=""}
function moveTranslator(){const m=document.querySelector("#vnvClassToolsToolbar [data-vnv-language-mount]"),l=document.getElementById("vnv-language-switch");if(m&&l&&!m.contains(l))m.append(l)}
async function boot(){
 const [od,sd,pd]=await Promise.all([getJSON(DATA.opportunities),getJSON(DATA.sources),getJSON(DATA.policy)]);opportunities=od.records||[];sources=sd.sources||[];policy=pd;
 window.VNV_TICKER?.autoPopulate?.({label:"Call for Art Registry · Quick Links",max:10,links:[{label:"Registry",href:"#main"},{label:"Sources",href:"#sources"},{label:"Reviews",href:"#reviews"},{label:"Landing Page",href:"call_for_art_registry_landing.html"}]});
 window.VNV_HEADER?.mount?.({title:"Khaemenes Academy",subtitle:"Call for Art Registry · Bazaar Art",icon:"KA",home:"https://vervenveda.com/Khaemenes_Academy.github.io/",actions:[],replaceLegacy:true});
 renderSelect("#typeFilter",uniqueValues("opportunity_type"));renderSelect("#locationFilter",uniqueValues("location"));renderSources();setupEvents();await loadPublicReviews();render();moveTranslator();window.addEventListener("load",moveTranslator,{once:true});setTimeout(moveTranslator,500)
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>boot().catch(console.error),{once:true});else boot().catch(console.error);
