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
});
