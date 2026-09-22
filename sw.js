const APP_URL='https://kalifpeter.github.io/HaleHuddle-Tennis-Scorecard/timed-junior.html';
const ICON_URL='https://kalifpeter.github.io/HaleHuddle-Tennis-Scorecard/app-icon-192.png';

self.addEventListener('install',event=>{ self.skipWaiting(); });
self.addEventListener('activate',event=>{ event.waitUntil(self.clients.claim()); });

self.addEventListener('push',event=>{
  event.waitUntil((async()=>{
    let d={};
    try{ d=event.data ? event.data.json() : {}; }catch(e){}
    const n=(d && d.notification) ? d.notification : d;
    const title=n.title || 'HaleHuddle Tennis — TIME';
    const body=n.body || 'A court timer has ended.';
    const url=n.navigate || n.url || APP_URL;
    await self.registration.showNotification(title,{
      body,
      icon:ICON_URL,
      badge:ICON_URL,
      tag:'halehuddle-timer',
      renotify:true,
      silent:false,
      data:{url}
    });
  })());
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const url=(event.notification.data&&event.notification.data.url)||APP_URL;
  event.waitUntil((async()=>{
    const list=await clients.matchAll({type:'window',includeUncontrolled:true});
    for(const c of list){
      if('navigate' in c)await c.navigate(url);
      if('focus' in c)return c.focus();
    }
    if(clients.openWindow)return clients.openWindow(url);
  })());
});
