/* ============================================
   Service Worker - Mi Biblioteca
   Permite que la app funcione SIN internet
   ============================================ */

const CACHE_NAME = "biblioteca-v2";

// Archivos que se guardan al instalar
const ARCHIVOS = [
  "index.html",
  "HTML.html",
  "CSS1.html",
  "CSS2.html",
  "CSS3.html",
  "php1.html",
  "php2.html",
  "php3.html",
  "js1.html",
  "js2.html",
  "Table.html",
  "tabla2.html",
  "js3.html",
  "manifest.json",
  "logoDN.png"
];

// Instalar: cachea archivos
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Cacheando archivos...");
      return cache.addAll(ARCHIVOS).catch((err) => {
        console.warn("Algunos archivos no se pudieron cachear:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activar: limpia caches antiguas
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) => {
      return Promise.all(
        nombres.map((nombre) => {
          if (nombre !== CACHE_NAME) {
            console.log("🗑️ Borrando cache antigua:", nombre);
            return caches.delete(nombre);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: sirve desde cache si no hay internet
self.addEventListener("fetch", (evento) => {
  evento.respondWith(
    caches.match(evento.request).then((respuesta) => {
      if (respuesta) {
        return respuesta;
      }
      return fetch(evento.request).then((resp) => {
        // Guardar nueva respuesta en cache (opcional)
        if (evento.request.method === "GET") {
          const copia = resp.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(evento.request, copia);
          });
        }
        return resp;
      }).catch(() => {
        // Fallback si no hay internet ni cache
        return caches.match("index.html");
      });
    })
  );
});