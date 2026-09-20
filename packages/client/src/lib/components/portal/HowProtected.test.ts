// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import HowProtected from "./HowProtected.svelte";
import PrivacyPage from "../../../routes/(client)/intake/privacy/+page.svelte";
import type * as ContextNS from "$lib/client-shell/context.js";
import type * as ContextNS2 from "$lib/shell/context.js";
import type * as InjectedBrandingNS from "$lib/branding/injected-branding.js";
import type * as PublicBrandingNS from "$lib/branding/public-branding.js";
import type * as TitleNS from "$lib/branding/title.svelte.js";
import type * as MessagesNS from "$lib/paraglide/messages.js";

// --- i18n mock ---

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesNS>()),
  intake_protected_title: () => "How you're protected",
  intake_protected_summary: () =>
    "The organization can open it until someone takes your case. After that, only your case volunteers can.",
  intake_protected_encrypted_what: () =>
    "Your information is encrypted in your browser.",
  intake_protected_encrypted_why: () =>
    "Even if someone breaks into this server, they cannot read what you wrote.",
  intake_protected_volunteers_what: () =>
    "Until a volunteer first opens your case, the organization can unlock what you wrote. From then on, only the volunteers working on your case can read it.",
  intake_protected_volunteers_why: () =>
    "Your information is encrypted before it leaves your device. The people who run the servers can never read it, and nobody outside the organization can see it. The organization can open it until someone takes your case; after that, access narrows to the specific people helping you.",
  intake_protected_server_what: () =>
    "The server stores your information as scrambled data.",
  intake_protected_server_why: () =>
    "If someone gains access to this server, they see only encrypted text.",
  intake_submit_hint: () =>
    "Encrypted before it is sent. Readable only within the organization, and only by your case volunteers once someone takes your case.",
  intake_hint_dismiss: () => "Got it",
  intake_privacy_title: () => "Privacy notice",
  intake_privacy_who_title: () => "Who is collecting your data",
  intake_privacy_who_body: ({ orgName }: { orgName: string }) =>
    `Your data is collected by ${orgName}.`,
  intake_privacy_what_title: () => "What data we collect and why",
  intake_privacy_what_body: () => "We collect the information you provide.",
  intake_privacy_basis_title: () => "Lawful basis for processing",
  intake_privacy_basis_body: () =>
    "We process your information to provide support.",
  intake_privacy_sharing_title: () => "Who we share your data with",
  intake_privacy_sharing_body: () =>
    "Volunteers decrypt your information on their own devices.",
  intake_privacy_transfer_title: () => "Cross-border data transfer",
  intake_privacy_transfer_body: () => "Twilio operates in the United States.",
  intake_privacy_retention_title: () => "How long we keep your data",
  intake_privacy_retention_body: () => "Your encrypted information is kept.",
  intake_retention_disclosure: () =>
    "When you call or text this hotline, your phone number is used to connect the call.",
  intake_privacy_rights_title: () => "Your rights",
  intake_privacy_rights_body: () => "You can ask to see, correct, or delete.",
  intake_privacy_complaint_title: () => "Right to complain",
  intake_privacy_complaint_body: () =>
    "You have the right to lodge a complaint.",
  intake_privacy_voluntary_title: () => "Is providing data required?",
  intake_privacy_voluntary_body: () =>
    "Providing your information is voluntary.",
  intake_privacy_cookies_title: () => "Cookies",
  intake_privacy_cookies_body: () =>
    "This site uses only session and security cookies.",
}));

// --- Branding title mock ---

vi.mock("$lib/branding/title.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TitleNS>()),
  getBrandingTitle: () => "Test Org",
}));

// The privacy page resolves the org name through the branding query with
// the injected-attribute fallback; the mock resolves immediately so the
// who-collects section renders the name instead of the pending skeleton.
vi.mock("$lib/branding/public-branding.js", async (importOriginal) => ({
  ...(await importOriginal<typeof PublicBrandingNS>()),
  createPublicBrandingQuery: () => ({
    data: { orgName: "Test Org" },
    isLoading: false,
    isError: false,
    isSuccess: true,
    error: null,
  }),
}));

vi.mock("$lib/branding/injected-branding.js", async (importOriginal) => ({
  ...(await importOriginal<typeof InjectedBrandingNS>()),
  readInjectedOrgName: () => null,
}));

// --- Shell mock (jsdom cannot render Konsta internals) ---

vi.mock("$lib/shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContextNS2>()),
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

// vi.mock required: Svelte 5 createContext throws missing_context when the
// consumer renders without its provider; this spec renders the privacy page
// in isolation rather than inside the (client) layout that sets the container.
vi.mock("$lib/client-shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContextNS>()),
  getClientShellCtx: () => ({ current: undefined }),
}));

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// --- HowProtected ---

describe("HowProtected", () => {
  describe("rendering", () => {
    it("renders the summary text", () => {
      const { container } = render(HowProtected);
      const summary = container.querySelector("summary");
      expect(summary).not.toBeNull();
      expect(summary!.textContent).toContain("How you're protected");
    });

    it("starts collapsed with aria-expanded false", () => {
      const { container } = render(HowProtected);
      const summary = container.querySelector("summary");
      expect(summary!.getAttribute("aria-expanded")).toBe("false");
    });

    it("does not show content when collapsed", () => {
      const { container } = render(HowProtected);
      const details = container.querySelector("details");
      expect(details!.open).toBe(false);
    });

    it("renders all three what/why fact pairs", () => {
      const { container } = render(HowProtected);
      const dts = container.querySelectorAll("dt");
      const dds = container.querySelectorAll("dd");
      expect(dts.length).toBe(3);
      expect(dds.length).toBe(3);
    });
  });

  describe("keyboard interaction", () => {
    it("toggles aria-expanded to true on Enter key", async () => {
      const { container } = render(HowProtected);
      const summary = container.querySelector("summary")!;
      const details = container.querySelector("details")!;

      // Simulate opening the details element (jsdom does not natively
      // toggle <details> on click/key events, so set .open and dispatch
      // the toggle event manually, which is what browsers do).
      details.open = true;
      await fireEvent(details, new Event("toggle"));

      expect(summary.getAttribute("aria-expanded")).toBe("true");
    });

    it("toggles aria-expanded back to false when collapsed", async () => {
      const { container } = render(HowProtected);
      const details = container.querySelector("details")!;
      const summary = container.querySelector("summary")!;

      // Open
      details.open = true;
      await fireEvent(details, new Event("toggle"));
      expect(summary.getAttribute("aria-expanded")).toBe("true");

      // Close
      details.open = false;
      await fireEvent(details, new Event("toggle"));
      expect(summary.getAttribute("aria-expanded")).toBe("false");
    });
  });
});

// The submit hint's component tests live in PortalHint.test.ts (the
// shared hint component); IntakeFormBody wires it with the intake copy.

// --- Privacy page ---

describe("Privacy page", () => {
  const sectionTitles = [
    "Who is collecting your data",
    "What data we collect and why",
    "Lawful basis for processing",
    "Who we share your data with",
    "Cross-border data transfer",
    "How long we keep your data",
    "Your rights",
    "Right to complain",
    "Is providing data required?",
    "Cookies",
  ];

  it("renders the page title", () => {
    const { container } = render(PrivacyPage);
    expect(container.textContent).toContain("Privacy notice");
  });

  it("renders all nine GDPR section headings plus cookies", () => {
    const { container } = render(PrivacyPage);
    const text = container.textContent;
    for (const title of sectionTitles) {
      expect(text).toContain(title);
    }
  });

  it("renders the telephony retention disclosure verbatim", () => {
    const { container } = render(PrivacyPage);
    expect(container.textContent).toContain(
      "When you call or text this hotline",
    );
  });

  it("renders the org name in the who-collects section", () => {
    const { container } = render(PrivacyPage);
    expect(container.textContent).toContain(
      "Your data is collected by Test Org",
    );
  });
});
