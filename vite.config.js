import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['date-fns', 'lucide-react'],
          pdf: ['jspdf', 'html2canvas']
        }
      }
    }
  },
  server: { 
    open: true, 
    port: 3030,
    proxy: {
      '/backend': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false
      }
    }
  },
});
