export default {
  extends: ["stylelint-config-standard"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "theme",
          "custom-variant",
          "utility",
          "variant",
          "source",
        ],
      },
    ],
    "import-notation": "string",
    "custom-property-empty-line-before": null,
    "value-keyword-case": ["lower", { ignoreProperties: ["/^--font-/"] }],
    "unit-disallowed-list": ["px", "rem"],
    "media-feature-name-disallowed-list": ["width", "min-width", "max-width"],
    "color-no-hex": true,
    "color-named": "never",
    "function-disallowed-list": [
      "rgb",
      "rgba",
      "hsl",
      "hsla",
      "hwb",
      "lab",
      "lch",
      "oklab",
      "oklch",
      "color",
    ],
  },
  overrides: [
    {
      files: ["src/styles/theme.css"],
      rules: {
        "custom-property-pattern": null,
        "unit-disallowed-list": null,
        "media-feature-name-disallowed-list": null,
        "color-no-hex": null,
        "color-named": null,
        "function-disallowed-list": null,
      },
    },
  ],
};
