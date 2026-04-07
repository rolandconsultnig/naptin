import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * vite-plugin-pwa dev SW defaults navigateFallbackAllowlist to [/^\/$/] only.
 * Keep SPA fallback explicit for root and /app/*; API stays on denylist.
 */
const spaNavigateAllowlist = [/^\/$/, /^\/app(?:\/.*)?$/]

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const chatHttp = env.VITE_CHAT_BACKEND_PROTOCOL === 'http'
  const chatTarget = chatHttp ? 'http://127.0.0.1:4003' : 'https://127.0.0.1:4003'
  const enableChatProxy =
    mode === 'development' &&
    !env.VITE_CHAT_API_URL &&
    !env.VITE_CHAT_SOCKET_URL &&
    env.VITE_CHAT_USE_VITE_PROXY !== '0' &&
    env.VITE_CHAT_USE_VITE_PROXY !== 'false'

  const chatProxy = enableChatProxy
    ? {
        '/proxy-chat-api': {
          target: chatTarget,
          changeOrigin: true,
          secure: false, // self-signed cert on dev backend
          rewrite: (path) => path.replace(/^\/proxy-chat-api/, '/api'),
        },
        '/proxy-chat-socket': {
          target: chatTarget,
          changeOrigin: true,
          secure: false, // self-signed cert on dev backend
          ws: true,
          rewrite: (path) => path.replace(/^\/proxy-chat-socket/, ''),
        },
      }
    : undefined

  return {
    plugins: [
      react(),
      VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'NAPTIN Enterprise Portal',
        short_name: 'NAPTIN',
        description: 'National Power Training Institute of Nigeria — staff enterprise portal.',
        theme_color: '#006838',
        background_color: '#F7FAF8',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: spaNavigateAllowlist,
        navigateFallbackDenylist: [/^\/api\//, /^\/proxy-chat-api/, /^\/proxy-chat-socket/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        navigateFallbackAllowlist: spaNavigateAllowlist,
      },
      }),
    ],
    resolve: { alias: { '@': '/src' } },
    server: {
      port: 4001,
      ...(chatProxy ? { proxy: chatProxy } : {}),
    },
  }
})
