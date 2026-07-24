// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import Register from "./Register.svelte";

afterEach(cleanup);

const body = createRawSnippet(() => ({
  render: () => `<span>Everyone in this queue can see this ticket.</span>`,
}));

describe("Register", () => {
  it("renders the note register with its eyebrow and body", () => {
    const { container } = render(Register, {
      props: { kind: "note", children: body },
    });
    expect(screen.getByText("Note")).toBeTruthy();
    expect(
      screen.getByText("Everyone in this queue can see this ticket."),
    ).toBeTruthy();
    expect(
      container.querySelector(".register")?.getAttribute("data-register"),
    ).toBe("note");
  });

  it("renders the careful register with its eyebrow", () => {
    const { container } = render(Register, {
      props: { kind: "careful", children: body },
    });
    expect(screen.getByText("Careful")).toBeTruthy();
    expect(
      container
        .querySelector(".register")
        ?.classList.contains("register-careful"),
    ).toBe(true);
  });

  it("renders the warning register with its eyebrow", () => {
    const { container } = render(Register, {
      props: { kind: "warning", children: body },
    });
    expect(screen.getByText("Warning")).toBeTruthy();
    expect(
      container
        .querySelector(".register")
        ?.classList.contains("register-warning"),
    ).toBe(true);
  });

  it("renders the protected register with a shield glyph before the eyebrow", () => {
    const { container } = render(Register, {
      props: { kind: "protected", children: body },
    });
    expect(screen.getByText("Protected")).toBeTruthy();
    const svg = container.querySelector(".register-eyebrow svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("draws no glyph on the other three registers", () => {
    for (const kind of ["note", "careful", "warning"] as const) {
      const { container } = render(Register, {
        props: { kind, children: body },
      });
      expect(container.querySelector(".register-eyebrow svg")).toBeNull();
      cleanup();
    }
  });

  it("exposes the block as an ARIA note", () => {
    render(Register, { props: { kind: "note", children: body } });
    expect(screen.getByRole("note")).toBeTruthy();
  });

  it("takes role=alert for dynamically appearing warnings", () => {
    render(Register, {
      props: { kind: "warning", role: "alert", children: body },
    });
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.queryByRole("note")).toBeNull();
  });

  it("takes role=status for polite live updates", () => {
    render(Register, {
      props: { kind: "careful", role: "status", children: body },
    });
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("carries no left border accent (forbidden pattern)", () => {
    const { container } = render(Register, {
      props: { kind: "warning", children: body },
    });
    const el = container.querySelector(".register");
    expect(el).not.toBeNull();
    // A visible left border requires border-left-style; the register must
    // never set one (jsdom reports "" or "none" when unset).
    const style = getComputedStyle(el as Element);
    expect(
      style.borderLeftStyle === "" || style.borderLeftStyle === "none",
    ).toBe(true);
  });
});
