import { defineConfig, loadEnv  } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv'



 // Load app-level env vars to node-level env vars.

 dotenv.config();

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());
  console.log(process.env)
  //const env.VITE_BACKEND_URL || "http://localhost:8080" = process.env.VITE_BACKEND_URL || "http://localhost:8080";
return {
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': {
        target: env.VITE_BACKEND_URL || "http://localhost:8080",
        changeOrigin: true,
        secure: false
      },
      '/genres': {
        target: env.VITE_BACKEND_URL || "http://localhost:8080",
        changeOrigin: true,
        secure: false
      },
      '/places': {
        target: env.VITE_BACKEND_URL || "http://localhost:8080",
        changeOrigin: true,
        secure: false
      },
      '/eventos': {
        target: env.VITE_BACKEND_URL || "http://localhost:8080",
        changeOrigin: true,
        secure: false
      },
      '/reservas': {
        target: env.VITE_BACKEND_URL || "http://localhost:8080",
        changeOrigin: true,
        secure: false
      },
      '/avaliacoes': {
        target: env.VITE_BACKEND_URL || "http://localhost:8080",
        changeOrigin: true,
        secure: false
      },
      '/musicos': {
        target: env.VITE_BACKEND_URL || "http://localhost:8080",
        changeOrigin: true,
        secure: false
      },
      '/notifications': {
        target: env.VITE_BACKEND_URL || "http://localhost:8080",
        changeOrigin: true,
        secure: false
      },
      '/contratos': {
        target: env.VITE_BACKEND_URL || "http://localhost:8080",
        changeOrigin: true,
        secure: false
      },
      '/users': {
        target: env.VITE_BACKEND_URL || "http://localhost:8080",
        changeOrigin: true,
        secure: false
      },
      '/escalas': {
        target: env.VITE_BACKEND_URL || "http://localhost:8080",
        changeOrigin: true,
        secure: false
      }
    }
  }
}
})
