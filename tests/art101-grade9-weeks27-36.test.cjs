#!/usr/bin/env node
'use strict';
/* Art 101 new-week topology, content and authority boundary checks.
 * Public instructional source only. No personal student data or network writes. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const pad=n=>String(n).padStart(2,'0');
const unitFor=w=>w<=28?10:w<=31?11:w<=34?12:13;
const weekPath=w=>'academy/grade-9/unit-'+pad(unitFor(w))+'/week-'+pad(w)+'/index.html';
const manifest=[
  [10,'art101-unit10-weeks27-28.json',27,28],
  [11,'art101-unit11-weeks29-31.json',29,31],
  [12,'art101-unit12-weeks32-34.json',32,34],
  [13,'art101-unit13-weeks35-36.json',35,36]
];
function authored(){
 const out=[];
 for(const [unit,file,start,end] of manifest){
   const p='academy/authoring/'+file;
   const data=JSON.parse(read(p));
   assert.equal(data.schema,'bazaar-art101-authored-v1');
   assert.equal(data.unit,unit);
   assert.deepEqual(data.lessons.map(x=>x.week),Array.from({length:end-start+1},(_,i)=>start+i));
   out.push(...data.lessons);
 }
 return out;
}
function questions(html){
 const match=html.match(/<script type="application\/json" id="art101-quiz-bank">([\s\S]*?)<\/script>/);
 assert.ok(match,'missing inline quiz bank');
 return JSON.parse(match[1]);
}
test('Week 27 to 36 pages and Unit 10 to 13 overviews are present',()=>{
 for(let w=27;w<=36;w++)assert.ok(exists(weekPath(w)),weekPath(w));
 for(let u=10;u<=13;u++)assert.ok(exists('academy/grade-9/unit-'+pad(u)+'/index.html'));
 assert.ok(read('academy/grade-9/unit-10/index.html').includes('<title>Art 101 · Unit 10 · Photography and Visual Evidence</title>'));
 for(const w of [27,28]){
   assert.ok(read('academy/grade-9/unit-10/index.html').includes('href="week-'+pad(w)+'/index.html"'));
 }
 for(const u of [11,12,13]){
   const html=read('academy/grade-9/unit-'+pad(u)+'/index.html');
   const weeks=Array.from({length:u===13?2:3},(_,i)=>(u===11?29:u===12?32:35)+i);
   for(const w of weeks)assert.ok(html.includes('href="week-'+pad(w)+'/index.html"'),'missing unit '+u+' route '+w);
 }
});
test('Ten distinct course weeks preserve the approved ART101 teaching structure',()=>{
 const pages=authored();
 assert.equal(pages.length,10);
 const titles=new Set(),study=new Set(),bankIds=new Set();
 for(const x of pages){
   const {unit:u,week:w,title,essential,vocab,worked,stages,assignment,alternative,ethics,diagram,sources,questions:source}=x;
   assert.equal(unitFor(w),u);
   assert.ok(title.length>15&&essential.length>60);
   assert.ok(!titles.has(title));titles.add(title);
   assert.ok(vocab.length>=6&&vocab.every(v=>v.length===2&&v[1].length>55));
   assert.equal(worked.steps.length,4);
   assert.equal(stages.length,5);
   assert.ok(stages.every(v=>v.length>110),'too little staged instruction '+w);
   assert.ok(assignment.length>120&&alternative.length>75&&ethics.length>85);
   assert.equal(diagram.length,3);
   assert.ok(sources.length>=2&&sources.every(pair=>/^https:\/\//.test(pair[1])));
   assert.equal(source.length,15);
   for(const [q,a,b] of source){
     assert.ok(q.length>=16&&a.length>=8&&b.length>=9,'incomplete quiz prompt or answer '+w);
     assert.ok(!study.has(w+':'+q),'duplicate prompt '+w);study.add(w+':'+q);
   }
   const html=read(weekPath(w));
   assert.ok(html.includes('<h1>'+title+'</h1>'));
   assert.ok(html.includes(essential.replaceAll('&','&amp;')));
   assert.ok(html.includes('Original worked example')&&html.includes('Five-stage studio investigation'));
   assert.ok(html.includes('Independent studio assignment')&&html.includes('Academic evidence · Week '+w));
   assert.ok(html.includes('Educator rubric · 100 points'));
   assert.ok(html.includes('not authenticated grades')&&html.includes('not</strong> an Academy authorization'));
   assert.equal((html.match(/<details(?:\s|>)/g)||[]).length,6,'one menu plus five stages '+w);
   assert.equal((html.match(/<figure class="figure">/g)||[]).length,1);
   const bank=questions(html);
   assert.equal(bank.length,15);
   for(const entry of bank){
     assert.match(entry.id,new RegExp('^ART101-U'+pad(u)+'-W'+pad(w)+'-\\d{2}$'));
     assert.ok(!bankIds.has(entry.id));bankIds.add(entry.id);
     assert.equal(entry.choices.length,4);
     assert.equal(new Set(entry.choices).size,4);
     assert.ok(Number.isInteger(entry.answer)&&entry.answer>=0&&entry.answer<4);
     assert.ok(entry.explanation.length>90);
   }
 }
 assert.equal(bankIds.size,150);
});
test('New pages link to existing, real local resources and avoid remote active scripts',()=>{
 for(let w=27;w<=36;w++){
   const page=weekPath(w),html=read(page);
   const tags=[...html.matchAll(/<(?:a|link|script)\b[^>]*\b(?:href|src)="([^"]+)"/g)].map(x=>x[1]);
   for(const href of tags){
     if(href.startsWith('https://'))continue;
     if(href.startsWith('#'))continue;
     const dest=path.posix.normalize(path.posix.join(path.posix.dirname(page),href.split('#')[0]));
     assert.ok(exists(dest),page+' broken local dependency '+href+' -> '+dest);
   }
   const scripts=[...html.matchAll(/<script\b([^>]*)>/g)].map(x=>x[1]);
   assert.equal(scripts.length,3,'one JSON bank and two local scripts');
   assert.ok(!scripts.some(x=>/https?:\/\//.test(x)));
   assert.ok(html.includes('Content-Security-Policy'));
   assert.ok(!html.includes('vnv-beta-link.js'));
   assert.ok(html.includes('data-lesson="ART101-U'+pad(unitFor(w))+'-W'+pad(w)+'"'));
 }
});
test('Evidence remains per-week only and unauthenticated; shared scripts compile',()=>{
 const data=read('academy/shared/art101-weeks27-36-v1.js');
 const quiz=read('academy/shared/formative-assessment-v1.js');
 const css=read('academy/shared/art101-weeks27-36-v1.css');
 assert.doesNotThrow(()=>new vm.Script(data));
 assert.doesNotThrow(()=>new vm.Script(quiz));
 for(const token of ['bazaar_art101_u','_evidence_v1','schema:',"course:'ART101'","unit,week,record:record()",'function validate(input)','input.unit!==unit||input.week!==week',"file.size>100000","localStorage.setItem(key","window.print()"]){
   assert.ok(data.includes(token),'missing safety contract '+token);
 }
 for(const forbidden of ['localStorage.clear(','indexedDB.deleteDatabase(','AcademyCredential','issueCertificate','fetch(']){
   assert.ok(!data.includes(forbidden),'cannot perform privileged or destructive action '+forbidden);
 }
 assert.ok(quiz.includes('slice(0,5)')&&quiz.includes('score>=80'));
 assert.ok(css.includes('font-size:16px')&&css.includes('[hidden]{display:none!important}'));
 for(let w=27;w<=36;w++){
   const page=read(weekPath(w));
   assert.ok(page.includes('../../../shared/art101-weeks27-36-v1.js'));
   assert.ok(page.includes('../../../shared/formative-assessment-v1.js'));
 }
});
test('Existing Weeks 01–26 routes and original evidence engine still exist',()=>{
 const unitWeeks=[[1,[1]],[2,[2,3,4]],[3,[5,6,7]],[4,[8,9,10]],[5,[11,12,13]],[6,[14,15,16]],[7,[17,18,19]],[8,[20,21,22]],[9,[23,24,25]],[10,[26]]];
 for(const [u,weeks] of unitWeeks)for(const w of weeks){
   const p='academy/grade-9/unit-'+pad(u)+'/week-'+pad(w)+'/index.html';
   assert.ok(exists(p),p);
 }
 const old=read('academy/grade-9/unit-10/week-26/index.html');
 assert.ok(old.includes("bazaar_art101_u10_w26_evidence_v1"));
 assert.ok(old.includes('formative-assessment-v1.js'));
});
