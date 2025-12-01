// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
  registerType: "autoUpdate",

  devOptions: {
    enabled: true,
  },

  includeAssets: [
    "favicon.ico",
    "apple-touch-icon.png",
    "icons/icon-192.png",
    "icons/icon-512.png",
  ],

  manifest: {
    name: "ShelfIt V2",
    short_name: "ShelfIt",
    description: "Your cosmic bookshelf — made for readers by Hari.",
    theme_color: "#120025",
    background_color: "#000000",
    display: "standalone",
    start_url: "/app",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },

  workbox: {
    navigateFallback: "/index.html",

    runtimeCaching: [
      // Google Books API (network first)
      {
        urlPattern:
          /^https:\/\/www\.googleapis\.com\/books\/v1\/volumes/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "google-books-api",
          expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
        },
      },

      // Images only
      {
        urlPattern: ({ request }) => request.destination === "image",
        handler: "CacheFirst",
        options: {
          cacheName: "shelfit-images",
          expiration: { maxEntries: 60, maxAgeSeconds: 604800 },
        },
      },

      // ⛔ DO NOT CACHE BACKEND API
      {
        urlPattern: /\/api\//,
        handler: "NetworkOnly",
      },
    ],
  },
}),
  ],
});
