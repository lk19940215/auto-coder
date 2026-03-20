import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/claude-coder/todo/',
  server: {
    port: 5173,
    open: false
  }
})