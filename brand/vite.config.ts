// File: vite.config.ts
// IMPORTANT: Replace <REPO_NAME> with your repo name (e.g., 'brand-timeline')
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  base: '/RoseEyesTwilightDragon/',  // <<— required for GitHub Pages project sites
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  }
})
