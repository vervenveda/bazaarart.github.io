/* Bazaar Art Live: isolated, same-origin app-shell cache. No user data or network APIs cached. */
'use strict';
const CACHE_NAME='bazaar-live-shell-v1';
const SHELL_URL=new URL('./index.html',self.location.href).href;
const APP_ROOT=new URL('./',self.location.href).pathname;
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.add(new Request(SHELL_URL,{cache:'reload'}))));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('bazaar-live-shell-')&&key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||request.mode!=='navigate')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin||!(url.pathname===APP_ROOT||url.pathname===APP_ROOT+'index.html'))return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(request);
      if(response.ok&&response.type==='basic'){
        const cache=await caches.open(CACHE_NAME);
        await cache.put(SHELL_URL,response.clone());
      }
      return response;
    }catch(error){
      const cached=await caches.match(SHELL_URL);
      if(cached)return cached;
      throw error;
    }
  })());
});
