import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/svelte";
import {
  getSodium,
  generatePortalSeed,
  derivePortalKeypair,
  eciesEncrypt,
  encode,
  toRistrettoPoint,
} from "@care-y/crypto";
import PortalThread from "./PortalThread.svelte";

beforeAll(async () => {
  await getSodium();
});

function makeMessage(
  text: string,
  direction: string,
  keypairPublic: Uint8Array,
  editedAt: string | null = null,
): {
  direction: string;
  ephemeralPoint: string;
  nonce: string;
  ciphertext: string;
  createdAt: string;
  editedAt: string | null;
} {
  const encrypted = eciesEncrypt(
    new TextEncoder().encode(text),
    toRistrettoPoint(keypairPublic),
  );
  return {
    direction,
    ephemeralPoint: encode(encrypted.ephemeralPoint),
    nonce: encode(encrypted.nonce),
    ciphertext: encode(encrypted.ciphertext),
    createdAt: new Date().toISOString(),
    editedAt,
  };
}

describe("PortalThread", () => {
  it("renders empty state when no messages", () => {
    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);

    const { getByTestId } = render(PortalThread, {
      props: {
        messages: [],
        clientPrivate: keypair.clientPrivate,
        loading: false,
      },
    });

    expect(getByTestId("portal-empty-state")).toBeTruthy();
  });

  it("renders messages with correct direction", () => {
    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);

    const messages = [
      makeMessage("Hello from support", "to_client", keypair.clientPublic),
      makeMessage("Thanks for the help", "from_client", keypair.clientPublic),
    ];

    const { getByTestId } = render(PortalThread, {
      props: {
        messages,
        clientPrivate: keypair.clientPrivate,
        loading: false,
      },
    });

    const thread = getByTestId("portal-thread");
    expect(thread.getAttribute("role")).toBe("log");
  });

  it("shows edited marker when editedAt is present", () => {
    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);

    const messages = [
      makeMessage(
        "Edited message",
        "to_client",
        keypair.clientPublic,
        new Date().toISOString(),
      ),
    ];

    const { container } = render(PortalThread, {
      props: {
        messages,
        clientPrivate: keypair.clientPrivate,
        loading: false,
      },
    });

    const editedMarkers = container.querySelectorAll(".edited-marker");
    expect(editedMarkers.length).toBeGreaterThan(0);
  });

  it("renders loading placeholders when loading", () => {
    const seed = generatePortalSeed();
    const keypair = derivePortalKeypair(seed);

    const { queryByTestId } = render(PortalThread, {
      props: {
        messages: [],
        clientPrivate: keypair.clientPrivate,
        loading: true,
      },
    });

    // Should not show empty state during loading
    expect(queryByTestId("portal-empty-state")).toBeNull();
  });
});
