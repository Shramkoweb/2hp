import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import tailwind from "eslint-plugin-better-tailwindcss";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist/", ".astro/", "twohour-project/"]),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  { languageOptions: { parserOptions: { projectService: true } } },
  astro.configs.recommended,
  {
    files: ["**/*.astro"],
    languageOptions: {
      parserOptions: { projectService: false, project: true },
    },
  },
  tailwind.configs.correctness,
  {
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/styles/global.css",
        detectComponentClasses: true,
      },
    },
    rules: {
      "better-tailwindcss/enforce-consistent-class-order": "error",
      "better-tailwindcss/enforce-canonical-classes": "error",
      "better-tailwindcss/no-deprecated-classes": "error",
      "better-tailwindcss/no-duplicate-classes": "error",
      "better-tailwindcss/no-unnecessary-whitespace": "error",
      "better-tailwindcss/no-restricted-classes": [
        "error",
        {
          restrict: [
            {
              pattern: "[\\[\\(]",
              message:
                "Arbitrary values bypass the design system; use a theme token.",
            },
          ],
        },
      ],
    },
  },
]);
