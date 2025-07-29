import { defineConfig, envField } from "astro/config";
import AstroPWA from "@vite-pwa/astro";

import db from "@astrojs/db";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  experimental: {
    env: {
      schema: {
        PORT: envField.number({
          context: "server",
          access: "public",
          default: 4321,
        }),
        PUBLIC_URL: envField.string({
          context: "server",
          access: "public",
          optional: true,
        }),
        DISCORD_SERVER_URL: envField.string({
          context: "server",
          access: "public",
        }),
        LABELING_SERVER_URL: envField.string({
          context: "server",
          access: "public",
        }),
      },
    },
  },
  security: {
    checkOrigin: true,
  },

  server: {
  	allowedHosts: ["labelfanworks.fujocoded.com"],
  },
    
  integrations: [
    // AstroPWA({
    //   devOptions: {
    //     enabled: true,
    //   },
    //   registerType: "autoUpdate",
    //   manifest: {
    //     name: "Fanworks Labeler",
    //     short_name: "Fanworks Labeler",
    //     theme_color: "#ffffff",
    //     icons: [
    //       {
    //         src: "pwa/192x192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //       {
    //         src: "pwa/512x512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //       {
    //         src: "pwa/512x512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //         purpose: "any maskable",
    //       },
    //     ],
    //     share_target: {
    //       action: "/share-target/",
    //       method: "GET",
    //       params: {
    //         title: "title",
    //         text: "text",
    //         url: "url",
    //       },
    //     },
    //   },
    // }),
    db(),
  ],

  adapter: node({
    mode: "standalone",
  }),
});
