import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '192.168.1.17',
    port: 5173,
    allowedHosts: ['nexusbyraman'] // Tells Vite this custom name is safe
  }
})