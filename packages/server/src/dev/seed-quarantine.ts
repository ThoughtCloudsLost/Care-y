import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { BlobStore } from "../storage/store.js";
import { createSealedBoxEncryptor } from "../crypto/sealed-box.js";
import type {
  OrgSchema,
  ClientId,
  VoicemailQuarantineId,
} from "@care-y/shared";
import { recordingSidSchema, callSidSchema } from "@care-y/shared";
import type { SeedQuarantineInput } from "@care-y/shared/dev/seed-stories.js";

interface QuarantineEntry {
  readonly recordingSid: string;
  readonly callSid: string;
  readonly reason: "tracker_miss" | "no_intake_queue" | "unresolved_client";
  readonly callerNumber: string;
  readonly calledNumber: string;
  readonly durationSeconds: number;
  readonly clientId: ClientId | null;
  readonly minutesAgo: number;
}

const SEED_ENTRIES: readonly QuarantineEntry[] = [
  {
    recordingSid: "RE_SEED_tracker_miss",
    callSid: "CA_SEED_tracker_miss",
    reason: "tracker_miss",
    callerNumber: "+15559871234",
    calledNumber: "+15550001111",
    durationSeconds: 34,
    clientId: null,
    minutesAgo: 120,
  },
  {
    recordingSid: "RE_SEED_no_intake",
    callSid: "CA_SEED_no_intake",
    reason: "no_intake_queue",
    callerNumber: "+15553216789",
    calledNumber: "+15550001111",
    durationSeconds: 18,
    clientId: null,
    minutesAgo: 30,
  },
  {
    recordingSid: "RE_SEED_unresolved",
    callSid: "CA_SEED_unresolved",
    reason: "unresolved_client",
    callerNumber: "+15558004567",
    calledNumber: "+15550002222",
    durationSeconds: 52,
    clientId: null,
    minutesAgo: 5,
  },
];

/** A pending entry the dev seed routes into a new ticket, like an admin would. */
function routableEntry(i: number): QuarantineEntry {
  const n = String(i + 1).padStart(4, "0");
  return {
    recordingSid: `RE_SEED_route_${n}`,
    callSid: `CA_SEED_route_${n}`,
    reason: "unresolved_client",
    callerNumber: `+1555003${n}`,
    calledNumber: "+15550001111",
    durationSeconds: 30,
    clientId: null,
    minutesAgo: 0,
  };
}

function generateWav(durationSec: number): Buffer {
  const sampleRate = 8000;
  const numSamples = sampleRate * durationSec;
  const dataSize = numSamples * 2;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  const data = Buffer.alloc(dataSize);
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate);
    data.writeInt16LE(Math.round(sample * 16000), i * 2);
  }
  return Buffer.concat([header, data]);
}

/**
 * Seeds pending quarantine entries: the fixed set the admin quarantine
 * screen shows, plus `routable` more for the dev seed to route. Entries
 * carry the given audio (the shared seed clip) when present, else
 * synthetic audio.
 */
export async function seedQuarantineEntries(
  tDb: Kysely<TenantDatabase>,
  blobStore: BlobStore,
  orgSchema: OrgSchema,
  options?: SeedQuarantineInput,
): Promise<{ count: number; routableIds: VoicemailQuarantineId[] }> {
  const orgConfig = await tDb
    .selectFrom("org_config")
    .select(["org_public_key", "current_key_generation"])
    .executeTakeFirst();

  if (!orgConfig?.org_public_key) {
    console.log("[seed-quarantine] No org public key found, skipping");
    return { count: 0, routableIds: [] };
  }

  const sealedBox = createSealedBoxEncryptor(
    Buffer.from(orgConfig.org_public_key),
    orgConfig.current_key_generation,
  );

  let count = 0;
  const routableIds: VoicemailQuarantineId[] = [];
  const routable = Array.from({ length: options?.routable ?? 0 }, (_, i) =>
    routableEntry(i),
  );
  const routableSids = new Set(routable.map((e) => e.recordingSid));

  for (const entry of [...SEED_ENTRIES, ...routable]) {
    const parsedRecordingSid = recordingSidSchema.parse(entry.recordingSid);
    const parsedCallSid = callSidSchema.parse(entry.callSid);

    const existing = await tDb
      .selectFrom("voicemail_quarantine")
      .select("id")
      .where("recording_sid", "=", parsedRecordingSid)
      .executeTakeFirst();

    if (existing) continue;

    const durationSeconds =
      options?.audio !== undefined
        ? (options.durationSeconds ?? entry.durationSeconds)
        : entry.durationSeconds;
    const rawAudio =
      options?.audio !== undefined
        ? Buffer.from(options.audio, "base64")
        : generateWav(durationSeconds);
    const sealed = sealedBox.sealBuffer(rawAudio);
    rawAudio.fill(0);
    const blobKey = await blobStore.put(orgSchema, "quarantine", sealed);

    const encryptedCaller = sealedBox.seal(entry.callerNumber);
    const encryptedCalled = sealedBox.seal(entry.calledNumber);

    const createdAt = new Date(Date.now() - entry.minutesAgo * 60 * 1000);

    const inserted = await tDb
      .insertInto("voicemail_quarantine")
      .values({
        recording_sid: parsedRecordingSid,
        call_sid: parsedCallSid,
        blob_key: blobKey,
        size_bytes: sealed.length,
        duration_seconds: durationSeconds,
        reason: entry.reason,
        client_id: entry.clientId,
        encrypted_caller_number: encryptedCaller,
        encrypted_called_number: encryptedCalled,
        created_at: createdAt,
        org_key_generation: sealedBox.generation,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    if (routableSids.has(entry.recordingSid)) routableIds.push(inserted.id);
    count++;
  }

  return { count, routableIds };
}
