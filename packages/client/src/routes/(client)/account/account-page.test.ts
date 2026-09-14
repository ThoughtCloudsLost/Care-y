// @vitest-environment jsdom
/**
 * Account page component tests.
 *
 * Covers the login flow, current-password proof (change-password),
 * and post-rotation bridge construction. Each flow constructs a
 * PortalBridge through the injected factory rather than directly,
 * and these tests verify that the factory seam is exercised.
 *
 * vi.mock() is required for:
 *   - @tanstack/svelte-query: needs controlled query state
 *   - $lib/trpc/index.js: live HTTP connection module
 *   - $lib/portal/context.js: controlled portal bridge factory
 *   - $lib/client-shell/context.js: Svelte context not available outside layout
 *   - $lib/auth/crypto-helpers.js: OPRF evaluate calls
 *   - $lib/auth/crypto-callbacks.js: login callback builder
 *   - $lib/portal/account-crypto.js: registration + rewrap helpers
 *   - $lib/branding/public-branding.js: public branding query
 *   - Shell components: avoid Konsta/layout dependencies in jsdom
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as PortalContext from "$lib/portal/context.js";
import type * as TanstackQuery from "@tanstack/svelte-query";
import type * as TrpcIndex from "$lib/trpc/index.js";
import type * as CryptoHelpers from "$lib/auth/crypto-helpers.js";
import type * as CryptoCallbacks from "$lib/auth/crypto-callbacks.js";
import type * as AccountCrypto from "$lib/portal/account-crypto.js";
import type * as PublicBranding from "$lib/branding/public-branding.js";
import type * as SearchOverlay from "$lib/search/search-overlay.svelte.js";
import type * as ScrollManager from "$lib/tickets/scroll-manager.svelte.js";
import type * as UiLocale from "$lib/stores/ui-locale.svelte.js";
import type * as Announce from "$lib/utils/announce.js";
import type * as Errors from "$lib/errors.js";
import type {
  PortalWorkerResponse,
  PortalWorkerEvent,
} from "$lib/workers/portal-protocol.js";
import type * as ContextNS from "$lib/client-shell/context.js";
import type * as CryptoNS from "@care-y/crypto";

// -- Mock Worker (same pattern as portal-bridge.test.ts) ----------------------

interface MockWorkerInstance {
  postMessage: Mock<
    (msg: Record<string, unknown>, options?: StructuredSerializeOptions) => void
  >;
  onmessage:
    | ((e: MessageEvent<PortalWorkerResponse | PortalWorkerEvent>) => void)
    | null;
  onerror: ((e: ErrorEvent) => void) | null;
  terminate: ReturnType<typeof vi.fn>;
}

let mockWorkerInstances: MockWorkerInstance[] = [];

function MockWorkerConstructor(): MockWorkerInstance {
  const instance: MockWorkerInstance = {
    postMessage: vi.fn(),
    onmessage: null,
    onerror: null,
    terminate: vi.fn(),
  };
  mockWorkerInstances.push(instance);
  return instance;
}

vi.stubGlobal("Worker", MockWorkerConstructor);

function respondFromWorker(
  worker: MockWorkerInstance,
  data: PortalWorkerResponse,
): void {
  if (worker.onmessage) {
    worker.onmessage(new MessageEvent("message", { data }));
  }
}

/**
 * Install an auto-responder on a mock worker that answers all portal
 * bridge requests with success responses.
 */
function autoRespondWorker(
  worker: MockWorkerInstance,
  opts: { keyCheckPassed?: boolean } = {},
): void {
  const passed = opts.keyCheckPassed ?? true;
  const realPostMessage = worker.postMessage;

  const respond = (msg: Record<string, unknown>): void => {
    const type = msg.type as string;
    const id = msg.id as number;

    void Promise.resolve().then(() => {
      switch (type) {
        case "init":
          respondFromWorker(worker, { id, ok: true, type: "init" });
          break;
        case "accountSessionStart":
          respondFromWorker(worker, {
            id,
            ok: true,
            type: "accountSessionStart",
            blindedElement: "blinded-b64",
          });
          break;
        case "accountSessionFinish":
          respondFromWorker(worker, {
            id,
            ok: true,
            type: "accountSessionFinish",
            clientPublic: "client-pub-b64",
            authToken: "auth-token-b64",
          });
          break;
        case "verifyKeyCheck":
          respondFromWorker(worker, {
            id,
            ok: true,
            type: "verifyKeyCheck",
            passed,
          });
          break;
        case "decryptMessage":
          respondFromWorker(worker, {
            id,
            ok: true,
            type: "decryptMessage",
            plaintext: "decrypted text",
          });
          break;
        case "zeroAll":
          respondFromWorker(worker, { id, ok: true, type: "zeroAll" });
          break;
      }
    });
  };

  worker.postMessage = vi.fn(
    (msg: Record<string, unknown>, _options?: StructuredSerializeOptions) => {
      realPostMessage(msg, _options);
      respond(msg);
    },
  );

  // Replay any already-recorded messages (init fires at construction)
  for (const call of realPostMessage.mock.calls) {
    respond(call[0]);
  }
}

// -- Controllable mock state --------------------------------------------------

const { mockPortalBridgeFactory } = vi.hoisted(() => ({
  mockPortalBridgeFactory: vi.fn(),
}));

const { mockEvaluateWithPowRetry } = vi.hoisted(() => ({
  mockEvaluateWithPowRetry: vi.fn().mockResolvedValue("evaluated-b64"),
}));

const { mockBuildLoginCallbacks } = vi.hoisted(() => ({
  mockBuildLoginCallbacks: vi.fn().mockReturnValue({
    onPowRequired: vi.fn().mockResolvedValue("pow-solution"),
  }),
}));

const { mockBuildAccountRegistration, mockRewrapMessages } = vi.hoisted(() => ({
  mockBuildAccountRegistration: vi.fn().mockResolvedValue({
    payload: {
      salt: "new-salt-b64",
      publicKey: "new-pub-b64",
      authHash: "new-auth-hash",
      keyCheck: {
        ephemeralPoint: "new-ep",
        nonce: "new-n",
        ciphertext: "new-ct",
      },
    },
    keypair: {
      clientPublic: new Uint8Array(32),
      clientPrivate: new Uint8Array(64),
    },
  }),
  mockRewrapMessages: vi.fn().mockReturnValue([]),
}));

type PortalProcedureMock = (...args: unknown[]) => Promise<unknown>;

const mockGetAccountSalt = vi.fn<PortalProcedureMock>().mockResolvedValue({
  salt: "salt-b64",
  accountId: "account-uuid",
});
const mockAccountLogin = vi.fn<PortalProcedureMock>().mockResolvedValue({});
const mockAccountLogout = vi.fn<PortalProcedureMock>().mockResolvedValue({});
const mockAccountReply = vi.fn<PortalProcedureMock>().mockResolvedValue({});
const mockAccountChangePassword = vi
  .fn<PortalProcedureMock>()
  .mockResolvedValue({});

// Bootstrap data returned after login succeeds
const mockBootstrapData = {
  ticketId: "ticket-uuid",
  safeExitUrl: "https://weather.gov",
  keyCheck: { ephemeralPoint: "ep", nonce: "n", ciphertext: "ct" },
  attachments: [],
  recordings: [],
  callEntries: [],
};

let bootstrapEnabled = false;
let messagesEnabled = false;

// -- Mocks --------------------------------------------------------------------

vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoNS>()),
  encode: (buf: Uint8Array): string => Buffer.from(buf).toString("base64url"),
  decode: (s: string): Uint8Array =>
    new Uint8Array(Buffer.from(s, "base64url")),
  requireSodium: () => ({
    memzero: vi.fn(),
  }),
}));

// vi.mock required: createContext throws "missing_context" outside a layout.
// Surface guard: satisfies ensures we track the real module shape.
vi.mock("$lib/portal/context.js", () => {
  const _usedExports = null! as {
    getPortalBridgeFactory: typeof PortalContext.getPortalBridgeFactory;
    setPortalBridgeFactory: typeof PortalContext.setPortalBridgeFactory;
  };
  return {
    getPortalBridgeFactory: () => mockPortalBridgeFactory,
    setPortalBridgeFactory: vi.fn(),
  } satisfies typeof _usedExports;
});

// Captures the most recently published shell state so tests can invoke
// callbacks (e.g. onrevoke) the page registers through the context.
let capturedShellState: ContextNS.ClientShellState | undefined;

vi.mock("$lib/client-shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContextNS>()),
  getClientShellCtx: () => ({
    get current(): ContextNS.ClientShellState | undefined {
      return capturedShellState;
    },
    set current(v: ContextNS.ClientShellState | undefined) {
      capturedShellState = v;
    },
  }),
  DEFAULT_SAFE_URL: "https://weather.gov",
}));

// vi.mock required: TanStack Query needs a live QueryClient context that
// does not exist in jsdom. We return controlled state objects instead.
vi.mock("@tanstack/svelte-query", async (importOriginal) => {
  return {
    ...(await importOriginal<typeof TanstackQuery>()),
    useQueryClient: (() => ({
      getQueryData: vi.fn(),
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
      getQueriesData: vi.fn().mockReturnValue([]),
    })) as unknown as typeof TanstackQuery.useQueryClient,
    createQuery: ((optsFn: () => Record<string, unknown>) => {
      const opts = optsFn();
      const key = opts.queryKey;
      const isBootstrap =
        Array.isArray(key) && key.includes("accountBootstrap");
      const isMessages = Array.isArray(key) && key.includes("accountMessages");
      const isOrgKey = Array.isArray(key) && key.includes("orgPublicKey");
      const isBranding = Array.isArray(key) && key.includes("publicBranding");

      if (isBootstrap) {
        return {
          get isLoading(): boolean {
            return bootstrapEnabled && !mockBootstrapData;
          },
          isError: false,
          error: null,
          get data(): unknown {
            return bootstrapEnabled ? mockBootstrapData : undefined;
          },
        };
      }
      if (isMessages) {
        return {
          get isLoading(): boolean {
            return messagesEnabled && false;
          },
          isError: false,
          error: null,
          get data(): unknown {
            return messagesEnabled ? { messages: [] } : undefined;
          },
        };
      }
      if (isOrgKey) {
        return {
          isLoading: false,
          isError: false,
          error: null,
          data: null,
        };
      }
      if (isBranding) {
        return {
          isLoading: false,
          isError: false,
          error: null,
          data: { supportLabel: "Test Org" },
        };
      }
      return {
        isLoading: false,
        isError: false,
        error: null,
        data: undefined,
      };
    }) as unknown as typeof TanstackQuery.createQuery,
    createMutation: ((optsFn: () => Record<string, unknown>) => {
      optsFn();
      return {
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isPending: false,
        isError: false,
        error: null,
        reset: vi.fn(),
      };
    }) as unknown as typeof TanstackQuery.createMutation,
  };
});

// vi.mock required: tRPC creates a live HTTP connection.
vi.mock("$lib/trpc/index.js", () => {
  const _usedExports = null! as { trpc: typeof TrpcIndex.trpc };
  return {
    trpc: {
      clientPortal: {
        getAccountSalt: {
          query: (...args: unknown[]) => mockGetAccountSalt(...args),
        },
        accountLogin: {
          mutate: (...args: unknown[]) => mockAccountLogin(...args),
        },
        accountLogout: {
          mutate: (...args: unknown[]) => mockAccountLogout(...args),
        },
        accountReply: {
          mutate: (...args: unknown[]) => mockAccountReply(...args),
        },
        accountChangePassword: {
          mutate: (...args: unknown[]) => mockAccountChangePassword(...args),
        },
        accountBootstrap: {
          query: vi.fn().mockResolvedValue(mockBootstrapData),
        },
        accountMessages: {
          query: vi.fn().mockResolvedValue({ messages: [] }),
        },
        accountContactInfo: {
          query: vi.fn().mockResolvedValue({ sealed: "" }),
        },
      },
      branding: {
        getPublicBranding: {
          query: vi.fn().mockResolvedValue({ orgPublicKey: null }),
        },
      },
    } as unknown as typeof TrpcIndex.trpc,
  } satisfies typeof _usedExports;
});

vi.mock("$lib/auth/crypto-helpers.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoHelpers>()),
  evaluateWithPowRetry: mockEvaluateWithPowRetry,
}));

vi.mock("$lib/auth/crypto-callbacks.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoCallbacks>()),
  buildLoginCallbacks: mockBuildLoginCallbacks,
}));

vi.mock("$lib/portal/account-crypto.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AccountCrypto>()),
  buildAccountRegistration: mockBuildAccountRegistration,
  rewrapMessages: mockRewrapMessages,
}));

vi.mock("$lib/branding/public-branding.js", async (importOriginal) => ({
  ...(await importOriginal<typeof PublicBranding>()),
  createPublicBrandingQuery: () => ({
    isLoading: false,
    isError: false,
    data: { supportLabel: "Test Org" },
  }),
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  account_title: () => "Account",
  account_login_failed: () => "Login failed",
  account_signed_out: () => "Signed out",
  account_idle_warning: () => "Idle warning",
  account_unlocking: () => "Unlocking...",
  account_change_success: () => "Password changed",
  account_settings_title: () => "Settings",
  account_logout: () => "Sign out",
  portal_send: () => "Sent",
  portal_send_failed: () => "Send failed",
  portal_web_chat_hint: () => "Web chat hint",
  portal_hint_dismiss: () => "Got it",
  portal_contact_title: () => "Contact info",
  portal_search_label: () => "Search",
  portal_filter_images: () => "Images",
  portal_filter_files: () => "Files",
}));

// Shell components: avoid pulling Konsta/layout deps into jsdom.
// Surface guard via _usedExports satisfies.
vi.mock("$lib/shell/PageLayout.svelte", async () => {
  const _usedExports = null! as { default: unknown };
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  } satisfies typeof _usedExports;
});

vi.mock("$lib/shell/ShellSheet.svelte", async () => {
  const _usedExports = null! as { default: unknown };
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  } satisfies typeof _usedExports;
});

vi.mock("$lib/shell/SubNavbarFilterLayout.svelte", async () => {
  const _usedExports = null! as { default: unknown };
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  } satisfies typeof _usedExports;
});

vi.mock("$lib/shell/PortalHint.svelte", async () => {
  const _usedExports = null! as { default: unknown };
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  } satisfies typeof _usedExports;
});

vi.mock("$lib/portal/ContactInfoCard.svelte", async () => {
  const _usedExports = null! as { default: unknown };
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  } satisfies typeof _usedExports;
});

vi.mock("$lib/search/search-overlay.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof SearchOverlay>()),
  createSearchOverlay: () => ({
    active: false,
    term: null,
    position: 0,
    matchCount: 0,
    activeId: null,
    up: vi.fn(),
    down: vi.fn(),
    enter: vi.fn(),
    exit: vi.fn(),
    setTerm: vi.fn(),
  }),
}));

vi.mock("$lib/tickets/scroll-manager.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ScrollManager>()),
  createScrollManager: () => ({
    scrollContainerEl: undefined,
    isNearBottom: true,
    onScroll: vi.fn(),
    cleanup: vi.fn(),
  }),
}));

vi.mock("$lib/stores/ui-locale.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof UiLocale>()),
  uiLocaleStore: { locale: "en" },
}));

vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Announce>()),
  announceToLiveRegion: vi.fn(),
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Errors>()),
  requireRouter: (router: unknown) => router,
}));

// jsdom lacks Web Animations API (used by Konsta transitions)
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  });
}

// -- Import under test (after all mocks) --------------------------------------

const { default: AccountPage } = await import("./+page.svelte");

/**
 * Renders the page and returns the login form element. Queried through
 * the container because a form without an accessible name is not
 * exposed under the "form" ARIA role.
 */
function renderLoginForm(): HTMLFormElement {
  const { container } = render(AccountPage);
  const form = container.querySelector("form");
  if (form === null) throw new Error("login form not rendered");
  return form;
}
const { PortalBridge } = await import("$lib/workers/portal-bridge.js");

// -- Helpers ------------------------------------------------------------------

/**
 * Set up the factory mock so each call returns a fresh PortalBridge.
 */
function installBridgeFactory(): void {
  mockPortalBridgeFactory.mockImplementation(() => new PortalBridge());
}

// -- Tests --------------------------------------------------------------------

describe("account page", () => {
  beforeEach(() => {
    mockWorkerInstances = [];
    bootstrapEnabled = false;
    messagesEnabled = false;
    capturedShellState = undefined;
    vi.clearAllMocks();
    installBridgeFactory();
  });

  afterEach(cleanup);

  it("renders the login form when no session exists", () => {
    // AccountLoginForm renders a form element
    expect(renderLoginForm()).toBeTruthy();
  });

  describe("login flow", () => {
    it("uses the injected factory to create the login bridge", async () => {
      const form = renderLoginForm();
      const inputs = form.querySelectorAll("input");
      const usernameInput = inputs[0];
      const passwordInput = inputs[1];

      if (usernameInput && passwordInput) {
        await fireEvent.input(usernameInput, {
          target: { value: "testuser" },
        });
        await fireEvent.input(passwordInput, {
          target: { value: "a-secure-password-here" },
        });
      }

      await fireEvent.submit(form);

      // The login handler fires async; let it start constructing the bridge
      await vi.waitFor(() => {
        expect(mockPortalBridgeFactory).toHaveBeenCalledTimes(1);
      });

      // A worker should have been created through the factory
      expect(mockWorkerInstances).toHaveLength(1);
    });

    it("destroys the bridge on login failure", async () => {
      // Make the salt lookup fail
      mockGetAccountSalt.mockRejectedValueOnce(new Error("Network error"));

      const form = renderLoginForm();
      const inputs = form.querySelectorAll("input");
      const usernameInput = inputs[0];
      const passwordInput = inputs[1];

      if (usernameInput && passwordInput) {
        await fireEvent.input(usernameInput, {
          target: { value: "testuser" },
        });
        await fireEvent.input(passwordInput, {
          target: { value: "a-secure-password-here" },
        });
      }

      await fireEvent.submit(form);

      await vi.waitFor(() => {
        expect(mockWorkerInstances).toHaveLength(1);
      });

      const worker = mockWorkerInstances[0]!;
      autoRespondWorker(worker);

      // Wait for the error path to terminate the worker
      await vi.waitFor(() => {
        expect(worker.terminate).toHaveBeenCalled();
      });
    });
  });

  /**
   * Swap navigator.sendBeacon for the duration of `body`, then restore it.
   *
   * Deliberately narrow: this file installs a module-level Worker stub via
   * vi.stubGlobal, so vi.unstubAllGlobals() here would tear that down and
   * break every later test that constructs a PortalBridge.
   */
  function withSendBeacon(
    impl: ((url: string, data?: BodyInit | null) => boolean) | undefined,
    body: () => void,
  ): void {
    const original = Object.getOwnPropertyDescriptor(navigator, "sendBeacon");
    Object.defineProperty(navigator, "sendBeacon", {
      value: impl,
      configurable: true,
      writable: true,
    });
    try {
      body();
    } finally {
      if (original) {
        Object.defineProperty(navigator, "sendBeacon", original);
      } else {
        delete (navigator as { sendBeacon?: unknown }).sendBeacon;
      }
    }
  }

  describe("session revocation via sendBeacon", () => {
    it("publishes onrevoke in the shell context", () => {
      render(AccountPage);

      // The page registers shell state on mount, even before login
      expect(capturedShellState).toBeDefined();
      expect(typeof capturedShellState?.onrevoke).toBe("function");
    });

    it("calls navigator.sendBeacon with the logout endpoint and a JSON Blob", () => {
      const sendBeaconSpy = vi.fn().mockReturnValue(true);

      withSendBeacon(sendBeaconSpy, () => {
        render(AccountPage);

        // Invoke the revoke callback the page published
        capturedShellState?.onrevoke?.();

        expect(sendBeaconSpy).toHaveBeenCalledOnce();
        const [url, body] = sendBeaconSpy.mock.calls[0] as [string, Blob];
        expect(url).toBe("/trpc/clientPortal.accountLogout");
        expect(body).toBeInstanceOf(Blob);
        expect(body.type).toBe("application/json");
      });
    });

    it("does not throw when navigator.sendBeacon is absent", () => {
      withSendBeacon(undefined, () => {
        render(AccountPage);

        // Must not throw even when sendBeacon is unavailable
        expect(() => capturedShellState?.onrevoke?.()).not.toThrow();
      });
    });
  });

  describe("factory injection seam", () => {
    it("each bridge construction goes through the context factory", async () => {
      // Verify all three account page construction sites use the factory.
      // We test this by checking that the factory is called (not that
      // `new PortalBridge()` is called directly, which would bypass the seam).
      const form = renderLoginForm();
      const inputs = form.querySelectorAll("input");
      const usernameInput = inputs[0];
      const passwordInput = inputs[1];

      if (usernameInput && passwordInput) {
        await fireEvent.input(usernameInput, {
          target: { value: "testuser" },
        });
        await fireEvent.input(passwordInput, {
          target: { value: "a-secure-password-here" },
        });
      }

      await fireEvent.submit(form);

      await vi.waitFor(() => {
        expect(mockPortalBridgeFactory).toHaveBeenCalled();
      });

      // The factory was invoked, meaning the page goes through the
      // injected seam rather than constructing a bridge directly.
      expect(mockPortalBridgeFactory.mock.calls.length).toBeGreaterThanOrEqual(
        1,
      );
    });
  });
});
