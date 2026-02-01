const CACHE_NAME = 'ump-federacao-v1.0.0';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/img/logo.png',
  '/img/sousa.png',
  '/img/pombal.png',
  '/img/cajazeiras.png',
  '/img/primeira.png',
  '/img/segunda.png',
  '/img/quarta.png',
  '/img/paulista.png',
  '/img/pocodantas.png',
  '/img/logoipbsousa.png',
  '/img/192.png',
  '/img/512.png'
];

// Install
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache aberto');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', event => {
  console.log('✅ Service Worker: Ativado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Strategy: Network First, fallback to Cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone da resposta
        const responseClone = response.clone();
        
        // Adiciona ao cache
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // Se falhar, busca no cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            // Fallback para index
            return caches.match('/index.html');
          });
      })
  );
});