// @vitest-environment jsdom
/**
 * The chrome contract, checked against what the shells actually render.
 *
 * The type already forces both shells to answer for every slot. What it
 * cannot do is tell whether an answer is true, so this renders each shell
 * and reads the DOM.
 *
 * The absence direction is the one that catches the drift this contract
 * exists for: a control that leaked onto a surface which declared it out.
 * The presence direction only covers slots the shell renders in its own
 * default state, since a slot gated on a viewport, a page, or live data has
 * nothing to assert against in a bare render, and the gate is recorded in
 * the declaration instead.
 *
 * vi.mock() mirrors the two shell specs; see their headers for why.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import {
  CHROME_SLOTS,
  CHROME_SLOT_TEST_IDS,
  CHROME_BEHAVIORS,
  isFilled,
  isBehaviorFilled,
  type ChromeSlotName,
  type ShellChromeSlots,
  type ShellChromeBehaviors,
} from "./chrome-contract.js";
import { appShellChrome, appShellChromeBehaviors } from "./app-shell-chrome.js";
import {
  clientShellChrome,
  clientShellChromeBehaviors,
} from "./client-shell-chrome.js";
import type * as TrpcModule from "$lib/trpc/index.js";
import type * as LogoUrlModule from "$lib/branding/logo-url.svelte.js";
import type * as LayoutModeModule from "$lib/stores/layout-mode.svelte.js";
import type * as SvelteQuery from "@tanstack/svelte-query";
import type * as KonstaPalette from "$lib/branding/konsta-palette.js";
import type * as BrandingTitle from "$lib/branding/title.svelte.js";
import type * as PublicBranding from "$lib/branding/public-branding.js";

// --- Mocks ---

vi.mock("$app/paths", async (importOriginal) => ({
  ...(await importOriginal()),
  resolve: (path: string) => path,
}));

vi.mock("$app/navigation", async (importOriginal) => ({
  ...(await importOriginal()),
  goto: vi.fn(),
}));

vi.mock(
  "$lib/branding/logo-url.svelte.js",
  () =>
    ({
      getOrgLogoUrl: () => null,
      setOrgLogoUrl: vi.fn(),
    }) satisfies typeof LogoUrlModule,
);

vi.mock(
  "$lib/stores/layout-mode.svelte",
  () =>
    ({
      layoutMode: { isDesktop: false, isTablet: false },
    }) satisfies typeof LayoutModeModule,
);

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQuery>()),
  useQueryClient: () => ({
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    getQueriesData: vi.fn().mockReturnValue([]),
    ensureQueryData: vi.fn().mockResolvedValue([]),
    invalidateQueries: vi.fn().mockResolvedValue(undefined),
    getQueryCache: () => ({ subscribe: () => () => undefined }),
  }),
  createQuery: () => ({
    isLoading: false,
    isError: false,
    error: null,
    data: undefined,
  }),
}));

vi.mock(
  "$lib/trpc/index.js",
  () =>
    ({
      trpc: {
        auth: { me: { query: vi.fn() }, listUsers: { query: vi.fn() } },
        tickets: {
          list: { query: vi.fn() },
          get: { query: vi.fn() },
          myQueues: { query: vi.fn() },
          contentSearch: { query: vi.fn() },
        },
        kb: {
          listItems: { query: vi.fn() },
          listCategories: { query: vi.fn() },
          listBodies: { query: vi.fn() },
        },
        recentViews: { get: { query: vi.fn() }, put: { mutate: vi.fn() } },
      } as never,
      setDevDelay: vi.fn(),
      isDevDelayEnabled: vi.fn().mockReturnValue(false),
    }) satisfies typeof TrpcModule,
);

vi.mock("$lib/crypto/context.js", () => {
  const _usedExports = null! as {
    getCryptoBridge: unknown;
    getOrgDecryptCache: unknown;
    getTicketDecryptCache: unknown;
    getPreviewLoader: unknown;
    getCurrentUserId: unknown;
    getCurrentUserRoleId: unknown;
    getCurrentPermissions: unknown;
  };
  const emptySet = new Set<string>();
  return {
    getCryptoBridge: () => ({
      sealSelfBlob: vi.fn(),
      openSelfBlob: vi.fn(),
    }),
    getOrgDecryptCache: () => ({
      decrypt: () => null,
      decryptAsync: async () => null,
      isFailed: () => false,
    }),
    getTicketDecryptCache: () => ({
      decryptTitle: () => undefined,
      decryptFollowUp: () => undefined,
      clearFollowUps: vi.fn(),
      whenSettled: async () => undefined,
    }),
    getPreviewLoader: () => ({ get: () => undefined }),
    getCurrentUserId: () => () => undefined,
    getCurrentUserRoleId: () => () => "volunteer",
    getCurrentPermissions: () => () => emptySet,
  } satisfies typeof _usedExports;
});

vi.mock("$lib/branding/konsta-palette.js", async (importOriginal) => ({
  ...(await importOriginal<typeof KonstaPalette>()),
  applyKonstaPalette: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("$lib/branding/title.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof BrandingTitle>()),
  setBrandingTitle: vi.fn(),
  getBrandingTitle: () => "CARE-Y",
}));

vi.mock("$lib/branding/public-branding.js", async (importOriginal) => ({
  ...(await importOriginal<typeof PublicBranding>()),
  createPublicBrandingQuery: () => ({
    get data(): PublicBranding.PublicBranding {
      return {
        orgName: "Safe Harbor",
        primaryColor: "#636366",
        accentColor: null,
        iconUrl: null,
        orgSlug: "safe-harbor",
        supportLabel: "",
        safeExitUrl: null,
      };
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

class NoopResizeObserver implements ResizeObserver {
  observe(): void {
    /* jsdom performs no layout */
  }
  unobserve(): void {
    /* jsdom performs no layout */
  }
  disconnect(): void {
    /* jsdom performs no layout */
  }
}
globalThis.ResizeObserver = NoopResizeObserver;

class NoopIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: readonly number[] = [];
  observe(): void {
    /* jsdom performs no layout */
  }
  unobserve(): void {
    /* jsdom performs no layout */
  }
  disconnect(): void {
    /* jsdom performs no layout */
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
globalThis.IntersectionObserver = NoopIntersectionObserver;

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

const { default: AppShellHarness } =
  await import("./test-helpers/AppShellHarness.svelte");
const { default: ClientShellHarness } =
  await import("./test-helpers/ClientShellHarness.svelte");

// --- Helpers ---

interface ShellUnderTest {
  readonly name: string;
  readonly slots: ShellChromeSlots;
  readonly behaviors: ShellChromeBehaviors;
  readonly render: () => HTMLElement;
}

const SHELLS: readonly ShellUnderTest[] = [
  {
    name: "AppShell",
    slots: appShellChrome,
    behaviors: appShellChromeBehaviors,
    render: () => render(AppShellHarness).container,
  },
  {
    name: "ClientShell",
    slots: clientShellChrome,
    behaviors: clientShellChromeBehaviors,
    render: () => render(ClientShellHarness).container,
  },
];

function found(container: HTMLElement, slot: ChromeSlotName): boolean {
  return (
    container.querySelector(`[data-testid='${CHROME_SLOT_TEST_IDS[slot]}']`) !==
    null
  );
}

// --- Tests ---

describe("chrome contract", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: { replace: vi.fn() },
      writable: true,
    });
  });

  afterEach(cleanup);

  it("gives every slot a distinct test id", () => {
    const ids = Object.values(CHROME_SLOT_TEST_IDS);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(CHROME_SLOTS.length);
  });

  for (const shell of SHELLS) {
    describe(shell.name, () => {
      it("answers for every slot", () => {
        for (const slot of CHROME_SLOTS) {
          expect(Object.keys(shell.slots)).toContain(slot);
        }
      });

      it("gives every conditional fill a stated gate", () => {
        for (const slot of CHROME_SLOTS) {
          const declared = shell.slots[slot];
          if (!isFilled(declared)) continue;
          if (declared.fill.rendersByDefault) continue;
          expect(
            declared.fill.gatedBy,
            `${slot} is filled but not rendered by default, so it owes a gate`,
          ).toBeTruthy();
        }
      });

      it("renders nothing for a slot it declares omitted", () => {
        const container = shell.render();
        for (const slot of CHROME_SLOTS) {
          if (isFilled(shell.slots[slot])) continue;
          expect(found(container, slot), `${slot} declared omitted`).toBe(
            false,
          );
        }
      });

      it("renders every slot it declares filled by default", () => {
        const container = shell.render();
        for (const slot of CHROME_SLOTS) {
          const declared = shell.slots[slot];
          if (!isFilled(declared)) continue;
          if (!declared.fill.rendersByDefault) continue;
          expect(found(container, slot), `${slot} declared filled`).toBe(true);
        }
      });
    });
  }

  // The point of the contract. Sharing layout primitives stops the two
  // surfaces looking different and does nothing to stop a control landing
  // in a different corner of each.
  it("puts a slot both shells fill in the same position", () => {
    for (const slot of CHROME_SLOTS) {
      const org = appShellChrome[slot];
      const client = clientShellChrome[slot];
      if (!isFilled(org) || !isFilled(client)) continue;
      expect(client.fill.position, `${slot} placement`).toBe(org.fill.position);
    }
  });

  // ── Behavior contract ──────────────────────────────────────────────

  for (const shell of SHELLS) {
    describe(`${shell.name} behaviors`, () => {
      it("declares every behavior", () => {
        for (const behavior of CHROME_BEHAVIORS) {
          expect(
            Object.keys(shell.behaviors),
            `${behavior} must be declared`,
          ).toContain(behavior);
        }
      });
    });
  }

  it("uses the same mechanism string for behaviors both shells fill", () => {
    for (const behavior of CHROME_BEHAVIORS) {
      const org = appShellChromeBehaviors[behavior];
      const client = clientShellChromeBehaviors[behavior];
      if (!isBehaviorFilled(org) || !isBehaviorFilled(client)) continue;
      expect(client.fill.mechanism, `${behavior} mechanism`).toBe(
        org.fill.mechanism,
      );
    }
  });
});
