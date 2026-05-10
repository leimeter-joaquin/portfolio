// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";

export default defineConfig({
  integrations: [vue()],
  vite: {
    resolve: {
      alias: {
        "@components": fileURLToPath(
          new URL(
            "./src/components",
            import.meta.url,
          ),
        ),
        "@data": fileURLToPath(
          new URL(
            "./src/data",
            import.meta.url,
          ),
        ),
        "@css": fileURLToPath(
          new URL(
            "./src/css",
            import.meta.url,
          ),
        ),
      },
    },
  },
});
