/**
 * Shared vi.mock() factory for $lib/utils/haptic.js.
 *
 * Usage (the importOriginal call stays in the test file so the factory
 * is typed against the real module surface):
 *
 *   import type * as HapticNS from "$lib/utils/haptic.js";
 *   vi.mock("$lib/utils/haptic.js", async (importOriginal) =>
 *     (await import("$lib/../test-mocks/haptic.js")).hapticMock(
 *       await importOriginal<typeof HapticNS>(),
 *     ));
 *
 * Assert on `mockHaptic` (import it from this module); reset happens via
 * each file's vi.clearAllMocks() or mockHaptic.mockClear().
 */

import { vi, type Mock } from "vitest";
import type * as HapticNS from "$lib/utils/haptic.js";

export const mockHaptic: Mock<typeof HapticNS.haptic> = vi.fn();

export function hapticMock(original: typeof HapticNS): typeof HapticNS {
  return { ...original, haptic: mockHaptic };
}
