const CACHE='registro-v1-1.0.6';
const CORE=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./release-guard.js'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(key=>key.startsWith('registro-v1-')&&key!==CACHE).map(key=>caches.delete(key))
  )));
  self.clients.claim();
});

function canonical(request){
  const url=new URL(request.url);
  return new Request(url.origin+url.pathname,{method:'GET',credentials:'same-origin'});
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const key=canonical(request);
    const cached=await cache.match(key);
    const refresh=fetch(request,{cache:'no-store'}).then(async response=>{
      if(response&&response.ok)await cache.put(key,response.clone());
      return response;
    }).catch(()=>null);

    if(cached){
      event.waitUntil(refresh);
      return cached;
    }
    const online=await refresh;
    if(online)return online;
    if(request.mode==='navigate')return (await cache.match(canonical(new Request(new URL('./index.html',self.location).href))))||new Response('Offline',{status:503});
    return new Response('Offline',{status:503});
  })());
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});
