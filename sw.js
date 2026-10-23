const CACHE_NAME = 'store-pos-v6';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/dashboard.html',
  '/gloss.css',
  '/app-nav.js',
  '/pos_kasir.html',
  '/pesanan_pending.html',
  '/stok_opname.html',
  '/superadmin.html'
];

// 1. Install Service Worker & Simpan Cache Awal
self.addEventListener('install', event => {
  self.skipWaiting(); // Langsung aktifkan Service Worker baru tanpa menunggu
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Aktifkan SW Baru & Hapus Cache Versi Lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // Hapus cache jika nama versi berubah
          }
        })
      );
    }).then(() => self.clients.claim()) // Langsung ambil kendali halaman browser
  );
});

// 3. Strategi Network-First (Prioritas Server -> Fallback Cache saat Offline)
self.addEventListener('fetch', event => {
  // Hanya proses metode GET (abaikan POST/PUT Supabase)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Jika sukses mengambil file terbaru dari server, perbarui simpanan cache
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Jika pengguna sedang offline/tidak ada internet, gunakan file dari cache
        return caches.match(event.request);
      })
  );
});