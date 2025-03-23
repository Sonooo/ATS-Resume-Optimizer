import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist', 'docx', 'mammoth', 'jspdf'],
    exclude: ['pdfjs-dist/build/pdf.worker'],
  },
  build: {
    commonjsOptions: {
      include: [/pdfjs-dist/, /node_modules/],
      defaultIsModuleExports: true,
    },
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: {
          pdfjs: ['pdfjs-dist'],
          docx: ['docx'],
          mammoth: ['mammoth'],
          jspdf: ['jspdf'],
        },
      },
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'pdfjs-dist': path.resolve(__dirname, 'node_modules/pdfjs-dist'),
      'pdfjs-dist/build/pdf': path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.js'),
      'pdfjs-dist/build/pdf.worker': path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.js'),
    },
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
  },
  publicDir: 'public',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
});
