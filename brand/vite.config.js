import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  base: '/website/', // <-- repo name dictates Pages path
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  }
})
