import { defineConfig } from "astro/config";
import AstroPWA from "@vite-pwa/astro";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [
    AstroPWA({
      devOptions: {
        enabled: true,
      },
      registerType: "autoUpdate",
      manifest: {
        name: "Fanworks Labeler",
        short_name: "Fanworks Labeler",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa/192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa/512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa/512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        share_target: {
          action: "/share-target/",
          method: "GET",
          params: {
            title: "title",
            text: "text",
            url: "url",
          },
        },
      },
    }),
  ],
});
