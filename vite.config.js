import { defineConfig, loadEnv  } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'



 // Load app-level env vars to node-level env vars.

 

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())
return {
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': {
        target: process.env.VITE_APP_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/genres': {
        target: process.env.VITE_APP_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/places': {
        target: process.env.VITE_APP_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/eventos': {
        target: process.env.VITE_APP_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/reservas': {
        target: process.env.VITE_APP_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/avaliacoes': {
        target: process.env.VITE_APP_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/musicos': {
        target: process.env.VITE_APP_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/notifications': {
        target: process.env.VITE_APP_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/contratos': {
        target: process.env.VITE_APP_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/users': {
        target: process.env.VITE_APP_BACKEND_URL,
        changeOrigin: true,
        secure: false
      },
      '/escalas': {
        target: process.env.VITE_APP_BACKEND_URL,
        changeOrigin: true,
        secure: false
      }
    }
  }
}
})
