#!/usr/bin/env node
/* Art 101 read-only source audit. No dependencies, no student data. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../grade-9');let total=0,errors=0,warnings=0;
for(const unit of fs.readdirSync(root).filter(n=>/^unit-\d+$/.test(n)).sort()){
 const unitPath=path.join(root,unit);
 for(const name of ['index.html',...fs.readdirSync(unitPath).filter(n=>/^week-\d+$/.test(n)).map(n=>n+'/index.html')]){
  const file=path.join(unitPath,name);if(!fs.existsSync(file))continue;total++;
  const s=fs.readFileSync(file,'utf8'),rel=path.relative(root,file);
  const fail=(type,msg)=>{if(type==='ERROR')errors++;else warnings++;console.log(type+' '+rel+' · '+msg)};
  if(/<script\b[^>]*src=["'](?:https:\/\/vervenveda\.com)?\/assets\/vnv-beta-link\.js["']/i.test(s))fail('ERROR','recurring external ecosystem loader');
  if(/<h1\b/gi.test(s)===false)fail('WARN','no H1 heading');
  if(!/<footer\b/i.test(s))fail('WARN','no semantic footer');
  if(/week-\d+/.test(name)&&!/<img\b|<svg\b/i.test(s))fail('WARN','no inline instructional image or SVG (verify other visual formats)');
  if(/week-\d+/.test(name)&&!/formative-assessment-v1\.js/.test(s))fail('WARN','shared formative engine not referenced');
  const imgs=[...s.matchAll(/<img\b[^>]*src=["']([^"']+)["']/gi)].map(x=>x[1]);
  for(const src of imgs){if(src.startsWith('./')&&!fs.existsSync(path.resolve(path.dirname(file),src)))fail('ERROR','missing image '+src)}
 }
}
console.log('Art 101 audit: '+total+' pages; '+errors+' errors; '+warnings+' warnings.');
process.exitCode=errors?1:0;
