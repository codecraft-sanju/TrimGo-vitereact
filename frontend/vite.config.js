import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'TrimGo - Smart Salon Queue Management',
        short_name: 'Trimgo',
        description: 'offline working',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  // 👇 Yahan se WARNING FIX wala code shuru hota hai
  build: {
    chunkSizeWarningLimit: 1600, // Warning limit ko 500kb se badha kar 1600kb kar diya
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Jitni bhi heavy libraries (node_modules) hain, unhe alag file mein split kar dega
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})