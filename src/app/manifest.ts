import type { MetadataRoute } from 'next'

/** Installable on the home screen; opens straight on the menu. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Matador — shawarma, Angus burgers, BBQ',
    short_name: 'Matador',
    description: 'Menu and ordering: shawarma, Angus burgers, khorovats and BBQ in Yerevan.',
    start_url: '/hy?utm_source=pwa#menu',
    scope: '/',
    display: 'standalone',
    background_color: '#120d0b',
    theme_color: '#120d0b',
    lang: 'hy',
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Մենյու', url: '/hy#menu' },
      { name: 'Меню', url: '/ru#menu' },
      { name: 'Menu', url: '/en#menu' },
    ],
  }
}
