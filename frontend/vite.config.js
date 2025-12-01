// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // auto update SW when you deploy a new version
      registerType: "autoUpdate",

      // allow PWA in `npm run dev` too (handy for testing)
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
        orientation: "portrait",
        start_url: "/app",   // so it opens directly on your main page
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

      // Offline behaviour
      workbox: {
        // what files to precache from your build
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],

        runtimeCaching: [
          // 1) Google Books API – cache responses but still try network first
          {
            urlPattern:
              /^https:\/\/www\.googleapis\.com\/books\/v1\/volumes/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "google-books-api",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },

          // 2) Images – cache-first for covers & icons
          {
            urlPattern: ({ request }) =>
              request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "shelfit-images",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
      },
    }),
  ],
});
