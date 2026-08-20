// @vitest-environment jsdom
/**
 * ShareStatusLine tests: status resolution (waiting/opened/expired)
 * and skeleton display while the shares query loads.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/svelte";
import ShareStatusLine from "./ShareStatusLine.svelte";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  followup_type_share_link: () => "Secure link",
  share_status_waiting: () => "Waiting",
  share_status_opened: () => "Opened",
  share_status_expired: () => "Expired",
}));

beforeEach(() => {
  cleanup();
});

describe("ShareStatusLine", () => {
  it("shows InlineSkeleton while loading", () => {
    render(ShareStatusLine, {
      props: { share: undefined, loading: true },
    });
    const statusLine = screen.getByTestId("share-status-line");
    expect(statusLine).toBeTruthy();
    expect(statusLine.querySelector("[data-skeleton]")).toBeTruthy();
    expect(screen.queryByTestId("share-status-value")).toBeNull();
  });

  it("shows 'Waiting' when share has no readAt and expiresAt is in the future", () => {
    const futureDate = new Date(Date.now() + 86_400_000).toISOString();
    render(ShareStatusLine, {
      props: {
        share: { readAt: null, expiresAt: futureDate },
        loading: false,
      },
    });
    const value = screen.getByTestId("share-status-value");
    expect(value.textContent.trim()).toBe("Waiting");
  });

  it("shows 'Opened' when share has readAt set", () => {
    const futureDate = new Date(Date.now() + 86_400_000).toISOString();
    render(ShareStatusLine, {
      props: {
        share: { readAt: new Date().toISOString(), expiresAt: futureDate },
        loading: false,
      },
    });
    const value = screen.getByTestId("share-status-value");
    expect(value.textContent.trim()).toBe("Opened");
  });

  it("shows 'Expired' when share has no readAt and expiresAt is in the past", () => {
    const pastDate = new Date(Date.now() - 86_400_000).toISOString();
    render(ShareStatusLine, {
      props: {
        share: { readAt: null, expiresAt: pastDate },
        loading: false,
      },
    });
    const value = screen.getByTestId("share-status-value");
    expect(value.textContent.trim()).toBe("Expired");
  });

  it("shows 'Opened' even when expiresAt is past (readAt takes priority)", () => {
    const pastDate = new Date(Date.now() - 86_400_000).toISOString();
    render(ShareStatusLine, {
      props: {
        share: {
          readAt: new Date(Date.now() - 172_800_000).toISOString(),
          expiresAt: pastDate,
        },
        loading: false,
      },
    });
    const value = screen.getByTestId("share-status-value");
    expect(value.textContent.trim()).toBe("Opened");
  });

  it("renders the 'Secure link' label text", () => {
    const futureDate = new Date(Date.now() + 86_400_000).toISOString();
    render(ShareStatusLine, {
      props: {
        share: { readAt: null, expiresAt: futureDate },
        loading: false,
      },
    });
    const statusLine = screen.getByTestId("share-status-line");
    expect(statusLine.textContent).toContain("Secure link");
  });

  it("shows no skeleton when loading is false and share is provided", () => {
    const futureDate = new Date(Date.now() + 86_400_000).toISOString();
    render(ShareStatusLine, {
      props: {
        share: { readAt: null, expiresAt: futureDate },
        loading: false,
      },
    });
    const statusLine = screen.getByTestId("share-status-line");
    expect(statusLine.querySelector("[data-skeleton]")).toBeNull();
  });
});
