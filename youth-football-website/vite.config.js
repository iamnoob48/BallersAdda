import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server : {
    proxy : {
      '/api' : 'http://localhost:4000'
    }
  },
  plugins: [
    tailwindcss(),
    react()],
  resolve: {
    alias: {
        "@": path.resolve(__dirname, "./"),
      },
  },
})
