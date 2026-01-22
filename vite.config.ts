import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // Build do widget standalone
  if (mode === 'widget') {
    return {
      plugins: [react()],
      build: {
        outDir: 'dist/widget',
        lib: {
          entry: resolve(__dirname, 'src/widget.tsx'),
          name: 'WebChatWidget',
          fileName: 'webchat-widget',
          formats: ['iife']
        },
        rollupOptions: {
          output: {
            // Garante que o CSS seja injetado no JS
            assetFileNames: 'webchat-widget.[ext]',
          }
        },
        cssCodeSplit: false,
        sourcemap: false,
        minify: true
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    }
  }

  // Build padrão (app completa)
  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  }
})
