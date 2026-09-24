// @vitest-environment jsdom
/**
 * Tests for the shared preferred locale persistence helper.
 *
 * vi.mock() is required for:
 *   - $lib/trpc/index.js: controls tRPC mutation behavior in tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import type * as TrpcIndex from "$lib/trpc/index.js";

const { mockMutate } = vi.hoisted(() => ({
  mockMutate: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcIndex>()),
  trpc: {
    profile: {
      updatePreferredLocale: { mutate: mockMutate },
    },
  },
}));

import { savePreferredLocale } from "./preferred-locale.js";

describe("savePreferredLocale", () => {
  const mockOrgKeyManager = {
    isLoaded: true,
    encryptText: vi.fn().mockResolvedValue("encrypted-locale-b64"),
  };
  const orgKeyManager = mockOrgKeyManager as unknown as Parameters<
    typeof savePreferredLocale
  >[0];

  beforeEach(() => {
    mockMutate.mockClear();
    mockOrgKeyManager.encryptText.mockClear();
  });

  it("encrypts the locale and calls the mutation", async () => {
    await savePreferredLocale(orgKeyManager, "es");

    expect(mockOrgKeyManager.encryptText).toHaveBeenCalledWith("es");
    expect(mockMutate).toHaveBeenCalledWith({
      encryptedPreferredLocale: "encrypted-locale-b64",
    });
  });

  it("propagates encryption errors", async () => {
    mockOrgKeyManager.encryptText.mockRejectedValueOnce(
      new Error("encrypt failed"),
    );

    await expect(savePreferredLocale(orgKeyManager, "en")).rejects.toThrow(
      "encrypt failed",
    );

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("propagates mutation errors", async () => {
    mockMutate.mockRejectedValueOnce(new Error("network error"));

    await expect(savePreferredLocale(orgKeyManager, "en")).rejects.toThrow(
      "network error",
    );
  });
});
