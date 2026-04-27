// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

let mockOrgKeyLoaded = true;
let mockWrappedKeyData: unknown = {
  ephemeralPoint: "a",
  wrappedKey: "b",
  nonce: "c",
};
const mockOnrotate = vi.fn();
const mockOnexport = vi.fn();

vi.mock("$lib/paraglide/messages.js", () => ({
  admin_keys_org_key_loaded: () => "Organization key loaded",
  admin_keys_org_key_missing: () => "Organization key not configured",
  admin_keys_explainer: () => "Your organization key encrypts shared data.",
  admin_keys_rotate_button: () => "Rotate Org Key",
  admin_keys_export_button: () => "Export Escrow File",
  admin_rotation_dialog_why: () => "Rotate your key if a team member leaves.",
}));

vi.mock("$lib/crypto/context.js", () => ({
  getOrgKeyManager: () => ({
    get isLoaded() {
      return mockOrgKeyLoaded;
    },
  }),
}));

vi.mock("@tanstack/svelte-query", () => ({
  createQuery: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    void opts;
    return {
      get data() {
        return mockWrappedKeyData;
      },
      get isLoading() {
        return false;
      },
      get isError() {
        return false;
      },
    };
  },
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    keys: {
      getWrappedOrgKey: {
        query: vi.fn().mockResolvedValue(null),
      },
    },
  },
}));

import KeyStatus from "./KeyStatus.svelte";

describe("KeyStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrgKeyLoaded = true;
    mockWrappedKeyData = { ephemeralPoint: "a", wrappedKey: "b", nonce: "c" };
  });

  afterEach(cleanup);

  it("shows loaded state when org key exists and is loaded locally", () => {
    render(KeyStatus, { onrotate: mockOnrotate, onexport: mockOnexport });
    expect(screen.getByText("Organization key loaded")).toBeTruthy();
  });

  it("shows missing state when server has no wrapped key", () => {
    mockWrappedKeyData = null;
    render(KeyStatus, { onrotate: mockOnrotate, onexport: mockOnexport });
    expect(screen.getByText("Organization key not configured")).toBeTruthy();
  });

  it("shows missing state when client has not loaded the key", () => {
    mockOrgKeyLoaded = false;
    render(KeyStatus, { onrotate: mockOnrotate, onexport: mockOnexport });
    expect(screen.getByText("Organization key not configured")).toBeTruthy();
  });

  it("renders explainer text", () => {
    render(KeyStatus, { onrotate: mockOnrotate, onexport: mockOnexport });
    expect(
      screen.getByText("Your organization key encrypts shared data."),
    ).toBeTruthy();
  });

  it("renders rotate button", () => {
    render(KeyStatus, { onrotate: mockOnrotate, onexport: mockOnexport });
    expect(screen.getByText("Rotate Org Key")).toBeTruthy();
  });
});
