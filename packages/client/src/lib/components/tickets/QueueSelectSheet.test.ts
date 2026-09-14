// @vitest-environment jsdom
/**
 * QueueSelectSheet: renders decrypted queue options with appearance glyphs
 * and fires onselect with the chosen queue id.
 *
 * Heavy mocking: trpc, org decrypt cache, query client, and ShellSheet.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import type { ComponentProps } from "svelte";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import type * as SvelteQuery from "@tanstack/svelte-query";
import QueueSelectSheet from "./QueueSelectSheet.svelte";
import type * as ParaglideMessages from "$lib/paraglide/messages.js";
import type * as ShellSheetModule from "$lib/shell/ShellSheet.svelte";
import type * as TrpcIndex from "$lib/trpc/index.js";
import type * as CryptoContext from "$lib/crypto/context.js";
import type * as LibErrors from "$lib/errors.js";
import type * as QueueAppearanceModule from "$lib/utils/queue-appearance.js";
import type * as QueueGlyphModule from "$lib/components/shared/QueueGlyph.svelte";
import type * as InlineSkeletonModule from "$lib/components/InlineSkeleton.svelte";

// Hoisted: the trpc mock factory below runs before module-level consts
// are initialised, so this cannot be a plain top-level binding.
const { mockQueues } = vi.hoisted(() => ({
  mockQueues: [
    {
      id: "q-1",
      encryptedName: "enc-general",
      encryptedColor: "enc-blue",
      encryptedIcon: "enc-folder",
    },
    {
      id: "q-2",
      encryptedName: "enc-urgent",
      encryptedColor: "enc-red",
      encryptedIcon: "enc-alert",
    },
  ],
}));

const mockDecryptMap = new Map<string, string>([
  ["queue:q-1", "General"],
  ["queue:q-2", "Urgent Line"],
  ["queue-color:q-1", "blue"],
  ["queue-icon:q-1", "folder"],
  ["queue-color:q-2", "red"],
  ["queue-icon:q-2", "alert-triangle"],
]);

// Stub the query rather than standing up a real QueryClient, matching the
// approach in TicketContentEditSheet.test.ts. The component reads only
// `.data` off the result.
vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQuery>()),
  createQuery: () => ({
    isLoading: false,
    isError: false,
    error: null,
    data: mockQueues,
  }),
}));

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ParaglideMessages>()),
  ticket_queue_sheet_title: () => "Change queue",
  error_generic: () => "Error",
  app_retry: () => "Retry",
  empty_no_results: () => "No results",
}));

vi.mock("$lib/shell/ShellSheet.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellSheetModule>()),
  default: (await import("./test-helpers/PassthroughShell.svelte")).default,
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcIndex>()),
  trpc: {
    tickets: {
      listQueues: {
        query: vi.fn().mockResolvedValue(mockQueues),
      },
    },
  },
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<typeof LibErrors>()),
  requireRouter: <T>(router: T): T => router,
}));

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
  getOrgDecryptCache: () => ({
    decrypt: (key: string, _cipher: string | null) =>
      mockDecryptMap.get(key) ?? null,
  }),
}));

vi.mock("$lib/utils/queue-appearance.js", async (importOriginal) => {
  const orig = await importOriginal<typeof QueueAppearanceModule>();
  return {
    ...orig,
    decryptQueueAppearance: (
      _orgCache: { decrypt: (k: string, v: string | null) => string | null },
      _queue: {
        id: string;
        encryptedColor: string | null;
        encryptedIcon: string | null;
      },
    ) => ({
      colorId: "grey",
      colorHex: "#8e8e93",
      iconId: "folder",
      icon: orig.resolveQueueAppearance(null, null).icon,
    }),
  };
});

// QueueGlyph renders an icon; stub it to avoid deep Svelte component mocking.
vi.mock("$lib/components/shared/QueueGlyph.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof QueueGlyphModule>()),
  default: (await import("./test-helpers/PassthroughShell.svelte")).default,
}));

vi.mock("$lib/components/InlineSkeleton.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof InlineSkeletonModule>()),
  default: (await import("./test-helpers/PassthroughShell.svelte")).default,
}));

afterEach(() => {
  cleanup();
});

function renderWithQueryClient(
  props: ComponentProps<typeof QueueSelectSheet>,
): ReturnType<typeof render> {
  return render(QueueSelectSheet, { props });
}

describe("QueueSelectSheet", () => {
  it("renders decrypted queue names after loading", async () => {
    renderWithQueryClient({
      opened: true,
      ondismiss: vi.fn(),
      onselect: vi.fn(),
    });

    // Wait for the async query to settle.
    const general = await screen.findByText("General");
    expect(general).toBeTruthy();
    expect(screen.getByText("Urgent Line")).toBeTruthy();
  });

  it("fires onselect with the chosen queue id", async () => {
    const onselect = vi.fn();
    const ondismiss = vi.fn();

    renderWithQueryClient({
      opened: true,
      ondismiss,
      onselect,
    });

    const item = await screen.findByText("General");
    await fireEvent.click(item);
    expect(onselect).toHaveBeenCalledWith("q-1");
    expect(ondismiss).toHaveBeenCalledOnce();
  });

  it("does not render content when opened is false", () => {
    renderWithQueryClient({
      opened: false,
      ondismiss: vi.fn(),
      onselect: vi.fn(),
    });

    expect(screen.queryByText("General")).toBeNull();
  });
});
