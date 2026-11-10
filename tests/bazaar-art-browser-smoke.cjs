#!/usr/bin/env node
/* Headless browser smoke using only Node.js and an installed Chromium/Chrome.
 * No npm packages; synthetic art only; temporary browser profile deleted.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const http=require('node:http');
const {spawn}=require('node:child_process');

const root=path.resolve(__dirname,'..');
const testPage=process.env.BAZAAR_TEST_PAGE||'tests/bazaar-art-browser-smoke.html';
const successPrefix=process.env.BAZAAR_TEST_PASS||'BAZAAR_BROWSER_PASS:';
const failurePrefix=successPrefix.replace('_PASS:','_FAIL:');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const binary=process.env.BAZAAR_BROWSER||['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(fs.existsSync);
if(!binary)throw Error('Chromium/Chrome is required for browser smoke');
if(typeof WebSocket!=='function')throw Error('Run this test with Node 24+ (built-in WebSocket)');

async function run(){
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'bazaar-browser-'));
  const server=http.createServer((request,response)=>{
    try{
      const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);
      const file=path.resolve(root,'.'+pathname);
      if(!file.startsWith(root+path.sep))throw Error('Invalid file path');
      const body=fs.readFileSync(file);
      response.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':'text/plain; charset=utf-8','Cache-Control':'no-store'});
      response.end(body);
    }catch{response.writeHead(404);response.end('Not found');}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port=server.address().port;
  const url='http://127.0.0.1:'+port+'/'+testPage;
  let chrome,ws;
  try{
    chrome=spawn(binary,[
      '--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
      '--no-first-run','--no-default-browser-check','--remote-debugging-port=0',
      '--remote-allow-origins=*','--user-data-dir='+profile,url
    ],{stdio:'ignore'});
    let debugPort=null;
    const portFile=path.join(profile,'DevToolsActivePort');
    for(let i=0;i<90;i++){
      if(fs.existsSync(portFile)){
        const lines=fs.readFileSync(portFile,'utf8').split('\n');
        debugPort=Number(lines[0]);break;
      }
      if(chrome.exitCode!==null)throw Error('Browser exited before debugging was available');
      await sleep(100);
    }
    if(!debugPort)throw Error('Chrome debugging endpoint not available');
    let target;
    for(let i=0;i<70;i++){
      try{
        const pages=await(await fetch('http://127.0.0.1:'+debugPort+'/json/list')).json();
        target=pages.find(x=>x.type==='page'&&x.url.includes(testPage));
        if(target)break;
      }catch{}
      await sleep(100);
    }
    if(!target)throw Error('Browser test page not opened');
    ws=new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{
      const time=setTimeout(()=>reject(Error('WebSocket connection timed out')),5000);
      ws.addEventListener('open',()=>{clearTimeout(time);resolve();},{once:true});
      ws.addEventListener('error',()=>{clearTimeout(time);reject(Error('Chrome WebSocket failed'));},{once:true});
    });
    let id=0;
    const pending=new Map();
    ws.addEventListener('message',event=>{
      let message;try{message=JSON.parse(String(event.data));}catch{return;}
      if(!message.id)return;
      const callback=pending.get(message.id);
      if(callback){pending.delete(message.id);callback(message);}
    });
    function command(method,params={}){
      return new Promise((resolve,reject)=>{
        const requestId=++id;
        const timer=setTimeout(()=>{pending.delete(requestId);reject(Error(method+' timed out'));},5000);
        pending.set(requestId,value=>{clearTimeout(timer);resolve(value);});
        ws.send(JSON.stringify({id:requestId,method,params}));
      });
    }
    await command('Runtime.enable');
    let latest='';
    for(let tick=0;tick<120;tick++){
      const output=await command('Runtime.evaluate',{
        expression:"document.getElementById('result')?.textContent ?? 'waiting'",
        returnByValue:true
      });
      latest=String(output.result?.result?.value??'waiting');
      if(latest.startsWith(successPrefix)){process.stdout.write(latest+'\n');return;}
      if(latest.startsWith(failurePrefix))throw Error(latest);
      await sleep(200);
    }
    throw Error('Browser smoke timed out: '+latest);
  }finally{
    try{ws?.close();}catch{}
    if(chrome&&chrome.exitCode===null){
      try{chrome.kill('SIGTERM');}catch{}
      await Promise.race([new Promise(resolve=>chrome.once('exit',resolve)),sleep(2500)]);
      if(chrome.exitCode===null){
        try{chrome.kill('SIGKILL');}catch{}
        await Promise.race([new Promise(resolve=>chrome.once('exit',resolve)),sleep(1500)]);
      }
    }
    await new Promise(resolve=>server.close(resolve));
    for(let retry=0;retry<12;retry++){
      try{fs.rmSync(profile,{recursive:true,force:true});break;}
      catch(err){
        if(!['ENOTEMPTY','EBUSY','EACCES'].includes(err.code)||retry===11)throw err;
        await sleep(300);
      }
    }
  }
}
run().catch(err=>{console.error(err.stack||String(err));process.exitCode=1;});
