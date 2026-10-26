import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  cacheDir: "./.astro/cache",
  compressHTML: true,
  vite: { plugins: [tailwindcss()] },
});
