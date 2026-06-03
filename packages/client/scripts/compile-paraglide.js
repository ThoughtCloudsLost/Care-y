import { compile } from "@inlang/paraglide-js";

await compile({
  project: "./project.inlang",
  outdir: "./src/lib/paraglide",
  strategy: ["cookie", "preferredLanguage", "baseLocale"],
  emitGitIgnore: true,
  emitPrettierIgnore: false,
  emitReadme: false,
  emitTsDeclarations: true,
});
