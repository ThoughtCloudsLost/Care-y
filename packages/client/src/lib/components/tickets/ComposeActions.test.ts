// @vitest-environment jsdom
/**
 * ComposeActions menu tests: which items render for the handlers and
 * permission flag the caller passes.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import ComposeActions from "./ComposeActions.svelte";
import * as m from "$lib/paraglide/messages.js";
import type * as WithTermsNS from "$lib/terminology/with-terms.js";
import type * as ShellPopoverNS from "$lib/shell/ShellPopover.svelte";
import type * as ShellSheetNS from "$lib/shell/ShellSheet.svelte";
import type * as PresetReplyContentNS from "$lib/components/tickets/PresetReplyContent.svelte";
import type * as InternalNoteSheetNS from "$lib/components/tickets/InternalNoteSheet.svelte";

vi.mock("$lib/terminology/with-terms.js", async (importOriginal) =>
  (await import("$mocks/with-terms.js")).withTermsMock(
    await importOriginal<typeof WithTermsNS>(),
  ),
);

// vi.mock required: ShellPopover and ShellSheet wrap Konsta overlays that
// need App context. The passthrough renders children while opened.
vi.mock(
  "$lib/shell/ShellPopover.svelte",
  async () =>
    ({
      default: (
        await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
      ).default as unknown as (typeof ShellPopoverNS)["default"],
    }) satisfies typeof ShellPopoverNS,
);
vi.mock(
  "$lib/shell/ShellSheet.svelte",
  async () =>
    ({
      default: (
        await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
      ).default as unknown as (typeof ShellSheetNS)["default"],
    }) satisfies typeof ShellSheetNS,
);

// vi.mock required: both sheets query and send through tRPC.
vi.mock(
  "$lib/components/tickets/PresetReplyContent.svelte",
  async () =>
    ({
      default: (
        await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
      ).default as unknown as (typeof PresetReplyContentNS)["default"],
    }) satisfies typeof PresetReplyContentNS,
);
vi.mock(
  "$lib/components/tickets/InternalNoteSheet.svelte",
  async () =>
    ({
      default: (
        await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
      ).default as unknown as (typeof InternalNoteSheetNS)["default"],
    }) satisfies typeof InternalNoteSheetNS,
);

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

afterEach(cleanup);

const baseProps = {
  opened: true,
  ondismiss: vi.fn(),
  ticketId: "t-001",
  onpresetselect: vi.fn(),
  canAddNote: false,
};

describe("ComposeActions", () => {
  it("renders no attach, preset or note item without handlers or note permission", () => {
    const { container } = render(ComposeActions, { props: baseProps });
    const text = container.textContent;

    expect(text).not.toContain(m.ticket_attach_file());
    expect(text).not.toContain(m.ticket_preset_replies());
    expect(text).not.toContain(m.ticket_add_internal_note());
  });

  it("renders the attach item only when onattach is provided", () => {
    const { container } = render(ComposeActions, {
      props: { ...baseProps, onattach: vi.fn() },
    });

    expect(container.textContent).toContain(m.ticket_attach_file());
  });

  it("renders preset replies only when reply is available", () => {
    const { container } = render(ComposeActions, {
      props: { ...baseProps, onreply: vi.fn() },
    });

    expect(container.textContent).toContain(m.ticket_preset_replies());
  });

  it("renders the internal note item when canAddNote is true", () => {
    const { container } = render(ComposeActions, {
      props: { ...baseProps, canAddNote: true },
    });

    expect(container.textContent).toContain(m.ticket_add_internal_note());
  });
});
