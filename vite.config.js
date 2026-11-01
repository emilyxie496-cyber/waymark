import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Absolute base: client-side routes such as /app/map must resolve assets from the root.
// /api is proxied to the Node server in development, so secrets never reach the browser.
// Google News RSS has no CORS headers, so the browser reaches it through its own proxy as a
// fallback when GDELT is unavailable. It is listed first so /api does not match it.
const proxy = {
  '/api/google-news': {
    target: 'https://news.google.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/google-news/, '/rss/search'),
  },
  '/api': { target: 'http://localhost:8787', changeOrigin: true },
}

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: { proxy },
  preview: { proxy },
})
