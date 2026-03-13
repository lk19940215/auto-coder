import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/claude-coder/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
