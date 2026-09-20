import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  TERMINOLOGY_DEFAULTS_EN,
  TERMINOLOGY_DEFAULTS,
  type TerminologyConfig,
} from "@care-y/shared";
import { resolveLabels } from "./index.js";
import { asFixedLocale } from "$lib/locale/reader-locale.js";

describe("resolveLabels", () => {
  it("returns defaults when config is null", () => {
    const labels = resolveLabels(null, asFixedLocale("en"));
    expect(labels).toEqual(TERMINOLOGY_DEFAULTS_EN);
  });

  it("returns matching language from config", () => {
    const config: TerminologyConfig = {
      en: {
        ...TERMINOLOGY_DEFAULTS_EN,
        volunteer: "advocate",
        volunteers: "advocates",
      },
    };
    const labels = resolveLabels(config, asFixedLocale("en"));
    expect(labels.volunteer).toBe("advocate");
    expect(labels.volunteers).toBe("advocates");
    expect(labels.client).toBe("client");
  });

  it("falls back to defaults when requested language is missing from config", () => {
    const config: TerminologyConfig = {
      en: {
        ...TERMINOLOGY_DEFAULTS_EN,
        volunteer: "helper",
        volunteers: "helpers",
      },
    };
    const labels = resolveLabels(config, asFixedLocale("es"));
    expect(labels).toEqual(TERMINOLOGY_DEFAULTS.es);
  });

  it("falls back to TERMINOLOGY_DEFAULTS_EN for unknown language with null config", () => {
    const labels = resolveLabels(null, asFixedLocale("fr"));
    expect(labels).toEqual(TERMINOLOGY_DEFAULTS_EN);
  });

  it("falls back to TERMINOLOGY_DEFAULTS_EN for unknown language not in defaults", () => {
    const config: TerminologyConfig = {
      en: { ...TERMINOLOGY_DEFAULTS_EN },
    };
    const labels = resolveLabels(config, asFixedLocale("fr"));
    expect(labels).toEqual(TERMINOLOGY_DEFAULTS_EN);
  });

  it("returns Spanish defaults when requesting es with null config", () => {
    const labels = resolveLabels(null, asFixedLocale("es"));
    expect(labels.volunteer).toBe("voluntario");
    expect(labels.client).toBe("cliente");
  });

  it("preserves all 11 label fields", () => {
    const config: TerminologyConfig = {
      en: {
        volunteer: "staff",
        volunteers: "staff members",
        client: "survivor",
        clients: "survivors",
        ticket: "case",
        tickets: "cases",
        manager: "supervisor",
        managers: "supervisors",
        queue: "team",
        queues: "teams",
        knowledgeBase: "handbook",
      },
    };
    const labels = resolveLabels(config, asFixedLocale("en"));
    expect(labels.volunteer).toBe("staff");
    expect(labels.volunteers).toBe("staff members");
    expect(labels.client).toBe("survivor");
    expect(labels.clients).toBe("survivors");
    expect(labels.ticket).toBe("case");
    expect(labels.tickets).toBe("cases");
    expect(labels.manager).toBe("supervisor");
    expect(labels.managers).toBe("supervisors");
    expect(labels.queue).toBe("team");
    expect(labels.queues).toBe("teams");
    expect(labels.knowledgeBase).toBe("handbook");
  });
});

describe("cacheTerminology / readCachedTerminology", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "localStorage",
      (() => {
        const store: Record<string, string> = {};
        return {
          getItem: (key: string): string | null => store[key] ?? null,
          setItem: (key: string, value: string): void => {
            store[key] = value;
          },
          removeItem: (key: string): void => {
            delete store[key];
          },
        };
      })(),
    );
  });

  it("roundtrips config through cache", async () => {
    const { cacheTerminology, readCachedTerminology } =
      await import("./index.js");
    const config: TerminologyConfig = {
      en: {
        ...TERMINOLOGY_DEFAULTS_EN,
        volunteer: "helper",
        volunteers: "helpers",
      },
    };
    cacheTerminology(config);
    const cached = readCachedTerminology();
    expect(cached).toEqual(config);
  });

  it("returns null for missing cache", async () => {
    const { readCachedTerminology } = await import("./index.js");
    const cached = readCachedTerminology();
    expect(cached).toBeNull();
  });

  it("returns null for invalid JSON in cache", async () => {
    const { readCachedTerminology } = await import("./index.js");
    localStorage.setItem("care-y-terminology", "not json");
    const cached = readCachedTerminology();
    expect(cached).toBeNull();
  });

  it("returns null for cache with invalid schema", async () => {
    const { readCachedTerminology } = await import("./index.js");
    localStorage.setItem(
      "care-y-terminology",
      JSON.stringify({ en: { volunteer: "" } }),
    );
    const cached = readCachedTerminology();
    expect(cached).toBeNull();
  });
});
