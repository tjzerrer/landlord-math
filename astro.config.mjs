import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://landlord-math.vercel.app",
  integrations: [sitemap()],
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),
  output: "server"
});
