import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handleRecommend } from './api/_lib/recommend.js'

// Dev-only: serve POST /api/recommend from `npm run dev` so the AI feature
// works locally without the Vercel CLI. In production Vercel runs api/recommend.js.
function devApiPlugin(env) {
  return {
    name: 'dev-api-recommend',
    configureServer(server) {
      server.middlewares.use('/api/recommend', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        }
        let raw = ''
        req.on('data', (chunk) => (raw += chunk))
        req.on('end', async () => {
          let body = {}
          try { body = JSON.parse(raw || '{}') } catch { /* handled as 400 below */ }
          const { status, body: out } = await handleRecommend(body, {
            apiKey: env.GEMINI_API_KEY,
            model: env.GEMINI_MODEL || undefined,
            ip: 'dev',
          })
          res.statusCode = status
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify(out))
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), devApiPlugin(env)],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.js',
      css: false,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{js,jsx}', 'api/**/*.js'],
        exclude: ['src/main.jsx', 'src/test/**', '**/*.test.*'],
        reporter: ['text', 'html'],
      },
    },
  }
})
