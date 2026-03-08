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

  // Svelte 5 rune modules (.svelte.ts) - use svelte parser for $state/$derived support
  {
    files: ["**/*.svelte.ts", "**/*.svelte.js"],
    languageOptions: {
      parser: eslintPluginSvelte.parser,
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".svelte"],
      },
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
      // Service worker is compiled by SvelteKit separately with its own
      // tsconfig (no DOM types, $service-worker module). projectService
      // can't resolve it from the root tsconfigRootDir.
      "**/service-worker.ts",
    ],
    ...tseslint.configs.disableTypeChecked,
  },
);
