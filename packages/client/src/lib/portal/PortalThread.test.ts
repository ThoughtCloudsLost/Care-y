// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import type * as CryptoContext from "$lib/crypto/context.js";
import { render, cleanup } from "@testing-library/svelte";
import {
  getSodium,
  eciesEncrypt,
  encode,
  toRistrettoPoint,
  encodeFileKeyPayload,
  generateContentKey,
  requireSodium,
  eciesDecrypt,
  derivePortalKeypairFromOprf,
  toNonce,
} from "@care-y/crypto";
import type { ComponentProps } from "svelte";
import PortalThread from "./PortalThread.svelte";
import type {
  PortalAttachmentWire,
  PortalRecordingWire,
  PortalCallEntry,
} from "./portal-attachment-types.js";

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

/**
 * Helper: build a keypair and matching decrypt functions that resolve
 * synchronously from the test's perspective.
 */
function buildDecryptContext(): {
  keypairPublic: Uint8Array;
  decryptMessage: PortalThreadProps["decryptMessage"];
  decryptAttachmentKey: PortalThreadProps["decryptAttachmentKey"];
  decryptAttachmentBlob: PortalThreadProps["decryptAttachmentBlob"];
} {
  const keypair = derivePortalKeypairFromOprf(
    requireSodium().randombytes_buf(64),
  );

  const decryptMessage: PortalThreadProps["decryptMessage"] = async (
    ephemeralPoint: string,
    nonce: string,
    ciphertext: string,
  ) => {
    const ep = toRistrettoPoint(
      new Uint8Array(Buffer.from(ephemeralPoint, "base64url")),
    );
    const n = toNonce(new Uint8Array(Buffer.from(nonce, "base64url")));
    const ct = new Uint8Array(Buffer.from(ciphertext, "base64url"));
    const plain = eciesDecrypt(ep, n, ct, keypair.clientPrivate);
    return new TextDecoder().decode(plain);
  };

  const decryptAttachmentKey: PortalThreadProps["decryptAttachmentKey"] =
    async (ephemeralPoint: string, nonce: string, ciphertext: string) => {
      const ep = toRistrettoPoint(
        new Uint8Array(Buffer.from(ephemeralPoint, "base64url")),
      );
      const n = toNonce(new Uint8Array(Buffer.from(nonce, "base64url")));
      const ct = new Uint8Array(Buffer.from(ciphertext, "base64url"));
      const plain = eciesDecrypt(ep, n, ct, keypair.clientPrivate);
      const { decodeFileKeyPayload } = await import("@care-y/crypto");
      const payload = decodeFileKeyPayload(plain);
      return { fileKey: encode(payload.fileKey), filename: payload.filename };
    };

  const decryptAttachmentBlob: PortalThreadProps["decryptAttachmentBlob"] =
    async (
      ciphertext: ArrayBuffer,
      fileKey: string,
      ticketId: string,
      attachmentId: string,
    ) => {
      const { decryptContent, buildContentAad, blobSlot, toCiphertext } =
        await import("@care-y/crypto");
      const fkBytes = new Uint8Array(Buffer.from(fileKey, "base64url"));
      const ctBytes = new Uint8Array(ciphertext);
      const plain = decryptContent(
        toCiphertext(ctBytes),
        fkBytes as ReturnType<typeof generateContentKey>,
        buildContentAad(ticketId, blobSlot(attachmentId)),
      );
      const out = new ArrayBuffer(plain.byteLength);
      new Uint8Array(out).set(plain);
      return out;
    };

  return {
    keypairPublic: keypair.clientPublic,
    decryptMessage,
    decryptAttachmentKey,
    decryptAttachmentBlob,
  };
}

function makeMessage(
  text: string,
  direction: PortalMessageWire["direction"],
  keypairPublic: Uint8Array,
  editedAt: string | null = null,
  createdAt: string = new Date().toISOString(),
  type?: string | null,
): PortalMessageWire {
  const encrypted = eciesEncrypt(
    new TextEncoder().encode(text),
    toRistrettoPoint(keypairPublic),
  );
  messageSeq += 1;
  return {
    id: `msg-${String(messageSeq)}`,
    direction,
    type: type ?? null,
    ephemeralPoint: encode(encrypted.ephemeralPoint),
    nonce: encode(encrypted.nonce),
    ciphertext: encode(encrypted.ciphertext),
    createdAt,
    editedAt,
  };
}

/** Build a ProseMirror doc JSON for email tests. */
function emailDocJson(text: string): Record<string, unknown> {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  };
}

/** Build an email_outbound portal message with { subject, doc } JSON payload. */
function makeEmailMessage(
  subject: string,
  bodyText: string,
  direction: PortalMessageWire["direction"],
  keypairPublic: Uint8Array,
  createdAt: string = new Date().toISOString(),
): PortalMessageWire {
  const payload = JSON.stringify({ subject, doc: emailDocJson(bodyText) });
  return makeMessage(
    payload,
    direction,
    keypairPublic,
    null,
    createdAt,
    "email_outbound",
  );
}

describe("PortalThread", () => {
  afterEach(cleanup);

  it("renders empty state when no messages", () => {
    const ctx = buildDecryptContext();

    const { getByTestId } = render(PortalThread, {
      props: {
        messages: [],
        decryptMessage: ctx.decryptMessage,
        decryptAttachmentKey: ctx.decryptAttachmentKey,
        decryptAttachmentBlob: ctx.decryptAttachmentBlob,
        loading: false,
      },
    });

    expect(getByTestId("portal-empty-state")).toBeTruthy();
  });

  it("renders load-error state instead of empty state when the query failed", () => {
    const ctx = buildDecryptContext();

    const { getByTestId, queryByTestId } = render(PortalThread, {
      props: {
        messages: [],
        decryptMessage: ctx.decryptMessage,
        decryptAttachmentKey: ctx.decryptAttachmentKey,
        decryptAttachmentBlob: ctx.decryptAttachmentBlob,
        loading: false,
        loadError: "generic" as const,
      },
    });

    expect(getByTestId("portal-load-error")).toBeTruthy();
    expect(queryByTestId("portal-empty-state")).toBeNull();
  });

  it("renders rate-limit wording distinct from the generic load error", () => {
    const ctx = buildDecryptContext();

    const generic = render(PortalThread, {
      props: {
        messages: [],
        decryptMessage: ctx.decryptMessage,
        decryptAttachmentKey: ctx.decryptAttachmentKey,
        decryptAttachmentBlob: ctx.decryptAttachmentBlob,
        loading: false,
        loadError: "generic" as const,
      },
    });
    const genericText = generic.getByTestId("portal-load-error").textContent;
    cleanup();

    const limited = render(PortalThread, {
      props: {
        messages: [],
        decryptMessage: ctx.decryptMessage,
        decryptAttachmentKey: ctx.decryptAttachmentKey,
        decryptAttachmentBlob: ctx.decryptAttachmentBlob,
        loading: false,
        loadError: "rate_limited" as const,
      },
    });
    const limitedText = limited.getByTestId("portal-load-error").textContent;

    expect(limitedText).not.toBe(genericText);
    expect(limitedText.length).toBeGreaterThan(0);
  });

  it("keeps rendering cached messages when a refetch fails", async () => {
    const ctx = buildDecryptContext();

    const messages = [
      makeMessage("Still here", "to_client", ctx.keypairPublic),
    ];

    const { container, queryByTestId } = render(PortalThread, {
      props: {
        messages,
        decryptMessage: ctx.decryptMessage,
        decryptAttachmentKey: ctx.decryptAttachmentKey,
        decryptAttachmentBlob: ctx.decryptAttachmentBlob,
        loading: false,
        loadError: "rate_limited" as const,
      },
    });

    await vi.waitFor(() => {
      const bubbles = container.querySelectorAll(
        "[data-testid='conversation-bubble']",
      );
      expect(bubbles.length).toBe(1);
    });
    expect(queryByTestId("portal-load-error")).toBeNull();
  });

  it("renders messages with correct direction via ConversationBubble", async () => {
    const ctx = buildDecryptContext();

    const messages = [
      makeMessage("Hello from support", "to_client", ctx.keypairPublic),
      makeMessage("Thanks for the help", "from_client", ctx.keypairPublic),
    ];

    const { getByTestId, container } = render(PortalThread, {
      props: {
        messages,
        decryptMessage: ctx.decryptMessage,
        decryptAttachmentKey: ctx.decryptAttachmentKey,
        decryptAttachmentBlob: ctx.decryptAttachmentBlob,
        loading: false,
      },
    });

    // Wait for async decryption to complete
    await vi.waitFor(() => {
      const thread = getByTestId("portal-thread");
      expect(thread.getAttribute("role")).toBe("log");

      const bubbles = container.querySelectorAll(
        "[data-testid='conversation-bubble']",
      );
      expect(bubbles.length).toBe(2);
    });

    const received = container.querySelector('[data-direction="received"]');
    expect(received).toBeTruthy();

    const sent = container.querySelector('[data-direction="sent"]');
    expect(sent).toBeTruthy();
  });

  it("renders loading placeholders when loading", () => {
    const ctx = buildDecryptContext();

    const { queryByTestId } = render(PortalThread, {
      props: {
        messages: [],
        decryptMessage: ctx.decryptMessage,
        decryptAttachmentKey: ctx.decryptAttachmentKey,
        decryptAttachmentBlob: ctx.decryptAttachmentBlob,
        loading: true,
      },
    });

    expect(queryByTestId("portal-empty-state")).toBeNull();
    expect(queryByTestId("portal-loading")).toBeTruthy();
  });

  it("provides accessible names on bubble wrappers", async () => {
    const ctx = buildDecryptContext();

    const messages = [
      makeMessage("Hello", "to_client", ctx.keypairPublic),
      makeMessage("Hi back", "from_client", ctx.keypairPublic),
    ];

    const { container } = render(PortalThread, {
      props: {
        messages,
        decryptMessage: ctx.decryptMessage,
        decryptAttachmentKey: ctx.decryptAttachmentKey,
        decryptAttachmentBlob: ctx.decryptAttachmentBlob,
        loading: false,
      },
    });

    await vi.waitFor(() => {
      const articles = container.querySelectorAll('[role="article"]');
      expect(articles.length).toBe(2);
      for (const article of articles) {
        expect(article.getAttribute("aria-label")).toBeTruthy();
      }
    });
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
      type: null,
      ephemeralPoint: encode(encrypted.ephemeralPoint),
      nonce: encode(encrypted.nonce),
      ciphertext: encode(encrypted.ciphertext),
      createdAt: new Date().toISOString(),
      editedAt: null,
    };
  }

  describe("attachments", () => {
    it("renders a document attachment as a chip under its message", async () => {
      const ctx = buildDecryptContext();
      const followupId = "fu-doc-1";

      const msg = makeMessageWithFollowup(
        "Here is the file",
        "to_client",
        ctx.keypairPublic,
        followupId,
      );

      const att = makeAttachment(followupId, ctx.keypairPublic, {
        contentType: "application/pdf",
        filename: "report.pdf",
      });

      const { container } = render(PortalThread, {
        props: {
          messages: [msg],
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
          attachments: [att],
          ticketId: "ticket-att-1",
        },
      });

      await vi.waitFor(() => {
        const chips = container.querySelectorAll(
          "[data-testid='portal-attachments']",
        );
        expect(chips.length).toBe(1);
      });
    });

    it("does not render attachments under unrelated messages", async () => {
      const ctx = buildDecryptContext();

      const msg1 = makeMessageWithFollowup(
        "No files here",
        "to_client",
        ctx.keypairPublic,
        "fu-no-att",
      );

      const msg2 = makeMessageWithFollowup(
        "This one has files",
        "to_client",
        ctx.keypairPublic,
        "fu-has-att",
      );

      const att = makeAttachment("fu-has-att", ctx.keypairPublic, {
        contentType: "application/pdf",
        filename: "doc.pdf",
      });

      const { container } = render(PortalThread, {
        props: {
          messages: [msg1, msg2],
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
          attachments: [att],
          ticketId: "ticket-group-1",
        },
      });

      await vi.waitFor(() => {
        // Only one message should have the attachments area
        const areas = container.querySelectorAll(
          "[data-testid='portal-attachments']",
        );
        expect(areas.length).toBe(1);
      });
    });
  });

  // ── Filtering ──────────────────────────────────────────────────────

  describe("filtering", () => {
    it("filters messages by author direction", async () => {
      const ctx = buildDecryptContext();

      const messages = [
        makeMessage("From support", "to_client", ctx.keypairPublic),
        makeMessage("From client", "from_client", ctx.keypairPublic),
      ];

      const { container, rerender } = render(PortalThread, {
        props: {
          messages,
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
          filterAuthors: ["__client__"],
        },
      });

      await vi.waitFor(() => {
        const bubbles = container.querySelectorAll(
          "[data-testid='conversation-bubble']",
        );
        expect(bubbles.length).toBe(1);
      });

      // Only the sent (from_client) message should render
      expect(container.querySelector('[data-direction="sent"]')).toBeTruthy();
      expect(container.querySelector('[data-direction="received"]')).toBeNull();

      // Clear filters to see both again
      await rerender({
        messages,
        decryptMessage: ctx.decryptMessage,
        decryptAttachmentKey: ctx.decryptAttachmentKey,
        decryptAttachmentBlob: ctx.decryptAttachmentBlob,
        loading: false,
        filterAuthors: [],
      });

      await vi.waitFor(() => {
        const bubbles = container.querySelectorAll(
          "[data-testid='conversation-bubble']",
        );
        expect(bubbles.length).toBe(2);
      });
    });

    it("shows empty-filter state when all messages are filtered out", async () => {
      const ctx = buildDecryptContext();

      const messages = [
        makeMessage("From support only", "to_client", ctx.keypairPublic),
      ];

      const { queryByTestId } = render(PortalThread, {
        props: {
          messages,
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
          filterAuthors: ["__client__"],
        },
      });

      await vi.waitFor(() => {
        expect(queryByTestId("portal-filter-empty")).toBeTruthy();
      });
    });

    it("filters messages by date range", async () => {
      const ctx = buildDecryptContext();
      const old = "2024-01-01T12:00:00.000Z";
      const recent = "2024-06-15T12:00:00.000Z";

      const messages = [
        makeMessage("Old msg", "to_client", ctx.keypairPublic, null, old),
        makeMessage(
          "Recent msg",
          "from_client",
          ctx.keypairPublic,
          null,
          recent,
        ),
      ];

      const { container } = render(PortalThread, {
        props: {
          messages,
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
          filterDateFrom: new Date("2024-06-01"),
        },
      });

      await vi.waitFor(() => {
        const bubbles = container.querySelectorAll(
          "[data-testid='conversation-bubble']",
        );
        expect(bubbles.length).toBe(1);
      });
    });
  });

  // ── Call entries and voicemails (ADR-092) ──────────────────────────

  function makeCallEntry(
    source: string,
    callStatus: string | null,
    callDurationSeconds: number | null,
    createdAt: string = new Date().toISOString(),
  ): PortalCallEntry {
    messageSeq += 1;
    return {
      id: `ce-${String(messageSeq)}`,
      source,
      callStatus,
      callDurationSeconds,
      createdAt,
    };
  }

  function makeRecording(
    keypairPublic: Uint8Array,
    opts: {
      direction?: string;
      durationSeconds?: number | null;
      createdAt?: string;
    } = {},
  ): PortalRecordingWire {
    const fileKey = generateContentKey();
    const payload = encodeFileKeyPayload(fileKey, "");
    const sealed = eciesEncrypt(payload, toRistrettoPoint(keypairPublic));
    messageSeq += 1;

    return {
      recordingId: `rec-${String(messageSeq)}`,
      followupId: `fu-rec-${String(messageSeq)}`,
      direction: opts.direction ?? "to_client",
      durationSeconds: opts.durationSeconds ?? 30,
      ephemeralPoint: encode(sealed.ephemeralPoint),
      nonce: encode(sealed.nonce),
      ciphertext: encode(sealed.ciphertext),
      createdAt: opts.createdAt ?? new Date().toISOString(),
    };
  }

  describe("call entries and voicemails", () => {
    it("merges messages, voicemails, and call entries by createdAt", async () => {
      const ctx = buildDecryptContext();

      const t1 = "2024-06-01T10:00:00.000Z";
      const t2 = "2024-06-01T11:00:00.000Z";
      const t3 = "2024-06-01T12:00:00.000Z";

      const msg = makeMessage(
        "Hello",
        "to_client",
        ctx.keypairPublic,
        null,
        t1,
      );
      const call = makeCallEntry("client", "completed", 120, t2);
      const rec = makeRecording(ctx.keypairPublic, { createdAt: t3 });

      const { container } = render(PortalThread, {
        props: {
          messages: [msg],
          recordings: [rec],
          callEntries: [call],
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
        },
      });

      // All three entry kinds appear as bubbles, sorted by time
      await vi.waitFor(() => {
        const bubbles = container.querySelectorAll(
          "[data-testid='conversation-bubble']",
        );
        expect(bubbles.length).toBe(3);
      });

      // Verify each entry kind rendered
      const callEntries = container.querySelectorAll(
        "[data-testid='portal-call-entry']",
      );
      expect(callEntries.length).toBe(1);

      const voicemailEntries = container.querySelectorAll(
        "[data-testid='portal-voicemail-entry']",
      );
      expect(voicemailEntries.length).toBe(1);

      // The articles should be in time order (message, call, voicemail)
      const articles = container.querySelectorAll('[role="article"]');
      expect(articles.length).toBe(3);
    });

    it("renders call entry on the correct side based on source", async () => {
      const ctx = buildDecryptContext();

      const clientCall = makeCallEntry("client", "completed", 60);
      const orgCall = makeCallEntry("org", "no_answer", null);

      const { container } = render(PortalThread, {
        props: {
          messages: [],
          callEntries: [clientCall, orgCall],
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
        },
      });

      await vi.waitFor(() => {
        const entries = container.querySelectorAll(
          "[data-testid='portal-call-entry']",
        );
        expect(entries.length).toBe(2);
      });

      // source "client" renders sent, anything else renders received
      expect(container.querySelector('[data-direction="sent"]')).toBeTruthy();
      expect(
        container.querySelector('[data-direction="received"]'),
      ).toBeTruthy();
    });

    it("renders call entry with formatCallLabel output", async () => {
      const ctx = buildDecryptContext();

      const call = makeCallEntry("org", "completed", 90);

      const { container } = render(PortalThread, {
        props: {
          messages: [],
          callEntries: [call],
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
        },
      });

      await vi.waitFor(() => {
        const entry = container.querySelector(
          "[data-testid='portal-call-entry']",
        );
        expect(entry).toBeTruthy();
        // The call-entry component renders a status span with the label.
        // A completed outbound call (source != "client") shows duration.
        const text = entry?.textContent ?? "";
        expect(text.length).toBeGreaterThan(0);
      });
    });

    it("renders voicemail entry inside a received bubble", async () => {
      const ctx = buildDecryptContext();

      const rec = makeRecording(ctx.keypairPublic);

      const { container } = render(PortalThread, {
        props: {
          messages: [],
          recordings: [rec],
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
        },
      });

      await vi.waitFor(() => {
        const entry = container.querySelector(
          "[data-testid='portal-voicemail-entry']",
        );
        expect(entry).toBeTruthy();
      });

      // The wrapper uses display:contents, so the data-direction is on the
      // ConversationBubble element which is a child of the wrapper
      expect(
        container.querySelector('[data-direction="received"]'),
      ).toBeTruthy();
    });

    it("does not show empty state when only call entries exist", () => {
      const ctx = buildDecryptContext();

      const call = makeCallEntry("client", "completed", 45);

      const { queryByTestId } = render(PortalThread, {
        props: {
          messages: [],
          callEntries: [call],
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
        },
      });

      expect(queryByTestId("portal-empty-state")).toBeNull();
    });

    it("does not show empty state when only recordings exist", () => {
      const ctx = buildDecryptContext();

      const rec = makeRecording(ctx.keypairPublic);

      const { queryByTestId } = render(PortalThread, {
        props: {
          messages: [],
          recordings: [rec],
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
        },
      });

      expect(queryByTestId("portal-empty-state")).toBeNull();
    });
  });

  // ── Type filter behavior for call entries and voicemails ──────────

  describe("type filter with media entries", () => {
    it("hides call entries when any type filter is active", async () => {
      const ctx = buildDecryptContext();

      const msg = makeMessage("Hello", "to_client", ctx.keypairPublic);
      const call = makeCallEntry("client", "completed", 60);

      const { container, queryByTestId } = render(PortalThread, {
        props: {
          messages: [msg],
          callEntries: [call],
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
          filterTypes: ["message"],
        },
      });

      await vi.waitFor(() => {
        const bubbles = container.querySelectorAll(
          "[data-testid='conversation-bubble']",
        );
        // Only the message, not the call entry
        expect(bubbles.length).toBe(1);
      });

      expect(queryByTestId("portal-call-entry")).toBeNull();
    });

    it("shows voicemail entries under __files__ type filter", async () => {
      const ctx = buildDecryptContext();

      const rec = makeRecording(ctx.keypairPublic);

      const { container } = render(PortalThread, {
        props: {
          messages: [],
          recordings: [rec],
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
          filterTypes: ["__files__"],
        },
      });

      await vi.waitFor(() => {
        const entries = container.querySelectorAll(
          "[data-testid='portal-voicemail-entry']",
        );
        expect(entries.length).toBe(1);
      });
    });

    it("hides voicemail entries under message-only type filter", async () => {
      const ctx = buildDecryptContext();

      const msg = makeMessage("Hello", "to_client", ctx.keypairPublic);
      const rec = makeRecording(ctx.keypairPublic);

      const { container, queryByTestId } = render(PortalThread, {
        props: {
          messages: [msg],
          recordings: [rec],
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
          filterTypes: ["message"],
        },
      });

      await vi.waitFor(() => {
        const bubbles = container.querySelectorAll(
          "[data-testid='conversation-bubble']",
        );
        expect(bubbles.length).toBe(1);
      });

      expect(queryByTestId("portal-voicemail-entry")).toBeNull();
    });
  });

  // ── Search with non-message entries ───────────────────────────────

  describe("search with non-message entries", () => {
    it("search matches skip call entries and voicemails", async () => {
      const ctx = buildDecryptContext();

      const msg = makeMessage("findable text", "to_client", ctx.keypairPublic);
      const call = makeCallEntry("client", "completed", 60);
      const rec = makeRecording(ctx.keypairPublic);

      const matchedIds: string[][] = [];
      const { container } = render(PortalThread, {
        props: {
          messages: [msg],
          callEntries: [call],
          recordings: [rec],
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
          searchTerm: "findable",
          onmatches: (ids: readonly string[]) => {
            matchedIds.push([...ids]);
          },
        },
      });

      await vi.waitFor(() => {
        // Wait for decryption to complete
        const bubbles = container.querySelectorAll(
          "[data-testid='conversation-bubble']",
        );
        expect(bubbles.length).toBe(3);
      });

      // Only the message should match, never call entries or voicemails
      await vi.waitFor(() => {
        expect(matchedIds.length).toBeGreaterThan(0);
        const lastMatch = matchedIds[matchedIds.length - 1];
        expect(lastMatch).toBeDefined();
        expect(lastMatch!.length).toBe(1);
        expect(lastMatch![0]).toBe(msg.id);
      });
    });
  });

  // ── Email entry rendering ───────────────────────────────────────────

  describe("email entries", () => {
    it("renders an email_outbound entry with subject and formatted body", async () => {
      const ctx = buildDecryptContext();

      const emailMsg = makeEmailMessage(
        "Re: your appointment",
        "Please confirm your visit.",
        "to_client",
        ctx.keypairPublic,
      );

      const { container } = render(PortalThread, {
        props: {
          messages: [emailMsg],
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
        },
      });

      await vi.waitFor(() => {
        const subject = container.querySelector(
          "[data-testid='portal-email-subject']",
        );
        expect(subject).toBeTruthy();
        expect(subject!.textContent).toContain("Re: your appointment");
      });

      const body = container.querySelector("[data-testid='portal-email-body']");
      expect(body).toBeTruthy();
      expect(body!.textContent).toContain("Please confirm your visit.");
      // Body renders through the sanitized HTML pipeline (contains <p>)
      expect(body!.querySelector("p")).toBeTruthy();
    });

    it("falls back to plain text when email JSON is malformed", async () => {
      const ctx = buildDecryptContext();

      // Malformed: not a valid { subject, doc } structure
      const malformed = makeMessage(
        "This is not valid JSON email payload",
        "to_client",
        ctx.keypairPublic,
        null,
        new Date().toISOString(),
        "email_outbound",
      );

      const { container } = render(PortalThread, {
        props: {
          messages: [malformed],
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
        },
      });

      await vi.waitFor(() => {
        const bubbles = container.querySelectorAll(
          "[data-testid='conversation-bubble']",
        );
        expect(bubbles.length).toBe(1);
      });

      // Should render as plain text, not blank
      const bubble = container.querySelector(
        "[data-testid='conversation-bubble']",
      );
      expect(bubble!.textContent).toContain(
        "This is not valid JSON email payload",
      );

      // No email-specific elements
      expect(
        container.querySelector("[data-testid='portal-email-subject']"),
      ).toBeNull();
      expect(
        container.querySelector("[data-testid='portal-email-body']"),
      ).toBeNull();
    });

    it("does not affect non-email message entries", async () => {
      const ctx = buildDecryptContext();

      const plainMsg = makeMessage(
        "Regular message",
        "to_client",
        ctx.keypairPublic,
      );
      const emailMsg = makeEmailMessage(
        "Test subject",
        "Email body here.",
        "to_client",
        ctx.keypairPublic,
      );

      const { container } = render(PortalThread, {
        props: {
          messages: [plainMsg, emailMsg],
          decryptMessage: ctx.decryptMessage,
          decryptAttachmentKey: ctx.decryptAttachmentKey,
          decryptAttachmentBlob: ctx.decryptAttachmentBlob,
          loading: false,
        },
      });

      await vi.waitFor(() => {
        const bubbles = container.querySelectorAll(
          "[data-testid='conversation-bubble']",
        );
        expect(bubbles.length).toBe(2);
      });

      // Only one email subject element (from the email message)
      const subjects = container.querySelectorAll(
        "[data-testid='portal-email-subject']",
      );
      expect(subjects.length).toBe(1);

      // The regular message renders its text directly
      const firstBubble = container.querySelectorAll(
        "[data-testid='conversation-bubble']",
      )[0];
      expect(firstBubble!.textContent).toContain("Regular message");
    });
  });
});
