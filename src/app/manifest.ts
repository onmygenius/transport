import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TRADE CONTAINER - European Freight Exchange',
    short_name: 'TRADE CONTAINER',
    description: 'European Container Freight Exchange Platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#EF4444',
    orientation: 'portrait',
    icons: [
      {
        src: '/logo-pwa.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo-pwa.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
