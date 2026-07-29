import { describe, it, expect } from "vitest";
// The vite pipeline serves the module source as a string, which keeps
// this test free of filesystem access.
import source from "./phone-main.ts?raw";

describe("phone-main engine lazy-load guard", () => {
  it("contains no static value import from lib/engine", () => {
    // Match lines starting with `import` (value imports) that reference
    // lib/engine. Type-only imports are excluded because they are erased
    // at compile time and create no chunk edge.
    const staticValueImport = /^import\s+(?!type\b).*from\s+["'].*lib\/engine/m;
    expect(source).not.toMatch(staticValueImport);
  });

  it("contains a dynamic import() of the engine module", () => {
    expect(source).toMatch(
      /import\(\s*["']\.\/lib\/engine\/engine\.js["']\s*\)/,
    );
  });
});
