import tseslint from "typescript-eslint";
import eslintPluginSvelte from "eslint-plugin-svelte";
import eslintPluginSecurity from "eslint-plugin-security";

export default tseslint.config(
  // Global ignores - must be first config object
  {
    ignores: [
      "**/node_modules/**",
      "**/.svelte-kit/**",
      "**/dist/**",
      "**/coverage/**",
      "**/build/**",
    ],
  },

  // TypeScript strict + stylistic (type-checked)
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Parser options for type-aware rules (non-svelte files)
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".svelte"],
      },
    },
  },

  // Security plugin - all rules as error
  {
    plugins: { security: eslintPluginSecurity },
    rules: Object.fromEntries(
      Object.keys(eslintPluginSecurity.rules ?? {}).map((rule) => [
        `security/${rule}`,
        "error",
      ]),
    ),
  },

  // Svelte files - recommended rules + type-aware parser forwarding
  ...eslintPluginSvelte.configs["flat/recommended"],
  {
    files: ["**/*.svelte", "*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".svelte"],
      },
    },
    rules: {
      // Svelte 5 {@render} calls trigger false positives - the type
      // checker can't resolve snippet types in template blocks.
      "@typescript-eslint/no-unsafe-call": "off",
    },
  },

  // Module boundary enforcement - block deep imports into @care-y/* packages
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@care-y/*/src/*", "@care-y/*/src/**"],
              message:
                "Import from the package barrel export (e.g., @care-y/shared) - not deep paths.",
            },
          ],
        },
      ],
    },
  },

  // Disable type-checked rules for config files not covered by any tsconfig
  // (root tsconfig.json has "files": [] so projectService rejects root-level
  // configs, and packages/client/svelte.config.js is outside its src/ include)
  {
    files: [
      "*.config.{js,ts,mjs,mts}",
      "vitest.config.ts",
      "**/svelte.config.js",
      "**/vite.config.ts",
    ],
    ...tseslint.configs.disableTypeChecked,
  },
);
