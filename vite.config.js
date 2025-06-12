import { defineConfig, loadEnv  } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'



 // Load app-level env vars to node-level env vars.

 

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());
  const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;
return {
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      },
      '/genres': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      },
      '/places': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      },
      '/eventos': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      },
      '/reservas': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      },
      '/avaliacoes': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      },
      '/musicos': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      },
      '/notifications': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      },
      '/contratos': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      },
      '/users': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      },
      '/escalas': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      }
    }
  }
}
})
