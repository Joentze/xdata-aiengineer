import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'

export default defineConfig({
  plugins: [react(), nitro()],
  nitro: {
    preset: "bun",
    serverDir: "./server",
    routeRules: {}
  }
})
