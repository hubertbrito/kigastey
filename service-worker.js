// ===============================
// Ki-Gastey Service Worker
// Versão 1
// ===============================

const CACHE_NAME = 'kigastey-v1';

const FILES_TO_CACHE = [
  '/',
  '/index.html',

  // CSS
  '/frontend/css/base.css',
  '/frontend/css/home.css',

  // JS
  '/frontend/js/app.js',
  '/frontend/js/saldo.js',

  // Manifest
  '/manifest.json',

  // Ícones
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// ===============================
// INSTALL — cache inicial
// ===============================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ===============================
// ACTIVATE — limpa caches antigos
// ===============================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ===============================
// FETCH — offline first
// ===============================
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => {
      // fallback simples se tudo falhar
      return caches.match('/index.html');
    })
  );
});
