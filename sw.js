const CACHE='dust-v9-local-stats-20261006';
const ASSETS=['./','./index.html','./artist-tags.html','./ascii-studio.html','./artist-plus.js','./artist-plus.css','./manifest.webmanifest','./favicon-48.png','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('dust-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const response=await fetch(e.request);
      if(response.ok)await cache.put(e.request,response.clone());
      return response;
    }catch(error){
      const saved=await cache.match(e.request);
      if(saved)return saved;
      if(e.request.mode==='navigate'){
        const fallback=await cache.match(url.pathname.endsWith('/ascii-studio.html')?'./ascii-studio.html':url.pathname.endsWith('/artist-tags.html')?'./artist-tags.html':'./index.html');
        if(fallback)return fallback;
      }
      return new Response('Offline: file unavailable',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
    }
  })());
});
