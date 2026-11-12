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
      includeAssets: ['favicon.ico', 'assets/**/*'],
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
        runtimeCaching: [
          {
            urlPattern: /\/assets\/.*\.(webp|png|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'coc-game-assets-v1',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 60 // 60 Tage Offline-Gültigkeit
              }
            }
          }
        ]
      }
    })
  ]
});
