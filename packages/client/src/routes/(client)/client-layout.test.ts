// @vitest-environment jsdom
/**
 * The (client) layout is a thin mount of ClientShell, so this checks only
 * that it mounts the shell and passes the page through. Everything the
 * shell renders is covered in lib/shell/ClientShell.test.ts, which is
 * where those assertions moved when the layout stopped composing chrome.
 *
 * vi.mock() replaces ClientShell with a passthrough: mounting the real one
 * would pull in the branding query, Konsta's Page, and the drawer, all of
 * which that spec already drives.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";

vi.mock("$lib/shell/ClientShell.svelte", async () => {
  // Surface assertion rather than importOriginal, which would load the
  // real shell and defeat the point of the passthrough.
  const _usedExports = null! as { default: unknown };
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  } satisfies typeof _usedExports;
});

vi.mock("$lib/providers/PortalBridgeProvider.svelte", async () => {
  const _usedExports = null! as { default: unknown };
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  } satisfies typeof _usedExports;
});

const { default: Layout } = await import("./+layout.svelte");

const childSnippet = createRawSnippet(() => ({
  render: () => `<p data-testid="child-content">Child content here</p>`,
}));

describe("(client) layout", () => {
  afterEach(cleanup);

  it("mounts the client shell around the page", () => {
    render(Layout, { props: { children: childSnippet } });
    expect(screen.getByTestId("child-content")).toBeTruthy();
  });

  // ADR-087: no route file composes chrome, on either side of the product.
  // That is the boundary a later native navigation swap depends on.
  it("composes no chrome of its own", () => {
    const { container } = render(Layout, { props: { children: childSnippet } });
    expect(container.querySelector(".k-navbar")).toBeNull();
    expect(container.querySelector("footer")).toBeNull();
  });
});
