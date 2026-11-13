import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Clash Upgrade Tracker',
        short_name: 'ClashTracker',
        description: 'F2P Clash of Clans Upgrade Tracker & Recommendation Engine',
        theme_color: '#0F172A',
        background_color: '#0B0F19',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/assets/townhalls/th_16.webp',
            sizes: '192x192',
            type: 'image/webp'
          },
          {
            src: '/assets/townhalls/th_16.webp',
            sizes: '512x512',
            type: 'image/webp'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // NetworkFirst for HTML / App navigation so new deployments load instantly
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-navigation-cache',
              networkTimeoutSeconds: 3
            }
          },
          {
            // Game assets: stale-while-revalidate so updates show without cache killing
            urlPattern: /\/assets\/.*\.(webp|png|svg)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'coc-game-assets-v2',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      }
    })
  ]
});
