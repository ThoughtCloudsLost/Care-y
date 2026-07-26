import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { BlobStore } from "../storage/store.js";
import { createSealedBoxEncryptor } from "../crypto/sealed-box.js";

interface QuarantineEntry {
  readonly recordingSid: string;
  readonly callSid: string;
  readonly reason: "tracker_miss" | "no_intake_queue" | "unresolved_client";
  readonly callerNumber: string;
  readonly calledNumber: string;
  readonly durationSeconds: number;
  readonly clientId: string | null;
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

export async function seedQuarantineEntries(
  tDb: Kysely<TenantDatabase>,
  blobStore: BlobStore,
  orgSchema: string,
): Promise<{ count: number }> {
  const orgConfig = await tDb
    .selectFrom("org_config")
    .select("org_public_key")
    .executeTakeFirst();

  if (!orgConfig?.org_public_key) {
    console.log("[seed-quarantine] No org public key found, skipping");
    return { count: 0 };
  }

  const sealedBox = createSealedBoxEncryptor(
    Buffer.from(orgConfig.org_public_key),
  );

  let count = 0;

  for (const entry of SEED_ENTRIES) {
    const existing = await tDb
      .selectFrom("voicemail_quarantine")
      .select("id")
      .where("recording_sid", "=", entry.recordingSid)
      .executeTakeFirst();

    if (existing) continue;

    const rawAudio = generateWav(entry.durationSeconds);
    const sealed = sealedBox.sealBuffer(rawAudio);
    const blobKey = await blobStore.put(orgSchema, "quarantine", sealed);

    const encryptedCaller = sealedBox.seal(entry.callerNumber);
    const encryptedCalled = sealedBox.seal(entry.calledNumber);

    const createdAt = new Date(Date.now() - entry.minutesAgo * 60 * 1000);

    await tDb
      .insertInto("voicemail_quarantine")
      .values({
        recording_sid: entry.recordingSid,
        call_sid: entry.callSid,
        blob_key: blobKey,
        size_bytes: sealed.length,
        duration_seconds: entry.durationSeconds,
        reason: entry.reason,
        client_id: entry.clientId,
        encrypted_caller_number: encryptedCaller,
        encrypted_called_number: encryptedCalled,
        created_at: createdAt,
      })
      .execute();

    count++;
  }

  return { count };
}
