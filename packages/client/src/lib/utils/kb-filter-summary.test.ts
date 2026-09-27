import { describe, it, expect, vi, afterEach } from "vitest";
import type * as Runtime from "$lib/paraglide/runtime.js";
import {
  buildKbFilterSummary,
  type KbFilterSummaryInput,
} from "./kb-filter-summary.js";

// vi.mock required: the compiled Paraglide messages read the active locale
// through the runtime's getLocale() at call time, and there is no seam to
// spy on from the message module itself. Spreading importOriginal keeps
// every other runtime export real.
let mockLocale = "en";
vi.mock("$lib/paraglide/runtime.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Runtime>()),
  getLocale: () => mockLocale,
}));

// Restore in a hook, not at the end of the test body: a test that fails
// partway would otherwise leave the locale switched for everything after it.
afterEach(() => {
  mockLocale = "en";
});

const NONE: KbFilterSummaryInput = {
  categoryCount: 0,
  rated: false,
  byAuthor: false,
  dateRange: false,
};

describe("buildKbFilterSummary", () => {
  it("returns 'No filters' when nothing is active", () => {
    expect(buildKbFilterSummary(NONE)).toBe("No filters");
  });

  it("counts categories, singular and plural", () => {
    expect(buildKbFilterSummary({ ...NONE, categoryCount: 1 })).toBe(
      "1 category",
    );
    expect(buildKbFilterSummary({ ...NONE, categoryCount: 3 })).toBe(
      "3 categories",
    );
  });

  it("names the other filters by their pill labels, in pill order", () => {
    expect(
      buildKbFilterSummary({
        categoryCount: 2,
        rated: true,
        byAuthor: true,
        dateRange: true,
      }),
    ).toBe("2 categories, Rating, Author, Date");
  });

  it("reads in the active locale", () => {
    mockLocale = "es";
    expect(
      buildKbFilterSummary({
        categoryCount: 1,
        rated: true,
        byAuthor: true,
        dateRange: true,
      }),
    ).toBe("1 categoría, Valoración, Autor, Fecha");
    expect(buildKbFilterSummary(NONE)).toBe("Sin filtros");
  });
});
