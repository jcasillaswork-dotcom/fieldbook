import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// host: true listens on 0.0.0.0 so the app is reachable from outside the VM
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 }
});
