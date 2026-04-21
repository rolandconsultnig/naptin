import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * vite-plugin-pwa dev SW defaults navigateFallbackAllowlist to [/^\/$/] only.
 * Keep SPA fallback explicit for root and /app/*; API stays on denylist.
 *
 * Chat (Owl Talk) dev proxy — must match `dev/main.py` listen mode:
 * - Explicit `VITE_CHAT_BACKEND_PROTOCOL=http|https` in repo-root `.env` wins.
 * - Otherwise: if `dev/ssl/cert.pem` + `key.pem` exist and `OWL_TALK_DISABLE_SSL` is not truthy in `.env`,
 *   Owl uses HTTPS → proxy targets https://127.0.0.1:4003 (fixes 500 when Vite used to default to http).
 * - Else proxy uses http://127.0.0.1:4003. Run `npm run chat` with Owl up, or `npm run dev:full`.
 * - Production: set VITE_CHAT_API_URL / VITE_CHAT_SOCKET_URL → proxy off.
 */
const spaNavigateAllowlist = [/^\/$/, /^\/app(?:\/.*)?$/]

function truthyEnv(v) {
  return ['1', 'true', 'yes', 'on'].includes(String(v ?? '').trim().toLowerCase())
}

/** Align with dev/main.py: HTTPS when certs exist unless OWL_TALK_DISABLE_SSL. */
function resolveChatProxyTarget(env) {
  const explicit = String(env.VITE_CHAT_BACKEND_PROTOCOL || '').trim().toLowerCase()
  if (explicit === 'https') return 'https://127.0.0.1:4003'
  if (explicit === 'http') return 'http://127.0.0.1:4003'

  const disableSsl = truthyEnv(env.OWL_TALK_DISABLE_SSL)
  const cert = path.join(__dirname, 'dev', 'ssl', 'cert.pem')
  const key = path.join(__dirname, 'dev', 'ssl', 'key.pem')
  const certsExist = fs.existsSync(cert) && fs.existsSync(key)
  if (certsExist && !disableSsl) return 'https://127.0.0.1:4003'
  return 'http://127.0.0.1:4003'
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const chatTarget = resolveChatProxyTarget(env)
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
        /** Flask serves uploads under /static/... at app root (not under /api). Without this, img src via /proxy-chat-api/static/... becomes /api/static/... and 404s. */
        '/proxy-chat-static': {
          target: chatTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/proxy-chat-static/, ''),
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
        navigateFallbackDenylist: [/^\/api\//, /^\/proxy-chat-api/, /^\/proxy-chat-static/, /^\/proxy-chat-socket/],
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
    /** Production static server: `npm run preview` / PM2 `naptin-web` — browser hits port 4001 */
    preview: {
      port: 4001,
      strictPort: true,
      host: true,
      ...(chatProxy ? { proxy: chatProxy } : {}),
    },
  }
})
