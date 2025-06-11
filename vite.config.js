import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const baseUrl = import.meta.env.VITE_BACKEND_URL;

 // Load app-level env vars to node-level env vars.
 process.env = {...process.env, ...loadEnv(mode, process.cwd())};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': {
        target: baseUrl,
        changeOrigin: true,
        secure: false
      },
      '/genres': {
        target: baseUrl,
        changeOrigin: true,
        secure: false
      },
      '/places': {
        target: baseUrl,
        changeOrigin: true,
        secure: false
      },
      '/eventos': {
        target: baseUrl,
        changeOrigin: true,
        secure: false
      },
      '/reservas': {
        target: baseUrl,
        changeOrigin: true,
        secure: false
      },
      '/avaliacoes': {
        target: baseUrl,
        changeOrigin: true,
        secure: false
      },
      '/musicos': {
        target: baseUrl,
        changeOrigin: true,
        secure: false
      },
      '/notifications': {
        target: baseUrl,
        changeOrigin: true,
        secure: false
      },
      '/contratos': {
        target: baseUrl,
        changeOrigin: true,
        secure: false
      },
      '/users': {
        target: baseUrl,
        changeOrigin: true,
        secure: false
      },
      '/escalas': {
        target: baseUrl,
        changeOrigin: true,
        secure: false
      }
    }
  }
})
