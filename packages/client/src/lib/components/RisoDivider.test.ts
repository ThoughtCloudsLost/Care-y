// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import RisoDivider from "./RisoDivider.svelte";

afterEach(cleanup);

describe("RisoDivider", () => {
  it("renders a hidden hr element (decorative, not semantic)", () => {
    const { container } = render(RisoDivider);
    const hr = container.querySelector("hr");
    expect(hr).toBeTruthy();
    expect(hr?.getAttribute("aria-hidden")).toBe("true");
  });
});
