// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

vi.mock("$lib/paraglide/messages.js", () => ({
  admin_invite_link_url_label: () => "Invite link",
  admin_invite_link_copy: () => "Copy Link",
  admin_invite_link_expires: ({ expiresAt }: { expiresAt: string }) =>
    `Expires ${expiresAt}`,
  admin_invite_link_card_label: ({ index }: { index: string }) =>
    `Invite link ${index}`,
}));

const { default: InviteLinkResult } = await import("./InviteLinkResult.svelte");

afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

const MOCK_INVITES = [
  {
    url: "/first-login/token-abc",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    url: "/first-login/token-def",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
];

describe("InviteLinkResult", () => {
  it("renders one card per invite", () => {
    render(InviteLinkResult, {
      props: {
        invites: MOCK_INVITES,
        oncopy: vi.fn(),
      },
    });

    const cards = screen.getAllByRole("group");
    expect(cards).toHaveLength(2);
  });

  it("displays invite URL with origin prefix", () => {
    render(InviteLinkResult, {
      props: {
        invites: [MOCK_INVITES[0]!],
        oncopy: vi.fn(),
      },
    });

    const code = document.querySelector("code");
    expect(code?.textContent).toContain("/first-login/token-abc");
  });

  it("shows expiry text for each invite", () => {
    render(InviteLinkResult, {
      props: {
        invites: [MOCK_INVITES[0]!],
        oncopy: vi.fn(),
      },
    });

    expect(screen.getByText(/Expires/)).toBeTruthy();
  });

  it("calls oncopy with the invite URL when copy button clicked", async () => {
    const oncopy = vi.fn();
    render(InviteLinkResult, {
      props: {
        invites: [MOCK_INVITES[0]!],
        oncopy,
      },
    });

    const copyBtn = screen.getByText("Copy Link");
    await fireEvent.click(copyBtn);

    expect(oncopy).toHaveBeenCalledWith("/first-login/token-abc");
  });

  it("sets accessible labels with 1-based index", () => {
    render(InviteLinkResult, {
      props: {
        invites: MOCK_INVITES,
        oncopy: vi.fn(),
      },
    });

    expect(screen.getByLabelText("Invite link 1")).toBeTruthy();
    expect(screen.getByLabelText("Invite link 2")).toBeTruthy();
  });

  it("renders nothing when invites array is empty", () => {
    const { container } = render(InviteLinkResult, {
      props: {
        invites: [],
        oncopy: vi.fn(),
      },
    });

    expect(container.querySelectorAll("[role='group']")).toHaveLength(0);
  });
});
