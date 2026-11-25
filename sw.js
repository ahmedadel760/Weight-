/* Service worker: network first (always the newest page when online), falls back to the saved copy when offline. */
var CACHE='weights-offline-v1';
self.addEventListener('install',function(e){self.skipWaiting();});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.method!=='GET')return;
  var u=new URL(r.url);
  if(u.origin!==self.location.origin)return;
  e.respondWith(new Promise(function(resolve){
    var done=false;
    function fromCache(){return caches.match(r).then(function(m){return m||caches.match(r,{ignoreSearch:true});});}
    var t=setTimeout(function(){fromCache().then(function(m){if(m&&!done){done=true;resolve(m);}});},r.mode==='navigate'?3500:6000);
    fetch(r).then(function(res){
      clearTimeout(t);
      if(res&&res.ok){var c=res.clone();caches.open(CACHE).then(function(k){k.put(r,c);});}
      if(!done){done=true;resolve(res);}
    }).catch(function(){
      clearTimeout(t);
      fromCache().then(function(m){if(!done){done=true;resolve(m||Response.error());}});
    });
  }));
});
