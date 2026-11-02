import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/upcoming-IT-events/',
  test: {
    environment: 'node'
  }
});
