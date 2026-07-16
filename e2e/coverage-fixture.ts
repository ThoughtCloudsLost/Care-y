import { test as base, expect, type Page } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const RAW_DIR = join(process.cwd(), "coverage", "e2e", "raw");

interface V8Entry {
  url: string;
  scriptId: string;
  source?: string;
  functions: {
    functionName: string;
    isBlockCoverage: boolean;
    ranges: {
      startOffset: number;
      endOffset: number;
      count: number;
    }[];
  }[];
}

function isProjectSource(url: string): boolean {
  if (!url.startsWith("http://localhost:")) return false;
  const path = new URL(url).pathname;
  return (
    path.startsWith("/src/") &&
    !path.includes("node_modules") &&
    !path.includes("__vite")
  );
}

async function writeCoverage(entries: V8Entry[], label: string): Promise<void> {
  const filtered = entries.filter((e) => isProjectSource(e.url));
  if (filtered.length === 0) return;

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- RAW_DIR is a fixed path derived from cwd()
  await mkdir(RAW_DIR, { recursive: true });

  const hash = randomBytes(4).toString("hex");
  const fileName = `${label}-${hash}.json`;
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- output path is cwd-relative, not user-controlled
  await writeFile(join(RAW_DIR, fileName), JSON.stringify(filtered));
}

/**
 * Extended test fixture that auto-collects V8 coverage from Chromium.
 * Use this in specs that destructure `{ page }` from the test function.
 * Firefox and WebKit tests are unaffected (coverage calls are skipped).
 */
export const test = base.extend({
  page: async ({ page, browserName }, use, testInfo) => {
    const collect = browserName === "chromium";
    if (collect) {
      await page.coverage.startJSCoverage({ resetOnNavigation: false });
    }

    await use(page);

    if (collect) {
      const coverage = await page.coverage.stopJSCoverage();
      const label = testInfo.titlePath
        .join("-")
        .replace(/\s+/g, "_")
        .replace(/[/\\:]/g, "_");
      await writeCoverage(coverage, label);
    }
  },
});

export { expect };

export async function startCoverage(page: Page): Promise<void> {
  // page.coverage is null at runtime outside Chromium (firefox,
  // webkit-mobile), despite the non-null Playwright type.
  const coverage = page.coverage as Page["coverage"] | null;
  if (coverage && typeof coverage.startJSCoverage === "function") {
    await coverage.startJSCoverage({ resetOnNavigation: false });
  }
}

export async function stopAndWriteCoverage(
  page: Page | undefined,
  label: string,
): Promise<void> {
  if (!page?.coverage || typeof page.coverage.stopJSCoverage !== "function") {
    return;
  }
  const coverage = await page.coverage.stopJSCoverage();
  await writeCoverage(coverage, label);
}
