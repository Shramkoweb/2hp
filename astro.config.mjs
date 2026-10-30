import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://twohourproject.com",
  cacheDir: "./.astro/cache",
  compressHTML: true,
  vite: { cacheDir: "./.astro/cache/vite", plugins: [tailwindcss()] },
});
