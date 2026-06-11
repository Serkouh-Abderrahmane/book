/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Listen on all interfaces so tunnel clients can connect (0.0.0.0)
  server: { host: '0.0.0.0', port: 5173, allowedHosts: true },
  build: { outDir: 'build', sourcemap: false },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
