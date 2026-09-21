const APP_URL='/HaleHuddle-Tennis-Scorecard/timed-junior.html';
self.addEventListener('push',event=>{
  let d={};
  try{d=event.data?event.data.json():{}}catch(e){}
  event.waitUntil(self.registration.showNotification(d.title||'HaleHuddle Tennis — TIME',{
    body:d.body||'A court timer has ended.',
    icon:'app-icon-192.png',
    badge:'app-icon-192.png',
    tag:'halehuddle-timer-'+Date.now(),
    renotify:true,
    data:{url:d.url||APP_URL}
  }));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const url=(event.notification.data&&event.notification.data.url)||APP_URL;
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const c of list){if('focus' in c){c.navigate(url);return c.focus();}}
    if(clients.openWindow)return clients.openWindow(url);
  }));
});
