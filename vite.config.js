import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Google News RSS has no CORS headers, so the browser reaches it through this small
// proxy (used by `npm run dev` and `npm run preview`) as a fallback when GDELT is unavailable.
const newsProxy = {
  '/api/google-news': {
    target: 'https://news.google.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/google-news/, '/rss/search'),
  },
}

// Relative base so the built site also works from a sub-folder (e.g. GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: { proxy: newsProxy },
  preview: { proxy: newsProxy },
})
