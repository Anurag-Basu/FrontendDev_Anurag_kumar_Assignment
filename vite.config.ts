import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'
import { CREDENTIALS_RUNTIME_CACHE_NAME } from './src/config/swRuntimeCaches.ts'
import { mockCredentialsApi } from './vite/mockCredentialsApi'

const ROOT = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mockCredentialsApi(ROOT),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Sandbox credential wallet',
        short_name: 'Wallet',
        description: 'Assignment mock — RTK + masking + Workbox offline cache.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait-primary',
        lang: 'en',
        categories: ['finance', 'productivity'],
        icons: [
          {
            src: '/favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,wasm}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.endsWith('/api/credentials'),
            handler: 'NetworkFirst',
            options: {
              cacheName: CREDENTIALS_RUNTIME_CACHE_NAME,
              networkTimeoutSeconds: 5,
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 180,
                maxEntries: 1,
              },
            },
          },
        ],
      },
    }),
  ],


  server: {},
  preview: {
    port: 4173,
    strictPort: true,
    headers: {
      'Strict-Transport-Security': 'max-age=0',
    },
  },
  test: {
    globals: false,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**'],
    },
  },
})
