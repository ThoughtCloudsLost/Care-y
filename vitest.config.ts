import { defineConfig, defineProject } from "vitest/config";

export default defineConfig({
  test: {
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
      defineProject({
        test: {
          name: "client",
          root: "packages/client",
          include: ["src/**/*.test.ts"],
          exclude: ["**/dist/**", "**/node_modules/**"],
          coverage: {
            provider: "v8",
            thresholds: {
              statements: 85,
              branches: 85,
              functions: 85,
              lines: 85,
            },
          },
        },
      }),
    ],
  },
});
