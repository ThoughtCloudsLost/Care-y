// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import {
  getSodium,
  generatePortalSeed,
  derivePortalKeypair,
  eciesEncrypt,
  encode,
  toRistrettoPoint,
} from "@care-y/crypto";
import type { ComponentProps } from "svelte";
import * as m from "$lib/paraglide/messages.js";
import PortalThread from "./PortalThread.svelte";

type PortalThreadProps = ComponentProps<typeof PortalThread>;
type PortalMessageWire = PortalThreadProps["messages"][number];

// IntersectionObserver stub for DecryptPlaceholder
vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(function (this: {
    observe: () => void;
    disconnect: () => void;
    unobserve: () => void;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

beforeAll(async () => {
  await getSodium();
});

let messageSeq = 0;

function makeMessage(
  text: string,
  direction: PortalMessageWire["direction"],
  keypairPublic: Uint8Array,
  editedAt: string | null = null,
  createdAt: string = new Date().toISOString(),
): PortalMessageWire {
  const encrypted = eciesEncrypt(
    new TextEncoder().encode(text),
    toRistrettoPoint(keypairPublic),
  );
  messageSeq += 1;
  return {
    id: `msg-${String(messageSeq)}`,
    direction,
    ephemeralPoint: encode(encrypted.ephemeralPoint),
    nonce: encode(encrypted.nonce),
    ciphertext: encode(encrypted.ciphertext),
    createdAt,
    editedAt,
  };
}

describe("PortalThread", () => {
  afterEach(cleanup);

  it("renders empty state when no messages", () => {
    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);

    const { getByTestId } = render(PortalThread, {
      props: {
        messages: [],
        clientPrivate: keypair.clientPrivate,
        loading: false,
      },
    });

    expect(getByTestId("portal-empty-state")).toBeTruthy();
  });

  it("renders messages with correct direction via ConversationBubble", () => {
    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);

    const messages = [
      makeMessage("Hello from support", "to_client", keypair.clientPublic),
      makeMessage("Thanks for the help", "from_client", keypair.clientPublic),
    ];

    const { getByTestId, container } = render(PortalThread, {
      props: {
        messages,
        clientPrivate: keypair.clientPrivate,
        loading: false,
      },
    });

    const thread = getByTestId("portal-thread");
    expect(thread.getAttribute("role")).toBe("log");

    const bubbles = container.querySelectorAll(
      "[data-testid='conversation-bubble']",
    );
    expect(bubbles.length).toBe(2);

    const received = container.querySelector('[data-direction="received"]');
    expect(received).toBeTruthy();

    const sent = container.querySelector('[data-direction="sent"]');
    expect(sent).toBeTruthy();
  });

  it("shows speaker eyebrow on received bubbles only", () => {
    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);

    const messages = [
      makeMessage("Hello from support", "to_client", keypair.clientPublic),
      makeMessage("Thanks for the help", "from_client", keypair.clientPublic),
    ];

    const { container } = render(PortalThread, {
      props: {
        messages,
        clientPrivate: keypair.clientPrivate,
        loading: false,
      },
    });

    const speakerLabels = container.querySelectorAll(
      "[data-testid='bubble-speaker']",
    );
    expect(speakerLabels.length).toBe(1);
  });

  it("uses the org's support label on received bubbles when set", () => {
    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);

    const { container } = render(PortalThread, {
      props: {
        messages: [
          makeMessage("Hello from support", "to_client", keypair.clientPublic),
        ],
        clientPrivate: keypair.clientPrivate,
        loading: false,
        supportLabel: "The night team",
      },
    });

    const speaker = container.querySelector("[data-testid='bubble-speaker']");
    expect(speaker?.textContent.trim()).toBe("The night team");
  });

  it("falls back to the built-in wording when the org set no label", () => {
    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);

    const { container } = render(PortalThread, {
      props: {
        messages: [
          makeMessage("Hello from support", "to_client", keypair.clientPublic),
        ],
        clientPrivate: keypair.clientPrivate,
        loading: false,
        supportLabel: "   ",
      },
    });

    const speaker = container.querySelector("[data-testid='bubble-speaker']");
    expect(speaker?.textContent.trim()).toBe(m.portal_support_team());
  });

  // Org-level by construction: the sent side never carries a speaker, so the
  // label cannot become a per-person identity on the client's own messages.
  it("never labels the client's own messages", () => {
    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);

    const { container } = render(PortalThread, {
      props: {
        messages: [makeMessage("Thanks", "from_client", keypair.clientPublic)],
        clientPrivate: keypair.clientPrivate,
        loading: false,
        supportLabel: "The night team",
      },
    });

    expect(
      container.querySelector("[data-testid='bubble-speaker']"),
    ).toBeNull();
  });

  // Thread mechanics with no concept for a client to learn, and the org
  // side has had them all along.
  describe("datelines", () => {
    const DAY_ONE_MORNING = "2026-08-20T10:00:00.000Z";
    const DAY_ONE_LATER = "2026-08-20T18:30:00.000Z";
    const DAY_TWO = "2026-08-21T09:00:00.000Z";

    function separatorCount(container: HTMLElement): number {
      return container.querySelectorAll("[role='separator']").length;
    }

    it("opens the thread with a dateline", () => {
      const keypair = derivePortalKeypair(generatePortalSeed());
      const { container } = render(PortalThread, {
        props: {
          messages: [
            makeMessage(
              "Hello",
              "to_client",
              keypair.clientPublic,
              null,
              DAY_ONE_MORNING,
            ),
          ],
          clientPrivate: keypair.clientPrivate,
          loading: false,
        },
      });

      expect(separatorCount(container)).toBe(1);
    });

    it("draws one dateline per day, not per message", () => {
      const keypair = derivePortalKeypair(generatePortalSeed());
      const pub = keypair.clientPublic;
      const { container } = render(PortalThread, {
        props: {
          messages: [
            makeMessage("a", "to_client", pub, null, DAY_ONE_MORNING),
            makeMessage("b", "to_client", pub, null, DAY_ONE_LATER),
            makeMessage("c", "to_client", pub, null, DAY_TWO),
          ],
          clientPrivate: keypair.clientPrivate,
          loading: false,
        },
      });

      expect(separatorCount(container)).toBe(2);
    });

    it("draws none between messages on the same day", () => {
      const keypair = derivePortalKeypair(generatePortalSeed());
      const pub = keypair.clientPublic;
      const { container } = render(PortalThread, {
        props: {
          messages: [
            makeMessage("a", "to_client", pub, null, DAY_ONE_MORNING),
            makeMessage("b", "to_client", pub, null, DAY_ONE_LATER),
          ],
          clientPrivate: keypair.clientPrivate,
          loading: false,
        },
      });

      expect(separatorCount(container)).toBe(1);
    });
  });

  it("shows edited marker when editedAt is present", () => {
    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);

    const messages = [
      makeMessage(
        "Edited message",
        "to_client",
        keypair.clientPublic,
        new Date().toISOString(),
      ),
    ];

    const { container } = render(PortalThread, {
      props: {
        messages,
        clientPrivate: keypair.clientPrivate,
        loading: false,
      },
    });

    const editedMarkers = container.querySelectorAll(
      "[data-testid='bubble-edited']",
    );
    expect(editedMarkers.length).toBeGreaterThan(0);
  });

  it("renders loading placeholders when loading", () => {
    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);

    const { queryByTestId } = render(PortalThread, {
      props: {
        messages: [],
        clientPrivate: keypair.clientPrivate,
        loading: true,
      },
    });

    expect(queryByTestId("portal-empty-state")).toBeNull();
    expect(queryByTestId("portal-loading")).toBeTruthy();
  });

  it("provides accessible names on bubble wrappers", () => {
    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);

    const messages = [
      makeMessage("Hello", "to_client", keypair.clientPublic),
      makeMessage("Hi back", "from_client", keypair.clientPublic),
    ];

    const { container } = render(PortalThread, {
      props: {
        messages,
        clientPrivate: keypair.clientPrivate,
        loading: false,
      },
    });

    const articles = container.querySelectorAll('[role="article"]');
    expect(articles.length).toBe(2);
    for (const article of articles) {
      expect(article.getAttribute("aria-label")).toBeTruthy();
    }
  });
});
