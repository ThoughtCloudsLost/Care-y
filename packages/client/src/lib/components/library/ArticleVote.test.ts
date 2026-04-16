// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import ArticleVote from "./ArticleVote.svelte";

afterEach(cleanup);

describe("ArticleVote", () => {
  const onvote = vi.fn();
  const onremove = vi.fn();

  const defaults = {
    voteUpCount: 4,
    voteDownCount: 1,
    userDirection: null as "up" | "down" | null,
    onvote,
    onremove,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders up/down buttons with labels", () => {
    const { getByText } = render(ArticleVote, { props: defaults });
    expect(getByText("Helpful")).toBeTruthy();
    expect(getByText("Not helpful")).toBeTruthy();
  });

  it("shows vote summary with counts when no user vote", () => {
    const { getByText } = render(ArticleVote, { props: defaults });
    expect(getByText("4 of 5 found helpful")).toBeTruthy();
  });

  it("shows both personalized text and count when voted up", () => {
    const { getByText } = render(ArticleVote, {
      props: { ...defaults, userDirection: "up" as const, voteUpCount: 5 },
    });
    // Design doc State 7: two lines when voted
    expect(getByText("You found this helpful")).toBeTruthy();
    expect(getByText("5 of 6 found helpful")).toBeTruthy();
  });

  it("shows both personalized text and count when voted down", () => {
    const { getByText } = render(ArticleVote, {
      props: { ...defaults, userDirection: "down" as const },
    });
    expect(getByText("You marked this as not helpful")).toBeTruthy();
    expect(getByText("4 of 5 found helpful")).toBeTruthy();
  });

  it("does not show personalized text when no user vote", () => {
    const { queryByText } = render(ArticleVote, { props: defaults });
    expect(queryByText("You found this helpful")).toBeNull();
    expect(queryByText("You marked this as not helpful")).toBeNull();
  });

  it("calls onvote('up') when thumbs-up tapped with no current vote", async () => {
    const { getByText } = render(ArticleVote, { props: defaults });
    await fireEvent.click(getByText("Helpful"));
    expect(onvote).toHaveBeenCalledWith("up");
    expect(onremove).not.toHaveBeenCalled();
  });

  it("calls onremove when active vote button tapped again", async () => {
    const { getByText } = render(ArticleVote, {
      props: { ...defaults, userDirection: "up" as const },
    });
    await fireEvent.click(getByText("Helpful"));
    expect(onremove).toHaveBeenCalled();
    expect(onvote).not.toHaveBeenCalled();
  });

  it("calls onvote('down') when switching from up to down", async () => {
    const { getByText } = render(ArticleVote, {
      props: { ...defaults, userDirection: "up" as const },
    });
    await fireEvent.click(getByText("Not helpful"));
    expect(onvote).toHaveBeenCalledWith("down");
  });

  it("calls onvote('up') when switching from down to up", async () => {
    const { getByText } = render(ArticleVote, {
      props: { ...defaults, userDirection: "down" as const },
    });
    await fireEvent.click(getByText("Helpful"));
    expect(onvote).toHaveBeenCalledWith("up");
  });

  it("does not call onvote or onremove when disabled", async () => {
    const { getByText } = render(ArticleVote, {
      props: { ...defaults, disabled: true },
    });
    await fireEvent.click(getByText("Helpful"));
    await fireEvent.click(getByText("Not helpful"));
    expect(onvote).not.toHaveBeenCalled();
    expect(onremove).not.toHaveBeenCalled();
  });

  it("shows no summary when zero votes and no user vote", () => {
    const { queryByText } = render(ArticleVote, {
      props: { ...defaults, voteUpCount: 0, voteDownCount: 0 },
    });
    // The vote count summary should not appear.
    expect(queryByText(/of.*found helpful/)).toBeNull();
  });

  it("renders the 'Was this helpful?' prompt", () => {
    const { getByText } = render(ArticleVote, { props: defaults });
    expect(getByText("Was this helpful?")).toBeTruthy();
  });
});
