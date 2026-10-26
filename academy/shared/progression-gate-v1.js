/* Bazaar Art Academy · guarded progression contract v1
 * This module does NOT issue credentials or mastery. An authenticated Academy
 * authority must install the provider before Week 02 may be marked unlocked.
 * Static HTML is public: this is a visible navigation gate, NOT access control.
 */
(()=>{"use strict";
const POLICY=Object.freeze({course:"ART-101",grade:9,threshold:80,assessment:"G9-U01-W01",next:"G9-U02-W02",version:"1.0.0"});
const box=document.querySelector("[data-bazaar-progression]");
if(!box)return;
const status=box.querySelector("[data-gate-status]"),detail=box.querySelector("[data-gate-detail]");
const link=box.querySelector("[data-gate-next]");
let provider=null;
let refreshing=false;
const clean=s=>String(s??"").slice(0,180);
function render(state,message){
 if(status)status.textContent=state==="allow"?"Week 02 authorized":state==="error"?"Verification unavailable":"Week 02 awaiting authorization";
 if(detail)detail.textContent=message;
 if(link){link.setAttribute("aria-disabled",state==="allow"?"false":"true");link.dataset.gateState=state;link.classList.toggle("bazaar-gate-locked",state!=="allow");}
 box.dataset.gateState=state;
}
render("hold","Your five-question formative practice never grants progression. To proceed, the official Academy workflow must verify 80% or higher on the authorized assessment and approve required original studio evidence.");
async function refresh(){
 if(refreshing)return false;refreshing=true;
 try{
   if(!provider){render("hold","Official progression authority is not connected. You may continue reviewing Week 01 and exporting your artwork evidence.");return false;}
   const response=await provider.verify({course:POLICY.course,grade:POLICY.grade,assessment:POLICY.assessment,next:POLICY.next,minimumScore:POLICY.threshold});
   const valid=response&&response.authorized===true&&response.source==="authenticated-academy"&&response.assessmentId===POLICY.assessment&&response.nextId===POLICY.next&&Number(response.knowledgeScore)>=POLICY.threshold&&Number(response.studioScore)>=POLICY.threshold&&response.evidenceApproved===true&&response.identityVerified===true&&response.expired!==true;
   if(!valid){render("hold","The Academy has not verified both the knowledge and studio evidence requirements for this learner.");return false;}
   render("allow","Academy approval verified for this session. The next-week navigation is enabled.");return true;
 }catch{render("error","Unable to verify the official Academy decision. Access remains pending; no work has been erased.");return false;}
 finally{refreshing=false;}
}
const api=Object.freeze({version:POLICY.version,policy:POLICY,registerAuthority(candidate){
 if(!candidate||candidate.authority!=="authenticated-academy"||typeof candidate.verify!=="function")return false;
 provider=candidate;refresh();return true;
},refresh,status:()=>({state:box.dataset.gateState||"hold",providerConnected:!!provider})});
Object.defineProperty(window,"BazaarArtProgressionGate",{value:api,configurable:false});
box.querySelector("[data-gate-check]")?.addEventListener("click",refresh);
 // Guard every Week 02 link on the Week 01 page, not just the new gate button.
 document.addEventListener("click",event=>{
   const anchor=event.target?.closest?.("a[href]");
   if(!anchor||box.dataset.gateState==="allow")return;
   try{
     const destination=new URL(anchor.href,location.href);
     if(destination.origin!==location.origin)return;
     if(!/\/academy\/grade-9\/unit-02\/week-02\/(?:index\.html)?$/.test(destination.pathname))return;
   }catch{return;}
   event.preventDefault();event.stopImmediatePropagation();
   render("hold","Week 02 navigation is pending official Academy authorization. Your Week 01 practice and artwork evidence remain available.");
 },true);
link?.addEventListener("click",event=>{
 if(box.dataset.gateState==="allow")return;
 event.preventDefault();
 render("hold","Week 02 remains pending official Academy verification. Practice results cannot authorize this action.");
});
window.addEventListener("pageshow",refresh);
})();