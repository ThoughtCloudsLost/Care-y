// @vitest-environment jsdom

import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import LinkErrorState from "./LinkErrorState.svelte";

describe("LinkErrorState", () => {
  afterEach(cleanup);

  it("renders the title and body text", () => {
    const { getByText } = render(LinkErrorState, {
      props: { title: "Expired link", body: "This link has expired." },
    });
    expect(getByText("Expired link")).toBeTruthy();
    expect(getByText("This link has expired.")).toBeTruthy();
  });

  it("applies the data-testid when provided", () => {
    const { getByTestId } = render(LinkErrorState, {
      props: {
        title: "Not found",
        body: "Link not found.",
        testId: "error-state",
      },
    });
    expect(getByTestId("error-state")).toBeTruthy();
  });

  it("renders without data-testid when omitted", () => {
    const { container } = render(LinkErrorState, {
      props: { title: "Bad link", body: "Check the link." },
    });
    const wrapper = container.firstElementChild;
    expect(wrapper?.getAttribute("data-testid")).toBeNull();
  });
});
