const CACHE_NAME = 'tsuzukeru-v1';
const ASSETS = [
  './',
  './tsuzukeru_v40.html',
  './manifest_tsuzukeru.json',
  './tsuzukeru-icon-192.png',
  './tsuzukeru-icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS.filter(a => !a.endsWith('.png') || true)))
      .catch(() => caches.open(CACHE_NAME).then(cache => cache.addAll(['./tsuzukeru_v40.html'])))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ネットワーク優先（更新を即反映）→ 失敗時はキャッシュ
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(list =>
      list.length ? list[0].focus() : clients.openWindow('./')
    )
  );
});
