import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'XIMORA Admin',
        short_name: 'XIMORA',
        description: 'Administración privada de productos, inventario y ventas.',
        theme_color: '#f5e8da',
        background_color: '#fffaf6',
        display: 'standalone',
        start_url: '/',
        icons: [],
      },
    }),
  ],
});
