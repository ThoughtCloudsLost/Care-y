// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  intake_privacy_encrypted: () => "Your answer is encrypted.",
  intake_privacy_metadata: () =>
    "Your answer is encrypted, but your selection shares routing metadata.",
}));

const { default: IntakePrivacyIndicator } =
  await import("./IntakePrivacyIndicator.svelte");

afterEach(cleanup);

describe("IntakePrivacyIndicator", () => {
  it("renders the fully-encrypted copy when hasMetadataSignal is false", () => {
    render(IntakePrivacyIndicator, {
      props: { hasMetadataSignal: false },
    });
    expect(screen.getByText("Your answer is encrypted.")).toBeTruthy();
    expect(screen.queryByText(/routing metadata/)).toBeNull();
  });

  it("renders the metadata-signal copy when hasMetadataSignal is true", () => {
    render(IntakePrivacyIndicator, {
      props: { hasMetadataSignal: true },
    });
    expect(screen.getByText(/routing metadata/)).toBeTruthy();
    expect(screen.queryByText("Your answer is encrypted.")).toBeNull();
  });
});
