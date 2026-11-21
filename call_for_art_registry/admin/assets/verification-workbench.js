const REPO="vervenveda/bazaarart.github.io";
const DATA_URL=new URL("../../data/opportunities.json",import.meta.url);
const POLICY_URL=new URL("../../data/trust-policy.json",import.meta.url);\nconst FRESHNESS_URL=new URL("../../data/freshness-report.json",import.meta.url);
const STORAGE_KEY="bazaarArtVerificationWorkbenchV1";
const SUBMISSION_PREFIX="[CALL SUBMISSION]";
const REQUIRED_CHECKS=["official_url_checked","organizer_match","deadline_checked","fee_disclosed","compensation_disclosed","rights_checked"];
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
let baseData={records:[]},policy={},freshness={counts:{},items:[]},submissions=[],selectedKey=null;
let state=loadState();

function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{drafts:{},log:[]}}catch{return{drafts:{},log:[]}}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderPublishStats();renderAudit()}
async function getJSON(url){const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw new Error("Unable to load "+url);return r.json()}
function today(){return new Date().toISOString().slice(0,10)}
function slug(s){return String(s||"opportunity").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60)||"opportunity"}
function statusOf(r){return state.drafts[keyFor(r)]?.verification?.status||r.verification?.status||"needs-recheck"}
function keyFor(r){return (r._origin||"registry")+":"+(r.id||r._issueNumber||slug(r.title))}
function labelStatus(s){return({"verified-current":"Verified Current","needs-recheck":"Needs Recheck","flagged":"Flagged","expired":"Expired","submission":"Community Submission"})[s]||s}
function parseIssue(i){
 const body=i.body||"";const get=k=>((body.match(new RegExp("^"+k+":\\s*(.*)$","mi"))||[])[1]||"").trim();const notes=(body.split(/Notes:\s*/i)[1]||"").split(/\n---/)[0].trim();
 return{_origin:"submission",_issueNumber:i.number,_issueUrl:i.html_url,id:"submission-"+i.number,title:get("Title")||i.title.replace(SUBMISSION_PREFIX,"").trim(),organizer:get("Organizer"),official_url:get("Official URL"),deadline:get("Deadline"),application_fee_text:get("Application fee"),location:get("Location"),summary:notes,opportunity_type:"Community Submission",rolling:false,verification:{status:"needs-recheck",checked_at:null,notes:"Community submission awaiting verification."}};
}
async function loadSubmissions(){
 try{const r=await fetch(`https://api.github.com/repos/${REPO}/issues?state=open&per_page=100&sort=created&direction=desc`,{headers:{Accept:"application/vnd.github+json"}});if(!r.ok)return[];const issues=await r.json();return issues.filter(i=>!i.pull_request&&i.title?.startsWith(SUBMISSION_PREFIX)).map(parseIssue)}catch{return[]}
}
function allRecords(){return[...(baseData.records||[]).map(x=>({...x,_origin:"registry"})),...submissions]}
function effectiveRecord(r){const d=state.drafts[keyFor(r)];return d?structuredClone(d):structuredClone(r)}
function renderQueue(){
 const q=$("#queueSearch").value.trim().toLowerCase(),f=$("#queueFilter").value;const root=$("#queueList");root.innerHTML="";
 allRecords().filter(r=>{
  const e=effectiveRecord(r),hay=(e.title+" "+e.organizer).toLowerCase();if(q&&!hay.includes(q))return false;
  if(f==="submission")return r._origin==="submission";if(f&&statusOf(r)!==f)return false;return true;
 }).forEach(r=>{
  const e=effectiveRecord(r),s=r._origin==="submission"&&!state.drafts[keyFor(r)]?"submission":statusOf(r);
  const b=document.createElement("button");b.type="button";b.className="queue-item"+(selectedKey===keyFor(r)?" active":"");b.dataset.key=keyFor(r);
  b.innerHTML=`<strong>${esc(e.title)}</strong><small>${esc(e.organizer||"Organizer not entered")}</small><span class="queue-badge ${s==="verified-current"?"verified":s==="flagged"?"flagged":s==="expired"?"expired":""}">${labelStatus(s)}</span>`;
  b.onclick=()=>selectRecord(r);root.append(b);
 });
}
function selectRecord(r){selectedKey=keyFor(r);const e=effectiveRecord(r);$("#emptyReview").hidden=true;$("#reviewForm").hidden=false;fillForm(e,r);renderQueue()}
function boolToSelect(v){return v===true?"true":v===false?"false":""}
function fillForm(r,source){
 $("#recordOrigin").value=source._origin||"registry";$("#recordId").value=r.id||"";$("#title").value=r.title||"";$("#organizer").value=r.organizer||"";$("#opportunityType").value=r.opportunity_type||"";$("#location").value=r.location||"";$("#officialUrl").value=r.official_url||"";$("#discoveryUrl").value=r.discovery_url||"";$("#deadline").value=r.deadline||"";$("#rolling").checked=!!r.rolling;
 $("#applicationFee").value=r.application_fee===0?"0":Number.isFinite(r.application_fee)?String(r.application_fee):(r.application_fee_text||"");$("#compensation").value=r.compensation||"";$("#eligibility").value=r.eligibility||"";$("#rights").value=r.artist_rights_notes||"";$("#summary").value=r.summary||"";
 const v=r.verification||{};document.querySelectorAll("[data-check]").forEach(s=>{s.value=boolToSelect(v[s.dataset.check]);updateCheckRow(s)});document.querySelectorAll("[data-evidence]").forEach(i=>i.value=v.evidence?.[i.dataset.evidence]||"");
 $("#status").value=v.status||"needs-recheck";$("#reviewer").value=v.reviewer||"";$("#checkedAt").value=v.checked_at||today();$("#recheckAt").value=v.recheck_at||"";$("#verificationNotes").value=v.notes||"";$("#changeReason").value="";
 $("#decisionMessage").className="decision-message";$("#decisionMessage").textContent="Draft changes are local until exported.";
}
function readCheckValue(name){const v=document.querySelector(`[data-check="${name}"]`).value;return v==="true"?true:v==="false"?false:null}
function parseFee(value){const t=value.trim();if(/^\$?0(?:\.00)?$/.test(t))return{application_fee:0,application_fee_text:"No application fee"};const m=t.match(/^\$?(\d+(?:\.\d+)?)$/);if(m)return{application_fee:Number(m[1]),application_fee_text:"$"+Number(m[1])+" application fee"};return{application_fee:null,application_fee_text:t||"Fee not confirmed"}}
function collectRecord(){
 const original=allRecords().find(r=>keyFor(r)===selectedKey)||{};const fee=parseFee($("#applicationFee").value);const checks={},evidence={};
 REQUIRED_CHECKS.forEach(k=>{checks[k]=readCheckValue(k);evidence[k]=document.querySelector(`[data-evidence="${k}"]`).value.trim()});
 const id=$("#recordId").value.trim()||slug($("#organizer").value+"-"+$("#title").value+"-"+($("#deadline").value||"open"));
 return{...original,_origin:undefined,_issueNumber:undefined,_issueUrl:undefined,id,title:$("#title").value.trim(),organizer:$("#organizer").value.trim(),opportunity_type:$("#opportunityType").value.trim()||"Opportunity",location:$("#location").value.trim(),official_url:$("#officialUrl").value.trim()||null,discovery_url:$("#discoveryUrl").value.trim()||null,deadline:$("#deadline").value||null,rolling:$("#rolling").checked,...fee,compensation:$("#compensation").value.trim()||null,eligibility:$("#eligibility").value.trim()||"Not confirmed",artist_rights_notes:$("#rights").value.trim()||"Not confirmed",summary:$("#summary").value.trim(),verification:{...checks,status:$("#status").value,checked_at:$("#checkedAt").value||today(),recheck_at:$("#recheckAt").value||null,reviewer:$("#reviewer").value.trim()||"Admin",notes:$("#verificationNotes").value.trim(),evidence}};
}
function verificationReady(r){return REQUIRED_CHECKS.every(k=>r.verification?.[k]===true)&&!!r.official_url&&!!r.organizer&&!!(r.deadline||r.rolling)}
function validateDecision(r){
 if(!r.title||!r.organizer)return"Title and organizer are required.";
 if(r.verification.status==="verified-current"&&!verificationReady(r))return"Verified Current is blocked until every required check passes and official URL, organizer, and deadline/rolling status are present.";
 if(!$("#changeReason").value.trim())return"A change reason is required for the audit log.";
 return"";
}
function updateCheckRow(sel){const row=sel.closest(".validation-row");row.classList.remove("pass","concern","pending");row.classList.add(sel.value==="true"?"pass":sel.value==="false"?"concern":"pending")}
function saveDraft(e){
 e.preventDefault();const r=collectRecord(),error=validateDecision(r),msg=$("#decisionMessage");if(error){msg.textContent=error;msg.className="decision-message error";return}
 const source=allRecords().find(x=>keyFor(x)===selectedKey);const before=source?statusOf(source):"new";const reason=$("#changeReason").value.trim();state.drafts[selectedKey]=r;state.log.unshift({id:r.id,title:r.title,organizer:r.organizer,before,after:r.verification.status,reviewer:r.verification.reviewer,reason,at:new Date().toISOString(),source:selectedKey});
 saveState();msg.textContent="Review draft saved locally.";msg.className="decision-message ok";renderQueue()
}
function resetDraft(){if(!selectedKey)return;delete state.drafts[selectedKey];saveState();const source=allRecords().find(x=>keyFor(x)===selectedKey);if(source)fillForm(source,source);renderQueue()}
function mergedRecords(){
 const map=new Map((baseData.records||[]).map(r=>[r.id,structuredClone(r)]));
 for(const [key,d] of Object.entries(state.drafts)){const isSubmission=key.startsWith("submission:");const clean=structuredClone(d);delete clean._origin;delete clean._issueNumber;delete clean._issueUrl;if(isSubmission||map.has(clean.id))map.set(clean.id,clean)}
 return[...map.values()];
}
function exportPackage(){
 const updated=structuredClone(baseData);updated.version="1.2.0";updated.updated=today();updated.records=mergedRecords();updated.notice="Registry records include explicit verification evidence. Verified Current is fail-closed and requires every required validity check to pass.";
 const pack={schema:"bazaar-art-call-registry-verification-export-v1",exported_at:new Date().toISOString(),opportunities:updated,audit_log:state.log,workbench_drafts:state.drafts};
 const blob=new Blob([JSON.stringify(pack,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="call-for-art-registry-verification-export.json";a.click();URL.revokeObjectURL(a.href)
}
async function importDraft(e){const f=e.target.files?.[0];if(!f)return;try{const j=JSON.parse(await f.text());if(j.schema!=="bazaar-art-call-registry-verification-export-v1")throw 0;state.drafts=j.workbench_drafts||{};state.log=j.audit_log||[];saveState();renderQueue();alert("Workbench draft imported.")}catch{alert("That file is not a valid workbench export.")}e.target.value=""}
function clearWorkbench(){if(!confirm("Clear all local review drafts and the local audit log? The public registry will not be affected."))return;state={drafts:{},log:[]};selectedKey=null;saveState();$("#reviewForm").hidden=true;$("#emptyReview").hidden=false;renderQueue()}
function renderPublishStats(){const ds=Object.values(state.drafts);$("#draftCount").textContent=ds.length;$("#verifiedDraftCount").textContent=ds.filter(d=>d.verification?.status==="verified-current"&&verificationReady(d)).length;$("#logCount").textContent=state.log.length}
function renderAudit(){const root=$("#auditLog");root.innerHTML=state.log.length?state.log.map(x=>`<article class="audit-entry"><header><strong>${esc(x.title)}</strong><small>${esc(x.at.slice(0,19).replace("T"," "))}</small></header><p>${esc(labelStatus(x.before))} → ${esc(labelStatus(x.after))} · ${esc(x.reviewer)}</p><p>${esc(x.reason)}</p></article>`).join(""):'<div class="resource-note">No local review actions yet.</div>'}

function renderFreshness(){
 const c=freshness.counts||{};$("#freshReview").textContent=c.review_queue||0;$("#freshUrgent").textContent=c.urgent||0;$("#freshStale").textContent=c.stale||0;$("#freshLinks").textContent=c.link_issues||0;
 $("#freshMeta").textContent=freshness.generated_at?"Last automated audit: "+freshness.generated_at.replace("T"," ").replace("Z"," UTC"):"Freshness report has not run yet.";
 const root=$("#freshnessList"),items=freshness.items||[];root.innerHTML=items.length?items.slice(0,20).map(x=>`<article class="freshness-item"><div><strong>${esc(x.title)}</strong><small>${esc(x.organizer||"Organizer not recorded")} · ${esc(x.status)} · ${esc(x.priority)}</small></div><ul>${(x.reasons||[]).map(r=>"<li>"+esc(r)+"</li>").join("")}</ul></article>`).join(""):'<div class="resource-note">No automated freshness concerns are currently queued.</div>';
}

function moveTranslator(){const m=document.querySelector("#vnvClassToolsToolbar [data-vnv-language-mount]"),l=document.getElementById("vnv-language-switch");if(m&&l&&!m.contains(l))m.append(l)}
async function boot(){
 [baseData,policy,freshness]=await Promise.all([getJSON(DATA_URL),getJSON(POLICY_URL),getJSON(FRESHNESS_URL).catch(()=>({counts:{},items:[]}))]);submissions=await loadSubmissions();
 window.VNV_TICKER?.autoPopulate?.({label:"Verification Workbench · Quick Links",max:8,links:[{label:"Queue",href:"#main"},{label:"Public Registry",href:"../call_for_art_registry.html"},{label:"GitHub Issues",href:"https://github.com/vervenveda/bazaarart.github.io/issues"}]});
 window.VNV_HEADER?.mount?.({title:"Khaemenes Academy",subtitle:"Call for Art Verification Workbench",icon:"KA",home:"https://vervenveda.com/Khaemenes_Academy.github.io/",actions:[],replaceLegacy:true});
 $("#queueSearch").addEventListener("input",renderQueue);$("#queueFilter").addEventListener("change",renderQueue);$("#refreshQueue").onclick=async()=>{submissions=await loadSubmissions();renderQueue()};$("#reviewForm").addEventListener("submit",saveDraft);$("#resetDraft").onclick=resetDraft;document.querySelectorAll("[data-check]").forEach(s=>s.addEventListener("change",()=>updateCheckRow(s)));$("#exportPackage").onclick=exportPackage;$("#importDraft").onchange=importDraft;$("#clearWorkbench").onclick=clearWorkbench;
 renderFreshness();renderQueue();renderPublishStats();renderAudit();moveTranslator();window.addEventListener("load",moveTranslator,{once:true});setTimeout(moveTranslator,500)
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>boot().catch(console.error),{once:true});else boot().catch(console.error);
