// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { portal } from "./portal.js";

describe("portal", () => {
  let container: HTMLDivElement;
  let target: HTMLDivElement;
  let node: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    target = document.createElement("div");
    node = document.createElement("div");
    node.textContent = "portaled content";
    container.appendChild(node);
    document.body.appendChild(container);
    document.body.appendChild(target);
  });

  afterEach(() => {
    container.remove();
    target.remove();
  });

  it("moves the node into the target element", () => {
    portal(node, target);
    expect(target.contains(node)).toBe(true);
    expect(container.contains(node)).toBe(false);
  });

  it("returns node to original position on destroy", () => {
    const { destroy } = portal(node, target);
    destroy();
    expect(container.contains(node)).toBe(true);
    expect(target.contains(node)).toBe(false);
  });

  it("resolves a CSS selector string as the target", () => {
    target.className = "my-target";
    portal(node, ".my-target");
    expect(target.contains(node)).toBe(true);
  });

  it("defaults to document.body when no target is provided", () => {
    portal(node);
    expect(node.parentElement).toBe(document.body);
  });

  it("returns a no-op when CSS selector matches nothing", () => {
    const { destroy } = portal(node, ".nonexistent");
    expect(container.contains(node)).toBe(true);
    destroy();
  });

  it("returns a no-op when target is already the parent", () => {
    const { destroy } = portal(node, container);
    expect(container.contains(node)).toBe(true);
    destroy();
  });

  it("removes node when anchor comment is gone before destroy", () => {
    const { destroy } = portal(node, target);
    // Remove the anchor by clearing the container
    container.innerHTML = "";
    destroy();
    expect(target.contains(node)).toBe(false);
  });
});
