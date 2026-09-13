/**
 * Shared vi.mock() factory for $lib/utils/announce.js.
 *
 *   import type * as AnnounceNS from "$lib/utils/announce.js";
 *   vi.mock("$lib/utils/announce.js", async (importOriginal) =>
 *     (await import("$lib/../test-mocks/announce.js")).announceMock(
 *       await importOriginal<typeof AnnounceNS>(),
 *     ));
 *
 * Assert on `mockAnnounce`. Note announce.test.ts exercises the real
 * implementation and must never route through this mock.
 */

import { vi, type Mock } from "vitest";
import type * as AnnounceNS from "$lib/utils/announce.js";

export const mockAnnounce: Mock<typeof AnnounceNS.announceToLiveRegion> =
  vi.fn();

export function announceMock(original: typeof AnnounceNS): typeof AnnounceNS {
  return { ...original, announceToLiveRegion: mockAnnounce };
}
