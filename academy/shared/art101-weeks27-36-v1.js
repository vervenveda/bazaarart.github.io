/* Art 101 · Weeks 27–36 evidence contract.
 * Local drafts are not authenticated learner records or grades.
 * Preserves the Week 26 schema and independent per-week storage keys. */
(()=>{
'use strict';
const root=document.querySelector('main[data-art101-week]');
if(!root)return;
const unit=Number(root.dataset.unit),week=Number(root.dataset.week);
if(!Number.isInteger(unit)||!Number.isInteger(week)||week<27||week>36)return;
const key='bazaar_art101_u'+String(unit).padStart(2,'0')+'_w'+String(week).padStart(2,'0')+'_evidence_v1';
const ids=['student','date','title','question','vocabulary','tests','atlas','sources','revision','reflection','review'];
const find=id=>document.getElementById(id);
const status=find('status');
let saveTimer=null;
const report=(message,error=false)=>{
 status.textContent=message;
 status.style.borderLeftColor=error?'#a23c34':'#2c7478';
};
function record(){
 return Object.fromEntries(ids.map(id=>[id,find(id).value.slice(0,4000)]));
}
function payload(){
 return {schema:'bazaar-art-evidence',version:1,course:'ART101',unit,week,record:record()};
}
function validate(input){
 if(!input||input.schema!=='bazaar-art-evidence'||input.version!==1||input.course!=='ART101'||input.unit!==unit||input.week!==week)return null;
 if(!input.record||typeof input.record!=='object'||Array.isArray(input.record))return null;
 const fields=Object.create(null);
 for(const id of ids){
   const value=input.record[id];
   if(value===undefined){fields[id]='';continue;}
   if(typeof value!=='string'||value.length>4000)return null;
   fields[id]=value;
 }
 return fields;
}
function writeDraft(message='Saved to this browser. Export a copy for safe transfer.'){
 try{
   localStorage.setItem(key,JSON.stringify(payload()));
   report(message);
   return true;
 }catch{
   report('Browser storage unavailable. Use Export JSON to retain your work; do not close this page yet.',true);
   return false;
 }
}
function scheduleSave(){
 clearTimeout(saveTimer);
 report('Unsaved edit. Saving locally…');
 saveTimer=setTimeout(()=>writeDraft(),320);
}
function download(name,data){
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 const anchor=document.createElement('a');
 anchor.href=url;anchor.download=name;
 document.body.append(anchor);anchor.click();anchor.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1200);
}
find('save').addEventListener('click',()=>{clearTimeout(saveTimer);writeDraft()});
find('export').addEventListener('click',()=>{
 clearTimeout(saveTimer);writeDraft();
 download('art101-unit'+unit+'-week'+week+'-evidence.json',payload());
 report('Evidence JSON export prepared. Keep a private copy; this is not an official transcript.');
});
find('importButton').addEventListener('click',()=>find('importFile').click());
find('importFile').addEventListener('change',async event=>{
 const file=event.target.files?.[0];
 if(!file)return;
 try{
   if(file.size>100000)throw Error('File exceeds 100 KB.');
   const data=JSON.parse(await file.text());
   const next=validate(data);
   if(!next)throw Error('Not an ART101 evidence record for this exact week.');
   if(!confirm('Replace only the current Week '+week+' draft with this validated backup? Other weeks will not change.'))return;
   clearTimeout(saveTimer);
   ids.forEach(id=>{find(id).value=next[id];});
   writeDraft('Week '+week+' evidence imported and saved locally. Check your fields before printing.');
 }catch{
   report('Import rejected. Choose a valid, matching Week '+week+' Art 101 evidence backup.',true);
 }finally{event.target.value='';}
});
find('print').addEventListener('click',()=>{
 clearTimeout(saveTimer);
 writeDraft('Print requested. This draft is not an Academy grade.');
 window.print();
});
ids.forEach(id=>find(id).addEventListener('input',scheduleSave));
try{
 const raw=localStorage.getItem(key);
 if(raw){
   const prior=validate(JSON.parse(raw));
   if(prior){ids.forEach(id=>{find(id).value=prior[id];});report('Existing Week '+week+' draft restored from this browser. Export a backup.');}
   else report('Stored draft did not match this week; no unrelated data were altered.',true);
 }else report('New browser-local draft. Use Export JSON to retain a portable copy.');
}catch{report('Browser storage could not be read. You may write and export without saving locally.',true);}
Object.defineProperty(window,'BazaarArt101Draft',{value:Object.freeze({unit,week,key,exportRecord:()=>payload(),status:()=>status.textContent}),configurable:false});
})();
