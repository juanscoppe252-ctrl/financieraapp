/* Service worker generado por CerebroNico · caché de red primero con reserva. */
const version = "creador-v1";
const esenciales = ["./", "./index.html", "./css/estilo.css", "./js/main.js"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(version).then((c) => c.addAll(esenciales)));
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(caches.keys().then((claves) =>
    Promise.all(claves.filter((k) => k !== version).map((k) => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (evento) => {
  const req = evento.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  evento.respondWith(
    fetch(req).then((res) => {
      const copia = res.clone();
      caches.open(version).then((c) => c.put(req, copia));
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match("./index.html")))
  );
});
