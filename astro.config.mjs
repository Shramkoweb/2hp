import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://twohourproject.com",
  cacheDir: "./.astro/cache",
  compressHTML: true,
  // frame-ancestors cannot live in a <meta> policy; public/_headers sends it with the other headers.
  security: {
    csp: {
      directives: [
        "default-src 'none'",
        "img-src 'self'",
        "font-src 'self'",
        "form-action 'self'",
        "connect-src 'self'",
        "base-uri 'none'",
        "require-trusted-types-for 'script'",
        "trusted-types 'none'",
      ],
      // Cloudflare injects its Web Analytics beacon into the page at the edge
      scriptDirective: {
        resources: ["'self'", "https://static.cloudflareinsights.com"],
      },
      styleDirective: {
        // the name and the charts set --i and --b in style attributes
        resources: [
          { resource: "'self'", kind: "element" },
          { resource: "'unsafe-inline'", kind: "attribute" },
        ],
      },
    },
  },
  // the site has no Markdown, and Shiki's inline styles would break the CSP
  markdown: { syntaxHighlight: false },
  vite: { cacheDir: "./.astro/cache/vite", plugins: [tailwindcss()] },
});
