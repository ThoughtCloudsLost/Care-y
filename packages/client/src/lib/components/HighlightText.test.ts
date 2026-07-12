// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import HighlightText from "./HighlightText.svelte";

afterEach(cleanup);

describe("HighlightText", () => {
  it("wraps case-insensitive matches in <mark> and keeps original casing", () => {
    const { container } = render(HighlightText, {
      props: { text: "Emergency Housing referral", term: "housing" },
    });
    const marks = container.querySelectorAll("mark");
    expect(marks).toHaveLength(1);
    expect(marks[0]!.textContent).toBe("Housing");
    expect(container.textContent).toBe("Emergency Housing referral");
  });

  it("marks every occurrence", () => {
    const { container } = render(HighlightText, {
      props: { text: "call the caller", term: "call" },
    });
    expect(container.querySelectorAll("mark")).toHaveLength(2);
  });

  it("renders plain text when no term is given", () => {
    const { container } = render(HighlightText, {
      props: { text: "Emergency Housing referral" },
    });
    expect(container.querySelectorAll("mark")).toHaveLength(0);
    expect(container.textContent).toBe("Emergency Housing referral");
  });

  it("renders plain text for terms under 2 characters", () => {
    const { container } = render(HighlightText, {
      props: { text: "abc", term: "a" },
    });
    expect(container.querySelectorAll("mark")).toHaveLength(0);
    expect(container.textContent).toBe("abc");
  });

  it("renders plain text when nothing matches", () => {
    const { container } = render(HighlightText, {
      props: { text: "abc", term: "zz" },
    });
    expect(container.querySelectorAll("mark")).toHaveLength(0);
    expect(container.textContent).toBe("abc");
  });
});
