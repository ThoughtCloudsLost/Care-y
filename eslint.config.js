import tseslint from "typescript-eslint";
import eslintPluginSvelte from "eslint-plugin-svelte";
import eslintPluginSecurity from "eslint-plugin-security";
import noHardcodedStrings from "./eslint-rules/no-hardcoded-strings.js";

export default tseslint.config(
  // Global ignores - must be first config object
  {
    ignores: [
      "**/node_modules/**",
      "**/.svelte-kit/**",
      "**/dist/**",
      "**/coverage/**",
      "**/build/**",
      "**/scripts/**",
      "**/paraglide/**",
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
    plugins: {
      "care-y": {
        meta: { name: "eslint-plugin-care-y", version: "1.0.0" },
        rules: { "no-hardcoded-strings": noHardcodedStrings },
      },
    },
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
      // Event handler parameters (e.g., SubmitEvent) aren't fully resolved
      // by the Svelte parser in <script> blocks, triggering false positives.
      "@typescript-eslint/no-unsafe-member-access": "off",
      // $state() and $props() rune return types are resolved by the Svelte
      // compiler, not the TS type checker. The checker sees them as void,
      // triggering false positives on assignments like `let x = $state(null)`.
      "@typescript-eslint/no-confusing-void-expression": "off",
      // All user-facing strings in Svelte templates must use Paraglide
      // message functions for i18n. Catches hardcoded aria-labels,
      // title, placeholder, alt, and visible text content.
      "care-y/no-hardcoded-strings": [
        "error",
        {
          ignoreText: ["CARE-Y", "JN"],
        },
      ],
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
    rules: {
      // $state() and $props() rune return types are resolved by the Svelte
      // compiler, not the TS type checker. Same issue as .svelte files.
      "@typescript-eslint/no-confusing-void-expression": "off",
    },
  },

  // Module boundary enforcement - block deep imports into @care-y/* packages
  // and restrict context-init.ts to CryptoProvider only.
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
            {
              group: [
                "$lib/crypto/context-init",
                "$lib/crypto/context-init.js",
                "$lib/crypto/context-init.ts",
                "**/crypto/context-init",
                "**/crypto/context-init.js",
                "**/crypto/context-init.ts",
              ],
              message:
                "Context setters are restricted to CryptoProvider. Import getters from $lib/crypto/context.js instead.",
            },
          ],
        },
      ],
    },
  },

  // CryptoProvider and AppCryptoProvider are the only consumers of
  // context-init.ts (setter imports). Exempt them from the restriction.
  {
    files: [
      "**/providers/CryptoProvider.svelte",
      "**/providers/AppCryptoProvider.svelte",
    ],
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

  // Block raw Konsta overlay imports in route files. Routes must use Shell
  // wrappers (ShellDialog, ShellSheet, etc.) which add focus-trap, portal,
  // and focus-restore. Content-level components (DialogButton, ActionsGroup,
  // ActionsButton, ActionsLabel) are allowed inside Shell wrapper children.
  //
  // NOTE: ESLint flat config uses last-match-wins, not merge. This override
  // must duplicate the global patterns so route files keep the deep-import
  // and context-init restrictions from the block above.
  {
    files: ["**/routes/**/*.svelte"],
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
            {
              group: [
                "$lib/crypto/context-init",
                "$lib/crypto/context-init.js",
                "$lib/crypto/context-init.ts",
                "**/crypto/context-init",
                "**/crypto/context-init.js",
                "**/crypto/context-init.ts",
              ],
              message:
                "Context setters are restricted to CryptoProvider. Import getters from $lib/crypto/context.js instead.",
            },
          ],
          paths: [
            {
              name: "konsta/svelte",
              importNames: [
                "Dialog",
                "Sheet",
                "Actions",
                "Popup",
                "Popover",
                "Panel",
              ],
              message:
                "Use Shell wrappers (ShellDialog, ShellSheet, etc.) in route files.",
            },
          ],
        },
      ],
    },
  },

  // Disabled during incremental build-out. PRs enforce it via `pnpm lint:strict`.
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  // Stricter type safety rules.
  // These supplement strictTypeChecked, which does not include them.
  {
    rules: {
      // Conflicts with no-non-null-assertion (from strict). When both are on,
      // `as T` is rejected in favor of `!`, but `!` is also rejected.
      // Disable the stylistic rule; strict's prohibition is more important.
      "@typescript-eslint/non-nullable-type-assertion-style": "off",
      // Exported functions must declare return types explicitly.
      // allowedNames exempts tRPC router factories whose return types are
      // generated by router() and impossible to write manually.
      // Sources: trpc.io/docs/server/infer-types, tRPC Issue #3798.
      "@typescript-eslint/explicit-module-boundary-types": [
        "error",
        {
          allowedNames: [
            "createAppRouter",
            "createAuthRouter",
            "createKeysRouter",
            "createOprfRouter",
            "createOrgRouter",
            "createTelephonyAdminRouter",
            "createTelephonyContentRouter",
            "createConsultantRouter",
            "createTicketRouter",
            "createTwoFactorRouter",
            "createKbRouter",
            "createProfileRouter",
            "createOnboardingRouter",
          ],
        },
      ],
      // Prevent unsafe `as X` casts that bypass the type checker.
      "@typescript-eslint/no-unsafe-type-assertion": "error",
      // Prevent truthy/falsy coercion bugs (e.g., 0 or "" treated as false).
      "@typescript-eslint/strict-boolean-expressions": "error",
      // Require exhaustive switch/case on union and enum types.
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      // Enforce `import type` for type-only imports (pairs with verbatimModuleSyntax).
      "@typescript-eslint/consistent-type-imports": "error",
      // Enforce `export type` for type-only exports.
      "@typescript-eslint/consistent-type-exports": "error",
      // Prevent variable shadowing (e.g., inner `token` hiding outer `token`).
      "@typescript-eslint/no-shadow": "error",
      // Prevent Array.sort() without a compare function (silent numeric mis-sort).
      "@typescript-eslint/require-array-sort-compare": "error",
      // Functions returning a Promise must be declared async (single error channel).
      "@typescript-eslint/promise-function-async": "error",
    },
  },

  // Test files - relax rules that conflict with common test patterns
  // (mock objects, dynamic assertions, intentional type coercion).
  // Production-grade type safety is enforced above; tests prioritize
  // readability and pragmatic mocking over strict type correctness.
  {
    files: [
      "**/*.test.ts",
      "**/*.spec.ts",
      "**/test-utils.ts",
      "**/test-setup.ts",
      "**/test-global-setup.ts",
      "**/test-mocks/**",
      "e2e/global-setup.ts",
      "e2e/global-teardown.ts",
    ],
    rules: {
      // Tests mock complex library types (Kysely, tRPC) with minimal stubs.
      "@typescript-eslint/no-unsafe-type-assertion": "off",
      // Falsy checks on nullable mocks are fine in test assertions.
      "@typescript-eslint/strict-boolean-expressions": "off",
      // Test helpers often return promises without async (mock factories).
      "@typescript-eslint/promise-function-async": "off",
      // Unused vars from destructuring (e.g., const [_, result] = ...).
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Tests use dynamic property access for env var manipulation.
      "security/detect-object-injection": "off",
      // Tests delete env vars dynamically in setup/teardown.
      "@typescript-eslint/no-dynamic-delete": "off",
      // Spreading class instances to test error properties is a valid pattern.
      "@typescript-eslint/no-misused-spread": "off",
      // Tests routinely access mock.calls[0]! and similar known-shape objects.
      "@typescript-eslint/no-non-null-assertion": "off",
      // Unnecessary type assertions in mock wiring (e.g., `as unknown as Cache`).
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      // Test mocks use `any` in mock return types from vi.fn().
      // vi.spyOn() and vi.fn() return MockInstance whose methods propagate
      // `any` through assignment, member access, and call expressions.
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      // expect(mock.method).toHaveBeenCalled() separates a method from its
      // object, which unbound-method flags. Safe for vi.fn() mocks that
      // never use `this`.
      "@typescript-eslint/unbound-method": "off",
      // Array<T> in test helper type annotations is fine.
      "@typescript-eslint/array-type": "off",
      // Template literals with numbers in test labels are harmless.
      "@typescript-eslint/restrict-template-expressions": "off",
      // Test functions may be async for consistency without awaiting.
      "@typescript-eslint/require-await": "off",
      // Test files don't need explicit return types on every function.
      "@typescript-eslint/explicit-module-boundary-types": "off",
      // Duplicate type constituents in test type helpers (e.g., undefined | undefined).
      "@typescript-eslint/no-duplicate-type-constituents": "off",
    },
  },

  // Disable type-checked rules for config files not covered by any tsconfig
  // (root tsconfig.json has "files": [] so projectService rejects root-level
  // configs, and packages/client/svelte.config.js is outside its src/ include)
  {
    files: [
      "*.config.{js,ts,mjs,mts}",
      "vitest.config.ts",
      "**/vitest.config.ts",
      "**/svelte.config.js",
      "**/vite.config.ts",
      // Custom ESLint rules are plain JS, not in any tsconfig.
      // disableTypeChecked handles type-aware rules; explicit-module-boundary-types
      // is disabled separately below since it isn't type-aware.
      "eslint-rules/**/*.js",
      // Service worker and its test are compiled by SvelteKit separately
      // with their own tsconfig (no DOM types, $service-worker module).
      // projectService can't resolve them from the root tsconfigRootDir.
      "**/service-worker.ts",
      "**/service-worker.test.ts",
    ],
    ...tseslint.configs.disableTypeChecked,
  },

  // Custom ESLint rules are plain JS without TS annotations.
  // explicit-module-boundary-types isn't type-aware so disableTypeChecked
  // doesn't cover it.
  {
    files: ["eslint-rules/**/*.js"],
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
);
