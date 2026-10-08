// Network-first so updates land immediately; the cache is only the offline fallback.
// Same-origin requests skip the browser's HTTP cache (GitHub Pages lets it hold files for 10 min).
const CACHE='pissteria-v2';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png','bleed-8bit.mid','trip-8bit.mid'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>fetch(u,{cache:'no-store'}).then(r=>r.ok&&c.put(u,r)).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const sameOrigin=new URL(req.url).origin===self.location.origin;
  e.respondWith((sameOrigin?fetch(req.url,{cache:'no-store'}):fetch(req)).then(r=>{
    if(r&&(r.ok||r.type==='opaque')){const c=r.clone();caches.open(CACHE).then(ch=>ch.put(req,c))}
    return r;
  }).catch(()=>caches.match(req).then(m=>m||caches.match('index.html'))));
});
