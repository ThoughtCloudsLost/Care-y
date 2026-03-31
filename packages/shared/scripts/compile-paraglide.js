import { compile } from "@inlang/paraglide-js";

await compile({
  project: "./project.inlang",
  outdir: "./src/paraglide",
  strategy: ["cookie", "baseLocale"],
  emitGitIgnore: false,
  emitPrettierIgnore: false,
  emitReadme: false,
  emitTsDeclarations: true,
});
