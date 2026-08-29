// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import type * as CryptoContext from "$lib/crypto/context.js";
import { render, cleanup } from "@testing-library/svelte";
import {
  getSodium,
  derivePortalKeypairFromOprf,
  eciesEncrypt,
  encode,
  toRistrettoPoint,
  encodeFileKeyPayload,
  generateContentKey,
  requireSodium,
} from "@care-y/crypto";
import type { ComponentProps } from "svelte";
import * as m from "$lib/paraglide/messages.js";
import PortalThread from "./PortalThread.svelte";
import type { PortalAttachmentWire } from "./portal-attachment-types.js";

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

// vi.mock required: getCryptoBridge uses Svelte 5 createContext which
// throws "missing_context" outside a component tree with CryptoProvider.
// MmsImage imports it at the top level even when the portal passes a
// decrypt callback (the conditional init skips the call, but the import
// triggers the module).
vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
  getCryptoBridge: () => ({
    decryptBlob: vi.fn().mockRejectedValue(new Error("mock: no bridge")),
  }),
}));

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
    const keypair = derivePortalKeypairFromOprf(
      requireSodium().randombytes_buf(64),
    );

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
    const keypair = derivePortalKeypairFromOprf(
      requireSodium().randombytes_buf(64),
    );

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
    const keypair = derivePortalKeypairFromOprf(
      requireSodium().randombytes_buf(64),
    );

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
    const keypair = derivePortalKeypairFromOprf(
      requireSodium().randombytes_buf(64),
    );

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
    const keypair = derivePortalKeypairFromOprf(
      requireSodium().randombytes_buf(64),
    );

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
    const keypair = derivePortalKeypairFromOprf(
      requireSodium().randombytes_buf(64),
    );

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
      const keypair = derivePortalKeypairFromOprf(
        requireSodium().randombytes_buf(64),
      );
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
      const keypair = derivePortalKeypairFromOprf(
        requireSodium().randombytes_buf(64),
      );
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
      const keypair = derivePortalKeypairFromOprf(
        requireSodium().randombytes_buf(64),
      );
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
    const keypair = derivePortalKeypairFromOprf(
      requireSodium().randombytes_buf(64),
    );

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
    const keypair = derivePortalKeypairFromOprf(
      requireSodium().randombytes_buf(64),
    );

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
    const keypair = derivePortalKeypairFromOprf(
      requireSodium().randombytes_buf(64),
    );

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

  // ── Attachments ──────────────────────────────────────────────────

  function makeAttachment(
    followupId: string,
    keypairPublic: Uint8Array,
    opts: {
      contentType?: string;
      filename?: string;
      attachmentId?: string;
    } = {},
  ): PortalAttachmentWire {
    const fileKey = generateContentKey();
    const fname = opts.filename ?? "photo.png";
    const payload = encodeFileKeyPayload(fileKey, fname);
    const sealed = eciesEncrypt(payload, toRistrettoPoint(keypairPublic));

    return {
      attachmentId: opts.attachmentId ?? `att-${String(++messageSeq)}`,
      followupId,
      direction: "to_client",
      sizeBytes: 1024,
      contentType: opts.contentType ?? "image/png",
      ephemeralPoint: encode(sealed.ephemeralPoint),
      nonce: encode(sealed.nonce),
      ciphertext: encode(sealed.ciphertext),
      createdAt: new Date().toISOString(),
    };
  }

  function makeMessageWithFollowup(
    text: string,
    direction: PortalMessageWire["direction"],
    keypairPublic: Uint8Array,
    followupId: string,
  ): PortalMessageWire {
    const encrypted = eciesEncrypt(
      new TextEncoder().encode(text),
      toRistrettoPoint(keypairPublic),
    );
    return {
      id: `msg-${String(++messageSeq)}`,
      followupId,
      direction,
      ephemeralPoint: encode(encrypted.ephemeralPoint),
      nonce: encode(encrypted.nonce),
      ciphertext: encode(encrypted.ciphertext),
      createdAt: new Date().toISOString(),
      editedAt: null,
    };
  }

  describe("attachments", () => {
    it("renders a document attachment as a chip under its message", () => {
      const keypair = derivePortalKeypairFromOprf(
        requireSodium().randombytes_buf(64),
      );
      const followupId = "fu-doc-1";

      const msg = makeMessageWithFollowup(
        "Here is the file",
        "to_client",
        keypair.clientPublic,
        followupId,
      );

      const att = makeAttachment(followupId, keypair.clientPublic, {
        contentType: "application/pdf",
        filename: "report.pdf",
      });

      const { container } = render(PortalThread, {
        props: {
          messages: [msg],
          clientPrivate: keypair.clientPrivate,
          loading: false,
          attachments: [att],
          ticketId: "ticket-att-1",
        },
      });

      const chips = container.querySelectorAll(
        "[data-testid='portal-attachments']",
      );
      expect(chips.length).toBe(1);

      // The chip shows the decrypted filename
      const chipEl = container.querySelector(".attachment-chip");
      expect(chipEl).not.toBeNull();
    });

    it("renders an image attachment as a thumbnail under its message", () => {
      const keypair = derivePortalKeypairFromOprf(
        requireSodium().randombytes_buf(64),
      );
      const followupId = "fu-img-1";

      const msg = makeMessageWithFollowup(
        "Sent you a photo",
        "to_client",
        keypair.clientPublic,
        followupId,
      );

      const att = makeAttachment(followupId, keypair.clientPublic, {
        contentType: "image/jpeg",
        filename: "sunset.jpg",
      });

      const { container } = render(PortalThread, {
        props: {
          messages: [msg],
          clientPrivate: keypair.clientPrivate,
          loading: false,
          attachments: [att],
          ticketId: "ticket-img-1",
        },
      });

      // MmsImage renders a placeholder initially (fetch has not resolved)
      const attachmentArea = container.querySelector(
        "[data-testid='portal-attachments']",
      );
      expect(attachmentArea).not.toBeNull();
    });

    it("does not render attachments under unrelated messages", () => {
      const keypair = derivePortalKeypairFromOprf(
        requireSodium().randombytes_buf(64),
      );

      const msg1 = makeMessageWithFollowup(
        "No files here",
        "to_client",
        keypair.clientPublic,
        "fu-no-att",
      );

      const msg2 = makeMessageWithFollowup(
        "This one has files",
        "to_client",
        keypair.clientPublic,
        "fu-has-att",
      );

      const att = makeAttachment("fu-has-att", keypair.clientPublic, {
        contentType: "application/pdf",
        filename: "doc.pdf",
      });

      const { container } = render(PortalThread, {
        props: {
          messages: [msg1, msg2],
          clientPrivate: keypair.clientPrivate,
          loading: false,
          attachments: [att],
          ticketId: "ticket-group-1",
        },
      });

      // Only one message should have the attachments area
      const areas = container.querySelectorAll(
        "[data-testid='portal-attachments']",
      );
      expect(areas.length).toBe(1);
    });

    it("shows error placeholder when attachment decrypt fails", () => {
      const keypair = derivePortalKeypairFromOprf(
        requireSodium().randombytes_buf(64),
      );
      // Create a different keypair to simulate wrong key
      const wrongKeypair = derivePortalKeypairFromOprf(
        requireSodium().randombytes_buf(64),
      );
      const followupId = "fu-bad-att";

      const msg = makeMessageWithFollowup(
        "Bad attachment",
        "to_client",
        keypair.clientPublic,
        followupId,
      );

      // Encrypt attachment with wrong keypair so decrypt fails
      const att = makeAttachment(followupId, wrongKeypair.clientPublic, {
        contentType: "application/pdf",
        filename: "secret.pdf",
      });

      const { container } = render(PortalThread, {
        props: {
          messages: [msg],
          clientPrivate: keypair.clientPrivate,
          loading: false,
          attachments: [att],
          ticketId: "ticket-bad-1",
        },
      });

      // The error placeholder should render, not the chip
      const errorEl = container.querySelector(".att-error");
      expect(errorEl).not.toBeNull();
    });
  });
});
