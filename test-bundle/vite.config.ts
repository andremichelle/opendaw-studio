import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  optimizeDeps: {
    exclude: ['@opendaw/bundle-main', '@opendaw/bundle-worklet']
  },
  // Let npm/vite resolve packages naturally
}) 