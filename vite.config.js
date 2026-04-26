import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {},
  },
  optimizeDeps: {
    include: ['react-globe.gl'],
    exclude: ['three'],
  },
  build: {
    rollupOptions: {
      external: ['three/webgpu', 'three/tsl'],
      output: {
        globals: { 'three/webgpu': 'ThreeWebGPU', 'three/tsl': 'ThreeTSL' },
      },
    },
  },
  ssr: {
    noExternal: [],
  },
});
