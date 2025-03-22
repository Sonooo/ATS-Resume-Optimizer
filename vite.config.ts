import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist/build/pdf', 'react', 'react-dom'],
    exclude: ['lucide-react'],
  },
  build: {
    commonjsOptions: {
      include: [/pdfjs-dist/, /node_modules/],
      defaultIsModuleExports: true,
    },
    rollupOptions: {
      external: ['attr-accept'],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
  resolve: {
    alias: {
      'pdfjs-dist': path.resolve(__dirname, 'node_modules/pdfjs-dist'),
      'pdfjs-dist/build/pdf': path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.js'),
      'pdfjs-dist/build/pdf.worker': path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.js'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
});
