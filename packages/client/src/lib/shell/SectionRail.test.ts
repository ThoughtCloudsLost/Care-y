// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/svelte";
import SectionRail from "./SectionRail.svelte";
import { Activity, BookOpen, Layers } from "@lucide/svelte";
import type { ScrollSection } from "$lib/components/useSectionScroll.svelte.js";

function makeSections(): readonly ScrollSection[] {
  return [
    { id: "alpha", label: () => "Alpha", icon: Activity },
    { id: "beta", label: () => "Beta", icon: BookOpen },
    { id: "gamma", label: () => "Gamma", icon: Layers },
  ];
}

afterEach(cleanup);

describe("SectionRail", () => {
  it("renders all sections with labels", () => {
    const sections = makeSections();
    render(SectionRail, {
      props: { sections, active: "alpha", onscroll: vi.fn() },
    });

    expect(screen.getByText("Alpha")).toBeTruthy();
    expect(screen.getByText("Beta")).toBeTruthy();
    expect(screen.getByText("Gamma")).toBeTruthy();
  });

  it("marks the active section with aria-current", () => {
    const sections = makeSections();
    render(SectionRail, {
      props: { sections, active: "beta", onscroll: vi.fn() },
    });

    const betaBtn = screen.getByLabelText("Beta");
    expect(betaBtn.getAttribute("aria-current")).toBe("true");

    const alphaBtn = screen.getByLabelText("Alpha");
    expect(alphaBtn.getAttribute("aria-current")).toBeNull();
  });

  it("applies the active CSS class to the active section button", () => {
    const sections = makeSections();
    render(SectionRail, {
      props: { sections, active: "gamma", onscroll: vi.fn() },
    });

    const gammaBtn = screen.getByLabelText("Gamma");
    expect(gammaBtn.classList.contains("active")).toBe(true);

    const alphaBtn = screen.getByLabelText("Alpha");
    expect(alphaBtn.classList.contains("active")).toBe(false);
  });

  it("calls onscroll with the section id on click", async () => {
    const sections = makeSections();
    const onscroll = vi.fn();
    render(SectionRail, {
      props: { sections, active: "alpha", onscroll },
    });

    const betaBtn = screen.getByLabelText("Beta");
    await fireEvent.click(betaBtn);

    expect(onscroll).toHaveBeenCalledWith("beta");
  });

  it("navigates via ArrowDown keyboard", async () => {
    const sections = makeSections();
    const onscroll = vi.fn();
    render(SectionRail, {
      props: { sections, active: "alpha", onscroll },
    });

    const nav = screen.getByRole("navigation");
    await fireEvent.keyDown(nav, { key: "ArrowDown" });

    // Active is "alpha" (index 0), ArrowDown goes to index 1 ("beta")
    expect(onscroll).toHaveBeenCalledWith("beta");
  });

  it("navigates via ArrowUp keyboard (wraps around)", async () => {
    const sections = makeSections();
    const onscroll = vi.fn();
    render(SectionRail, {
      props: { sections, active: "alpha", onscroll },
    });

    const nav = screen.getByRole("navigation");
    await fireEvent.keyDown(nav, { key: "ArrowUp" });

    // Active is "alpha" (index 0), ArrowUp wraps to last ("gamma")
    expect(onscroll).toHaveBeenCalledWith("gamma");
  });

  it("navigates to first via Home key", async () => {
    const sections = makeSections();
    const onscroll = vi.fn();
    render(SectionRail, {
      props: { sections, active: "gamma", onscroll },
    });

    const nav = screen.getByRole("navigation");
    await fireEvent.keyDown(nav, { key: "Home" });

    expect(onscroll).toHaveBeenCalledWith("alpha");
  });

  it("navigates to last via End key", async () => {
    const sections = makeSections();
    const onscroll = vi.fn();
    render(SectionRail, {
      props: { sections, active: "alpha", onscroll },
    });

    const nav = screen.getByRole("navigation");
    await fireEvent.keyDown(nav, { key: "End" });

    expect(onscroll).toHaveBeenCalledWith("gamma");
  });

  it("uses custom ariaLabel when provided", () => {
    const sections = makeSections();
    render(SectionRail, {
      props: {
        sections,
        active: "alpha",
        onscroll: vi.fn(),
        ariaLabel: "Custom label",
      },
    });

    const nav = screen.getByRole("navigation", { name: "Custom label" });
    expect(nav).toBeTruthy();
  });

  it("sets tabindex 0 only on the active button", () => {
    const sections = makeSections();
    render(SectionRail, {
      props: { sections, active: "beta", onscroll: vi.fn() },
    });

    const alphaBtn = screen.getByLabelText("Alpha");
    const betaBtn = screen.getByLabelText("Beta");
    const gammaBtn = screen.getByLabelText("Gamma");

    expect(alphaBtn.getAttribute("tabindex")).toBe("-1");
    expect(betaBtn.getAttribute("tabindex")).toBe("0");
    expect(gammaBtn.getAttribute("tabindex")).toBe("-1");
  });
});
