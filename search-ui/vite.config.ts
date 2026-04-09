import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/cv-transcriptions': {
        target: 'http://localhost:9200',
        changeOrigin: true,
        headers: {
          Authorization: 'Basic ' + Buffer.from('elastic:elastic').toString('base64'),
        },
      },
    },
  },
})
