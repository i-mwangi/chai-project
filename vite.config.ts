import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Match your old setup
    proxy: {
      // Proxy API requests to your backend server
      // During development, you'll run your 'api/server.ts' on port 8000
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  // Ensure the 'public' dir is at the root
  publicDir: 'public',
});