// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  cleanup,
  waitFor,
  type RenderResult,
} from "@testing-library/svelte";
import ContactInfoCard from "./ContactInfoCard.svelte";

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

function renderCard(
  overrides: Record<string, unknown> = {},
): RenderResult<typeof ContactInfoCard> {
  return render(ContactInfoCard, {
    props: {
      open: true,
      onclose: vi.fn(),
      fetchSealed: vi.fn().mockResolvedValue("sealed-data"),
      openEnvelope: vi.fn().mockResolvedValue({
        phone: "+1 555 010 1234",
        email: "ana@example.org",
      }),
      orgName: "Test Org",
      ...overrides,
    },
  });
}

describe("ContactInfoCard", () => {
  afterEach(cleanup);

  it("shows loading state while fetching", () => {
    // Never-resolving promise keeps loading state visible
    const pending = new Promise<string>((_resolve) => void _resolve);
    const fetchSealed = vi.fn().mockReturnValue(pending);
    const { getByTestId } = renderCard({ fetchSealed });
    expect(getByTestId("contact-loading")).toBeTruthy();
  });

  it("renders phone and email rows on successful decrypt", async () => {
    const { getByTestId } = renderCard();

    await waitFor(() => {
      expect(getByTestId("contact-phone")).toBeTruthy();
    });
    expect(getByTestId("contact-phone").textContent).toBe("+1 555 010 1234");
    expect(getByTestId("contact-email").textContent).toBe("ana@example.org");
  });

  it("renders the org name in the footer", async () => {
    const { getByTestId } = renderCard({ orgName: "Harbor House" });

    await waitFor(() => {
      expect(getByTestId("contact-footer")).toBeTruthy();
    });
    expect(getByTestId("contact-footer").textContent).toContain("Harbor House");
  });

  it("shows error state when fetch fails", async () => {
    const fetchSealed = vi.fn().mockRejectedValue(new Error("network"));
    const { getByTestId } = renderCard({ fetchSealed });

    await waitFor(() => {
      expect(getByTestId("contact-error")).toBeTruthy();
    });
  });

  it("shows error state when envelope open fails", async () => {
    const openEnvelope = vi.fn().mockRejectedValue(new Error("decrypt"));
    const { getByTestId } = renderCard({ openEnvelope });

    await waitFor(() => {
      expect(getByTestId("contact-error")).toBeTruthy();
    });
  });

  it("does not fetch when closed", () => {
    const fetchSealed = vi.fn();
    renderCard({ open: false, fetchSealed });
    expect(fetchSealed).not.toHaveBeenCalled();
  });

  it("fires the query on open only", async () => {
    const fetchSealed = vi.fn().mockResolvedValue("sealed");
    const openEnvelope = vi.fn().mockResolvedValue({ phone: "123" });
    renderCard({ fetchSealed, openEnvelope });

    await waitFor(() => {
      expect(fetchSealed).toHaveBeenCalledTimes(1);
    });
  });

  it("clears decrypted state on close via onclose callback", async () => {
    const onclose = vi.fn();
    const { getByTestId, rerender } = renderCard({ onclose });

    // Wait for data to render
    await waitFor(() => {
      expect(getByTestId("contact-phone")).toBeTruthy();
    });

    // Re-render with open=false to simulate close
    await rerender({ open: false, onclose });

    // The onclose was not called here (that happens on dismiss),
    // but re-opening should re-fetch
    const fetchSealed = vi.fn().mockResolvedValue("sealed-again");
    const openEnvelope = vi
      .fn()
      .mockResolvedValue({ email: "new@example.org" });
    await rerender({
      open: true,
      onclose,
      fetchSealed,
      openEnvelope,
      orgName: "Org",
    });

    await waitFor(() => {
      expect(fetchSealed).toHaveBeenCalledTimes(1);
    });
  });

  it("renders only phone when email is absent", async () => {
    const openEnvelope = vi.fn().mockResolvedValue({ phone: "+1 555 000" });
    const { getByTestId, container } = renderCard({ openEnvelope });

    await waitFor(() => {
      expect(getByTestId("contact-phone")).toBeTruthy();
    });
    expect(container.querySelector("[data-testid='contact-email']")).toBeNull();
  });

  it("renders only email when phone is absent", async () => {
    const openEnvelope = vi
      .fn()
      .mockResolvedValue({ email: "test@example.com" });
    const { getByTestId, container } = renderCard({ openEnvelope });

    await waitFor(() => {
      expect(getByTestId("contact-email")).toBeTruthy();
    });
    expect(container.querySelector("[data-testid='contact-phone']")).toBeNull();
  });

  it("shows empty state when both phone and email are undefined", async () => {
    const openEnvelope = vi.fn().mockResolvedValue({});
    const { getByTestId } = renderCard({ openEnvelope });

    await waitFor(() => {
      expect(getByTestId("contact-none")).toBeTruthy();
    });
  });

  it("formats a US E.164 phone number for display", async () => {
    const openEnvelope = vi.fn().mockResolvedValue({ phone: "+15550001234" });
    const { getByTestId } = renderCard({ openEnvelope });

    await waitFor(() => {
      expect(getByTestId("contact-phone")).toBeTruthy();
    });
    expect(getByTestId("contact-phone").textContent).toBe("+1 (555) 000-1234");
  });

  it("renders a generic footer when orgName is empty", async () => {
    const { getByTestId } = renderCard({ orgName: "" });

    await waitFor(() => {
      expect(getByTestId("contact-footer")).toBeTruthy();
    });
    const footerText = getByTestId("contact-footer").textContent;
    // The generic message should not contain the {org} interpolation placeholder
    expect(footerText).not.toContain("{org}");
    // It should contain non-empty text (the fallback message)
    expect(footerText.trim().length).toBeGreaterThan(0);
  });
});
