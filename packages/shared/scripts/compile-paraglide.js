import { compile } from "@inlang/paraglide-js";
import { execSync } from "node:child_process";
import { globSync, rmSync } from "node:fs";

await compile({
  project: "./project.inlang",
  outdir: "./src/paraglide",
  strategy: ["cookie", "baseLocale"],
  emitGitIgnore: false,
  emitPrettierIgnore: false,
  emitReadme: false,
  emitTsDeclarations: true,
});

// emitTsDeclarations leaves the messages barrel and per-key modules
// without declaration files, and the compile removes any that existed,
// so server-side imports of the compiled JS fail the next clean
// tsc --build. Regenerate the full declaration set from the JSDoc so a
// compile always leaves the workspace buildable.
for (const file of globSync("src/paraglide/messages/*.d.ts")) {
  rmSync(file, { force: true });
}
rmSync("src/paraglide/messages.d.ts", { force: true });
execSync(
  "pnpm exec tsc src/paraglide/messages.js src/paraglide/messages/_index.js" +
    " --allowJs --declaration --emitDeclarationOnly --skipLibCheck" +
    " --target es2022 --module nodenext",
  { stdio: "inherit" },
);
