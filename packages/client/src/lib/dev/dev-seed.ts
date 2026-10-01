/**
 * Dev-only data seeding from the Settings page.
 *
 * The browser side of the seed replay: it builds the replay's deps from the
 * app's tRPC client, the relay phone lookup and the bundled voicemail clip,
 * then runs {@link seedReplay}.
 *
 * Dynamically imported behind `import.meta.env.DEV` so Vite tree-shakes it
 * from production builds entirely.
 */
import { trpc } from "$lib/trpc/index.js";
import { DEV_ORG_SLUG } from "$lib/utils/org-slug.js";
import { RelayError, SeedReplayError, requireRouter } from "$lib/errors.js";
import { isPhoneLookupResult } from "$lib/components/inputs/client-select-types.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { OrgKeyManager } from "$lib/crypto/org-key.js";
import seedVoicemailUrl from "@care-y/shared/dev/assets/seed-voicemail-en.m4a?url";
import {
  DEV_SEED_STORY_COUNT,
  seedReplay,
  type SeedPhoneLookup,
  type SeedProgressCallback,
  type SeedReplayClient,
} from "./seed-replay.js";

export type { SeedProgressCallback } from "./seed-replay.js";

/** The shared seed voicemail clip's bytes. */
async function loadSeedVoicemail(): Promise<Uint8Array> {
  const res = await fetch(seedVoicemailUrl);
  if (!res.ok) {
    throw new SeedReplayError("Seed voicemail clip failed to load");
  }
  return new Uint8Array(await res.arrayBuffer());
}

async function phoneLookup(phone: string): Promise<SeedPhoneLookup> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (import.meta.env.DEV) {
    headers["x-org-slug"] = DEV_ORG_SLUG;
  }

  const res = await fetch("/relay/phone-lookup", {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({ phone }),
  });

  if (!res.ok) {
    throw new RelayError("PHONE_LOOKUP_FAILED", res.status);
  }

  const body: unknown = await res.json();
  if (!isPhoneLookupResult(body)) {
    throw new SeedReplayError("Phone lookup returned an unexpected shape");
  }
  return body;
}

/**
 * The app's tRPC client narrowed to the procedures the replay calls.
 * Routers the app router mounts conditionally are checked here, so a
 * missing one fails before the replay writes anything.
 */
function replayClient(): SeedReplayClient {
  return {
    auth: trpc.auth,
    org: trpc.org,
    branding: requireRouter(trpc.branding, "branding"),
    kb: requireRouter(trpc.kb, "kb"),
    tickets: requireRouter(trpc.tickets, "tickets"),
    voicemailQuarantine: requireRouter(
      trpc.voicemailQuarantine,
      "voicemailQuarantine",
    ),
    dev: requireRouter(trpc.dev, "dev"),
    telephonyAdmin: {
      devSeedTelephony: trpc.telephonyAdmin?.devSeedTelephony,
    },
    ...(trpc.funds !== undefined ? { funds: trpc.funds } : {}),
  };
}

export async function devSeedData(
  bridge: CryptoBridge,
  orgKeyManager: OrgKeyManager,
  onProgress?: SeedProgressCallback,
): Promise<void> {
  await seedReplay({
    client: replayClient(),
    bridge,
    orgKeyManager,
    phoneLookup,
    loadVoicemail: loadSeedVoicemail,
    storyCount: DEV_SEED_STORY_COUNT,
    ...(onProgress !== undefined ? { onProgress } : {}),
  });
}
