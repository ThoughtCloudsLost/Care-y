import { describe, it, expect, vi } from "vitest";
import { followupSlot } from "@care-y/crypto";
import { DECRYPT_ERROR_SENTINEL } from "./async-decrypt-cache.js";
import {
  createTicketDecryptScope,
  type TicketDecryptScopeDeps,
} from "./ticket-decrypt-scope.js";
import type {
  TicketDecryptCache,
  TicketKeyWrap,
} from "./ticket-decrypt-cache.js";
import type { FollowUpDecryptCache } from "./follow-up-decrypt-cache.js";
import type { OrgDecryptCache } from "./org-decrypt-cache.js";
import type { OrgKeyManager } from "./org-key.js";

const TICKET_ID = "ticket-001";
const FOLLOW_UP_ID = "fu-001";
const USER_ID = "user-001";
const ENCRYPTED_TITLE = "enc-title-base64";
const ENCRYPTED_CONTENT = "enc-content-base64";
const ENCRYPTED_NAME = "AQID";

const KEY_WRAP: TicketKeyWrap = {
  ephemeralPoint: "ep-base64",
  nonce: "nonce-base64",
  wrappedKey: "wk-base64",
};

function createMocks(overrides?: {
  titleReturn?: string | undefined;
  contentReturn?: string | undefined;
  orgReturn?: string | null;
  isLoaded?: boolean;
}): TicketDecryptScopeDeps & {
  mocks: Record<string, ReturnType<typeof vi.fn>>;
} {
  const decryptTitle = vi.fn<() => string | undefined>();
  decryptTitle.mockReturnValue(overrides?.titleReturn);

  const decryptContent = vi.fn<() => string | undefined>();
  decryptContent.mockReturnValue(overrides?.contentReturn);

  const orgDecrypt = vi.fn<() => string | null>();
  orgDecrypt.mockReturnValue(overrides?.orgReturn ?? null);

  return {
    ticketCache: { decryptTitle } as unknown as TicketDecryptCache,
    followUpCache: { decryptContent } as unknown as FollowUpDecryptCache,
    orgCache: {
      decrypt: orgDecrypt,
      isFailed: () => false,
    } as unknown as OrgDecryptCache,
    orgKeyManager: {
      get isLoaded() {
        return overrides?.isLoaded ?? false;
      },
    } as OrgKeyManager,
    ticketId: TICKET_ID,
    keyWrap: KEY_WRAP,
    mocks: { decryptTitle, decryptContent, orgDecrypt },
  };
}

describe("TicketDecryptScope", () => {
  describe("title()", () => {
    it("delegates to ticketCache.decryptTitle with bound ticketId and keyWrap", () => {
      const deps = createMocks({ titleReturn: undefined });
      const scope = createTicketDecryptScope(deps);

      scope.title(ENCRYPTED_TITLE);

      expect(deps.mocks.decryptTitle).toHaveBeenCalledOnce();
      expect(deps.mocks.decryptTitle).toHaveBeenCalledWith(
        TICKET_ID,
        KEY_WRAP,
        ENCRYPTED_TITLE,
      );
    });

    it("returns loading when cache returns undefined", () => {
      const deps = createMocks({ titleReturn: undefined });
      const scope = createTicketDecryptScope(deps);

      const result = scope.title(ENCRYPTED_TITLE);
      expect(result.status).toBe("loading");
    });

    it("returns ready when cache returns plaintext", () => {
      const deps = createMocks({ titleReturn: "My Ticket" });
      const scope = createTicketDecryptScope(deps);

      const result = scope.title(ENCRYPTED_TITLE);
      expect(result).toEqual({ status: "ready", value: "My Ticket" });
    });

    it("returns error when cache returns sentinel", () => {
      const deps = createMocks({ titleReturn: DECRYPT_ERROR_SENTINEL });
      const scope = createTicketDecryptScope(deps);

      const result = scope.title(ENCRYPTED_TITLE);
      expect(result.status).toBe("error");
    });
  });

  describe("followUp()", () => {
    it("delegates to followUpCache.decryptContent with bound keyWrap", () => {
      const deps = createMocks({ contentReturn: undefined });
      const scope = createTicketDecryptScope(deps);

      scope.followUp(FOLLOW_UP_ID, ENCRYPTED_CONTENT);

      expect(deps.mocks.decryptContent).toHaveBeenCalledOnce();
      expect(deps.mocks.decryptContent).toHaveBeenCalledWith(
        FOLLOW_UP_ID,
        TICKET_ID,
        followupSlot(FOLLOW_UP_ID),
        KEY_WRAP,
        ENCRYPTED_CONTENT,
        undefined,
      );
    });

    it("passes rewrapContext when followUpKeyWrap is provided", () => {
      const deps = createMocks({ contentReturn: undefined });
      const scope = createTicketDecryptScope(deps);
      const fuKeyWrap: TicketKeyWrap = {
        ephemeralPoint: "fu-ep",
        nonce: "fu-nonce",
        wrappedKey: "fu-wk",
      };

      scope.followUp(FOLLOW_UP_ID, ENCRYPTED_CONTENT, fuKeyWrap);

      expect(deps.mocks.decryptContent).toHaveBeenCalledWith(
        FOLLOW_UP_ID,
        TICKET_ID,
        followupSlot(FOLLOW_UP_ID),
        KEY_WRAP,
        ENCRYPTED_CONTENT,
        { followUpKeyWrap: fuKeyWrap, ticketId: TICKET_ID },
      );
    });

    it("omits rewrapContext when followUpKeyWrap is null", () => {
      const deps = createMocks({ contentReturn: undefined });
      const scope = createTicketDecryptScope(deps);

      scope.followUp(FOLLOW_UP_ID, ENCRYPTED_CONTENT, null);

      expect(deps.mocks.decryptContent).toHaveBeenCalledWith(
        FOLLOW_UP_ID,
        TICKET_ID,
        followupSlot(FOLLOW_UP_ID),
        KEY_WRAP,
        ENCRYPTED_CONTENT,
        undefined,
      );
    });

    it("returns loading when cache returns undefined", () => {
      const deps = createMocks({ contentReturn: undefined });
      const scope = createTicketDecryptScope(deps);

      const result = scope.followUp(FOLLOW_UP_ID, ENCRYPTED_CONTENT);
      expect(result.status).toBe("loading");
    });

    it("returns ready when cache returns plaintext", () => {
      const deps = createMocks({ contentReturn: "Follow-up content" });
      const scope = createTicketDecryptScope(deps);

      const result = scope.followUp(FOLLOW_UP_ID, ENCRYPTED_CONTENT);
      expect(result).toEqual({ status: "ready", value: "Follow-up content" });
    });

    it("returns error when cache returns sentinel", () => {
      const deps = createMocks({ contentReturn: DECRYPT_ERROR_SENTINEL });
      const scope = createTicketDecryptScope(deps);

      const result = scope.followUp(FOLLOW_UP_ID, ENCRYPTED_CONTENT);
      expect(result.status).toBe("error");
    });
  });

  describe("volunteerName()", () => {
    it("delegates to orgCache.decrypt", () => {
      const deps = createMocks({ orgReturn: null, isLoaded: false });
      const scope = createTicketDecryptScope(deps);

      scope.volunteerName(USER_ID, ENCRYPTED_NAME);

      expect(deps.mocks.orgDecrypt).toHaveBeenCalledOnce();
      expect(deps.mocks.orgDecrypt).toHaveBeenCalledWith(
        USER_ID,
        ENCRYPTED_NAME,
      );
    });

    it("returns loading when org key is not loaded", () => {
      const deps = createMocks({ orgReturn: null, isLoaded: false });
      const scope = createTicketDecryptScope(deps);

      const result = scope.volunteerName(USER_ID, ENCRYPTED_NAME);
      expect(result.status).toBe("loading");
    });

    it("returns loading when org key is loaded but decrypt returns null (pending microtask)", () => {
      const deps = createMocks({ orgReturn: null, isLoaded: true });
      const scope = createTicketDecryptScope(deps);

      const result = scope.volunteerName(USER_ID, ENCRYPTED_NAME);
      expect(result.status).toBe("loading");
    });

    it("returns ready when decrypt succeeds", () => {
      const deps = createMocks({ orgReturn: "Jane Doe", isLoaded: true });
      const scope = createTicketDecryptScope(deps);

      const result = scope.volunteerName(USER_ID, ENCRYPTED_NAME);
      expect(result).toEqual({ status: "ready", value: "Jane Doe" });
    });

    it("handles null encryptedName (org cache returns null for null data)", () => {
      const deps = createMocks({ orgReturn: null, isLoaded: true });
      const scope = createTicketDecryptScope(deps);

      const result = scope.volunteerName(USER_ID, null);
      expect(result.status).toBe("loading");
    });
  });

  describe("keyWrap: null (no access)", () => {
    it("returns denied for title when keyWrap is null", () => {
      const deps = createMocks({ titleReturn: DECRYPT_ERROR_SENTINEL });
      deps.keyWrap = null;
      const scope = createTicketDecryptScope(deps);

      const result = scope.title(ENCRYPTED_TITLE);
      expect(result.status).toBe("denied");
    });

    it("returns denied for followUp when keyWrap is null", () => {
      const deps = createMocks({ contentReturn: undefined });
      deps.keyWrap = null;
      const scope = createTicketDecryptScope(deps);

      const result = scope.followUp(FOLLOW_UP_ID, ENCRYPTED_CONTENT);
      expect(result.status).toBe("denied");
    });

    it("volunteerName is unaffected by keyWrap (uses org cache)", () => {
      const deps = createMocks({ orgReturn: "Jane Doe", isLoaded: true });
      deps.keyWrap = null;
      const scope = createTicketDecryptScope(deps);

      const result = scope.volunteerName(USER_ID, ENCRYPTED_NAME);
      expect(result).toEqual({ status: "ready", value: "Jane Doe" });
    });

    it("hasAccess is false when keyWrap is null", () => {
      const deps = createMocks();
      deps.keyWrap = null;
      const scope = createTicketDecryptScope(deps);

      expect(scope.hasAccess).toBe(false);
    });
  });

  describe("hasAccess", () => {
    it("is true when keyWrap is present", () => {
      const deps = createMocks();
      const scope = createTicketDecryptScope(deps);

      expect(scope.hasAccess).toBe(true);
    });
  });
});
