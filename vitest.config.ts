import { existsSync } from "node:fs";
import { defineConfig, defineProject } from "vitest/config";
import { coverageConfigDefaults } from "vitest/config";

// Client project requires SvelteKit deps (@sveltejs/vite-plugin-svelte) which
// are only available on the host, not inside the Docker test container. Include
// the client project only when its dependencies are installed.
const clientAvailable = existsSync("node_modules/@sveltejs/vite-plugin-svelte");

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        // CLI entry points (side effects, process.exit). Logic extracted to testable modules.
        "packages/server/src/index.ts",
        "packages/server/src/db/migrate.ts",
        "packages/server/src/db/schema-create.ts",
        // Test infrastructure, not production code.
        "packages/server/src/test-utils.ts",
        "packages/server/src/test-global-setup.ts",
        "packages/crypto/src/fc-config.ts",
        // Side-effect singleton (Pool creation, type parser). Tested indirectly via integration tests.
        "packages/server/src/db/db.ts",
        // Migration down() functions are rollback-only, never called in production flow.
        "packages/server/src/db/migrations/**",
      ],
    },
    projects: [
      defineProject({
        test: {
          name: "shared",
          root: "packages/shared",
          include: ["src/**/*.test.ts"],
          exclude: ["**/dist/**", "**/node_modules/**"],
          coverage: {
            provider: "v8",
            thresholds: {
              statements: 95,
              branches: 95,
              functions: 95,
              lines: 95,
            },
          },
        },
      }),
      defineProject({
        test: {
          name: "crypto",
          root: "packages/crypto",
          include: ["src/**/*.test.ts"],
          exclude: ["**/dist/**", "**/node_modules/**"],
          coverage: {
            provider: "v8",
            thresholds: {
              statements: 100,
              branches: 100,
              functions: 100,
              lines: 100,
            },
          },
        },
      }),
      defineProject({
        test: {
          name: "server",
          root: "packages/server",
          globalSetup: ["src/test-global-setup.ts"],
          include: ["src/**/*.test.ts"],
          exclude: ["**/dist/**", "**/node_modules/**"],
          coverage: {
            provider: "v8",
            thresholds: {
              statements: 90,
              branches: 90,
              functions: 90,
              lines: 90,
            },
          },
        },
      }),
      // Client uses file-based config so the sveltekit() vite plugin resolves
      // $app/*, $lib/*, and $service-worker aliases in tests.
      // Referenced as a directory so vitest sets cwd to packages/client/
      // before loading the config (sveltekit() needs cwd to find svelte.config.js).
      // Skipped inside Docker where SvelteKit deps are not installed.
      ...(clientAvailable ? ["packages/client" as const] : []),
    ],
  },
});
