/* ネット広告博物館 / 広告ハント — Service Worker
   app shell をキャッシュしてオフラインでも開けるようにする。
   同一オリジンのみ扱い、外部CDN（フォント/Leaflet/YouTube/Supabase）は素通し。 */
const CACHE = "adhunt-v1";
const SHELL = [
  "./",
  "./index.html",
  "./hunt.html",
  "./app.html",
  "./style.css",
  "./hunt.css",
  "./app.js",
  "./hunt.js",
  "./config.js",
  "./manifest.webmanifest",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()).catch(() => {}));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 外部はそのまま

  // ページ遷移はネット優先（更新を反映）→ 落ちたらキャッシュ
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(res => { cachePut(req, res.clone()); return res; })
        .catch(() => caches.match(req).then(r => r || caches.match("./hunt.html")))
    );
    return;
  }

  // 静的アセットはキャッシュ優先（裏で更新）
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => { cachePut(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })
  );
});

function cachePut(req, res) {
  if (res && res.ok && res.type === "basic") caches.open(CACHE).then(c => c.put(req, res)).catch(() => {});
}
