const VERSION = '__VERSION__'
const CACHE = `orin-${VERSION}`
const SHELL = ['/', '/manifest.webmanifest', '/img/room.webp', '/img/room-tiny.webp', '/icons/icon-192.png']

self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}))
})

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== location.origin || url.pathname.startsWith('/api/')) return

  // страницы: сначала сеть, чтобы всегда была свежая версия
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req, { cache: 'no-store' }).then((r) => {
      const copy = r.clone()
      caches.open(CACHE).then((c) => c.put('/', copy))
      return r
    }).catch(() => caches.match('/')))
    return
  }
  // файлы с хэшем в имени и картинки: из кэша, иначе из сети
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/img/') || url.pathname.startsWith('/icons/')) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)) }
      return r
    })))
  }
})
