/* Service Worker — Nàng Biển (PWA, chạy offline)
   Chỉ hoạt động khi mở qua http/https (không chạy với file://). */
const CACHE = 'nangbien-v1';
const ASSETS = ['./', './thue-vay-di-bien.html', './manifest.json', './nb-icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const url = new URL(e.request.url);
      if (url.origin === location.origin) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => hit))
  );
});
