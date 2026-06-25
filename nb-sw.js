/* Service Worker — Nàng Biển (PWA)
   - Trang HTML: network-first (luôn lấy bản mới, KHÔNG kẹt trang lỗi cũ)
   - Tài nguyên tĩnh: cache-first, CHỈ cache khi phản hồi 200 OK
   - Chỉ chạy khi mở qua http/https (không chạy với file://) */
const CACHE = 'nangbien-v3';
const ASSETS = ['./', './index.html', './manifest.json', './nb-icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // Trang: ưu tiên mạng, cache chỉ dùng khi offline
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) { const c = res.clone(); caches.open(CACHE).then(cc => cc.put(req, c)); }
        return res;
      }).catch(() => caches.match(req).then(h => h || caches.match('./index.html')))
    );
    return;
  }
  // Tài nguyên tĩnh: cache-first, chỉ cache khi 200 OK & cùng origin
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const url = new URL(req.url);
      if (res.ok && url.origin === location.origin) { const c = res.clone(); caches.open(CACHE).then(cc => cc.put(req, c)); }
      return res;
    }))
  );
});
