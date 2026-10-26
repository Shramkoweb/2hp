import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  cacheDir: "./.astro/cache",
  compressHTML: true,
  vite: { cacheDir: "./.astro/cache/vite", plugins: [tailwindcss()] },
});
