// @vitest-environment jsdom

/**
 * Share view page component tests.
 *
 * Covers each ShareViewState branch (loading, content, opened, expired,
 * notFound, badLink), fragment capture and strip, single mutation fire,
 * and decryption error handling. Follows the intake-page test harness
 * pattern with mocked tRPC, paraglide messages, and share-crypto.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as AppState from "$app/state";
import type * as AppNavigation from "$app/navigation";
import type * as AppPaths from "$app/paths";

// --- Controllable mock state ---

let mockMutateFn: Mock<(...args: unknown[]) => Promise<unknown>>;
let mockPageParams: Record<string, string> = { id: "share-uuid-1" };

// --- Fragment simulation ---

let mockHash = "#fragment-key-abc";

// --- Mocks ---

// $app/environment: covered by test-setup.ts (global setupFile)

vi.mock("$app/state", async (importOriginal) => ({
  ...(await importOriginal<typeof AppState>()),
  get page() {
    return {
      url: new URL("http://localhost/share/share-uuid-1"),
      params: mockPageParams,
    };
  },
}));

const { mockReplaceState } = vi.hoisted(() => ({
  mockReplaceState: vi.fn(),
}));

vi.mock("$app/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof AppNavigation>()),
  replaceState: mockReplaceState,
  onNavigate: vi.fn(),
}));

vi.mock("$app/paths", async (importOriginal) => ({
  ...(await importOriginal<typeof AppPaths>()),
  resolve: (path: string) => path,
  base: "",
  assets: "",
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal()),
  trpc: {
    branding: {
      getPublicBranding: {
        query: vi.fn().mockResolvedValue({ orgPublicKey: null }),
      },
    },
    clientPortal: {
      openShare: { mutate: (...args: unknown[]) => mockMutateFn(...args) },
    },
  },
}));

const { mockDecryptShare } = vi.hoisted(() => ({
  mockDecryptShare: vi.fn().mockReturnValue("Decrypted share content"),
}));

vi.mock("$lib/portal/share-crypto.js", async (importOriginal) => ({
  ...(await importOriginal()),
  decryptShare: mockDecryptShare,
}));

const { mockAnnounce } = vi.hoisted(() => ({
  mockAnnounce: vi.fn(),
}));

vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal()),
  announceToLiveRegion: mockAnnounce,
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  share_view_title: () => "Secure message",
  share_view_heading: () => "A message for you",
  share_view_one_time_notice: () =>
    "This link has now been used and cannot be opened again. Save what you need before closing this page.",
  share_view_opened: () =>
    "This link has already been opened and cannot be viewed again.",
  share_view_expired: () => "This link has expired and is no longer available.",
  share_view_not_found: () =>
    "This link was not found. It may have already expired.",
  share_view_bad_link: () =>
    "Check that you opened the complete link from your message.",
  share_view_loading: () => "Loading secure message...",
}));

vi.mock("$lib/shell/PageShell.svelte", async (importOriginal) => ({
  ...(await importOriginal()),
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

vi.mock("$lib/shell/ShellToast.svelte", async (importOriginal) => ({
  ...(await importOriginal()),
  default: (
    await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

import SharePage from "./+page.svelte";

// --- Helpers ---

/** Override location.hash for fragment simulation. */
function setLocationHash(hash: string): void {
  Object.defineProperty(window, "location", {
    writable: true,
    value: {
      ...window.location,
      hash,
      pathname: "/share/share-uuid-1",
    },
  });
}

// --- Tests ---

describe("share view page", () => {
  beforeEach(() => {
    mockPageParams = { id: "share-uuid-1" };
    mockHash = "#fragment-key-abc";
    mockMutateFn = vi.fn();
    mockDecryptShare.mockReturnValue("Decrypted share content");
    vi.clearAllMocks();
    setLocationHash(mockHash);
  });

  afterEach(() => {
    cleanup();
    // Restore location
    setLocationHash("");
  });

  it("renders loading state initially", () => {
    mockMutateFn.mockReturnValue(new Promise(() => undefined)); // never resolves
    render(SharePage);
    // Preloader should be visible during loading
    const preloader = document.querySelector(".share-preloader-center");
    expect(preloader).toBeTruthy();
  });

  it("renders content when openShare returns ready and decryption succeeds", async () => {
    mockMutateFn.mockResolvedValue({
      status: "ready",
      ciphertext: "encrypted-base64-data",
    });

    render(SharePage);

    await vi.waitFor(() => {
      expect(screen.getByText("A message for you")).toBeTruthy();
    });

    expect(screen.getByText("Decrypted share content")).toBeTruthy();
    expect(screen.getByText(/This link has now been used/)).toBeTruthy();
  });

  it("calls decryptShare with correct arguments", async () => {
    mockMutateFn.mockResolvedValue({
      status: "ready",
      ciphertext: "ct-data-123",
    });

    render(SharePage);

    await vi.waitFor(() => {
      expect(mockDecryptShare).toHaveBeenCalledWith(
        "share-uuid-1",
        "ct-data-123",
        "fragment-key-abc",
      );
    });
  });

  it("renders bad-link state when decryption throws", async () => {
    mockMutateFn.mockResolvedValue({
      status: "ready",
      ciphertext: "bad-ct",
    });
    mockDecryptShare.mockImplementation(() => {
      throw new Error("DecryptionError");
    });

    render(SharePage);

    await vi.waitFor(() => {
      expect(
        screen.getByText(/Check that you opened the complete link/),
      ).toBeTruthy();
    });
  });

  it("renders opened state", async () => {
    mockMutateFn.mockResolvedValue({ status: "opened" });

    render(SharePage);

    await vi.waitFor(() => {
      expect(screen.getByText(/already been opened/)).toBeTruthy();
    });
  });

  it("renders expired state", async () => {
    mockMutateFn.mockResolvedValue({ status: "expired" });

    render(SharePage);

    await vi.waitFor(() => {
      expect(screen.getByText(/expired/)).toBeTruthy();
    });
  });

  it("renders not-found state", async () => {
    mockMutateFn.mockResolvedValue({ status: "not_found" });

    render(SharePage);

    await vi.waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeTruthy();
    });
  });

  it("renders bad-link state when fragment is missing", async () => {
    setLocationHash("");
    render(SharePage);

    await vi.waitFor(() => {
      expect(
        screen.getByText(/Check that you opened the complete link/),
      ).toBeTruthy();
    });

    // Mutation should NOT fire when fragment is missing
    expect(mockMutateFn).not.toHaveBeenCalled();
  });

  it("renders bad-link state when mutation rejects", async () => {
    mockMutateFn.mockRejectedValue(new Error("Network error"));

    render(SharePage);

    await vi.waitFor(() => {
      expect(
        screen.getByText(/Check that you opened the complete link/),
      ).toBeTruthy();
    });
  });

  it("fires the openShare mutation exactly once", async () => {
    mockMutateFn.mockResolvedValue({ status: "opened" });

    render(SharePage);

    await vi.waitFor(() => {
      expect(mockMutateFn).toHaveBeenCalledTimes(1);
    });

    expect(mockMutateFn).toHaveBeenCalledWith({
      shareId: "share-uuid-1",
    });
  });

  it("calls replaceState to strip the fragment from the URL", async () => {
    mockMutateFn.mockResolvedValue({ status: "opened" });

    render(SharePage);

    await vi.waitFor(() => {
      expect(mockReplaceState).toHaveBeenCalledWith("/share/share-uuid-1", {});
    });
  });

  it("does not call replaceState when fragment is missing", async () => {
    setLocationHash("");
    render(SharePage);

    await vi.waitFor(() => {
      expect(
        screen.getByText(/Check that you opened the complete link/),
      ).toBeTruthy();
    });

    expect(mockReplaceState).not.toHaveBeenCalled();
  });

  it("announces to live region on content state", async () => {
    mockMutateFn.mockResolvedValue({
      status: "ready",
      ciphertext: "ct",
    });

    render(SharePage);

    await vi.waitFor(() => {
      expect(mockAnnounce).toHaveBeenCalledWith("polite", "A message for you");
    });
  });

  it("announces to live region on terminal states", async () => {
    mockMutateFn.mockResolvedValue({ status: "expired" });

    render(SharePage);

    await vi.waitFor(() => {
      expect(mockAnnounce).toHaveBeenCalledWith(
        "polite",
        "This link has expired and is no longer available.",
      );
    });
  });
});
