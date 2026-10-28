/* Matador service worker: the menu still opens with no signal (last version seen), everything else is live. */
const VERSION = 'matador-v1'
const PAGES = ['/hy', '/ru', '/en', '/hy/menu', '/ru/menu', '/en/menu']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(PAGES).catch(() => {})))
  self.skipWaiting()
})
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))))
  self.clients.claim()
})

const live = (url) => /^\/(admin|api|m|telegram|health)(\/|$)/.test(url.pathname) || /^\/(hy|ru|en)\/o\//.test(url.pathname)

self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== self.location.origin || live(url)) return
  // pages: network first, the cached copy when offline
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) caches.open(VERSION).then((c) => c.put(req, res.clone()))
          return res
        })
        .catch(() => caches.match(req).then((r) => r || caches.match(url.pathname.startsWith('/ru') ? '/ru' : url.pathname.startsWith('/en') ? '/en' : '/hy'))),
    )
    return
  }
  // build assets and brand images never change under the same URL: cache first
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/brand/') || url.pathname.startsWith('/_next/image')) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) caches.open(VERSION).then((c) => c.put(req, res.clone()))
            return res
          }),
      ),
    )
  }
})
