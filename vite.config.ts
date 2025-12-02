import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:8081'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/auth': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/admin': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/payment-methods': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/receptionist': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/doctor': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/patient': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/store_keeper': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/account': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
