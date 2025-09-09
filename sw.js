const CACHE_NAME = "schedule-cache-v2"; // поменял версию, чтобы обновилось
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "schedule.json",
  "manifest.json"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).then(r => {
      // кладём новые ресурсы в кэш
      if (r.ok && e.request.method === "GET") {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      }
      return r;
    }))
  );
});
