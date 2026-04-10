import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss(), nitro()],
  nitro: {
    preset: "bun",
    serverDir: "./server",
    routeRules: {}
  }
})
