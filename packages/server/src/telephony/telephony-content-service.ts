/**
 * Service layer for phone greeting and SMS response content management.
 *
 * Wraps greeting and SMS response repositories. Routes delegate here
 * instead of creating repositories directly.
 *
 * Currently pass-through. Kept as a deliberate architectural seam:
 * routes import this service (not repos directly) to satisfy the
 * route-no-db-import validator rule. If future work adds business
 * logic (authorization, audit logging, blob resolution for audio
 * greetings), it belongs here.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { BlobStore } from "../storage/store.js";
import type { GreetingAudioContentType } from "@care-y/shared";
import { GREETING_AUDIO_MAX_BYTES, ErrorCode } from "@care-y/shared";
import { NotFoundError, ValidationError } from "../errors.js";
import {
  createGreetingRepository,
  type GreetingRecord,
} from "./models/greeting-repo.js";
import {
  createSmsResponseRepository,
  type SmsResponseRecord,
} from "./models/sms-response-repo.js";
import { validateAudioMagicBytes } from "./audio-validator.js";
import {
  type BlobKey,
  type PhoneGreetingId,
  type SmsResponseId,
  type OrgSchema,
  type E164,
} from "@care-y/shared";

export interface TelephonyContentService {
  listGreetings(phoneNumber?: E164): Promise<readonly GreetingRecord[]>;
  createGreeting(input: {
    phoneNumber: E164;
    greetingType: string;
    locale: string;
    text: string;
    isAudio?: boolean;
  }): Promise<GreetingRecord>;
  updateGreeting(
    id: PhoneGreetingId,
    input: { phoneNumber?: E164; text?: string; isAudio?: boolean },
  ): Promise<GreetingRecord>;
  deleteGreeting(id: PhoneGreetingId): Promise<void>;
  uploadGreetingAudio(
    blobStore: BlobStore,
    orgSchema: OrgSchema,
    greetingId: PhoneGreetingId,
    audioBase64: string,
    contentType: GreetingAudioContentType,
  ): Promise<GreetingRecord>;
  createAudioGreeting(
    blobStore: BlobStore,
    orgSchema: OrgSchema,
    input: {
      phoneNumber: E164;
      greetingType: string;
      locale: string;
      audioBase64: string;
      contentType: GreetingAudioContentType;
    },
  ): Promise<GreetingRecord>;
  /** Fetch audio blob bytes for a greeting by its ID. */
  getGreetingAudio(
    blobStore: BlobStore,
    greetingId: PhoneGreetingId,
  ): Promise<{ audioBase64: string; contentType: string }>;
  listSmsResponses(locale?: string): Promise<readonly SmsResponseRecord[]>;
  createSmsResponse(input: {
    responseType: string;
    locale: string;
    text: string;
  }): Promise<SmsResponseRecord>;
  updateSmsResponse(
    id: SmsResponseId,
    input: { text?: string },
  ): Promise<SmsResponseRecord>;
  deleteSmsResponse(id: SmsResponseId): Promise<void>;
}

async function validateAndStoreAudio(
  blobStore: BlobStore,
  orgSchema: OrgSchema,
  audioBase64: string,
  contentType: GreetingAudioContentType,
): Promise<{ blobKey: BlobKey; verified: GreetingAudioContentType }> {
  const audioBuf = Buffer.from(audioBase64, "base64");

  if (audioBuf.length > GREETING_AUDIO_MAX_BYTES) {
    throw new ValidationError(
      `Audio file exceeds ${String(GREETING_AUDIO_MAX_BYTES / (1024 * 1024))} MB limit`,
    );
  }

  const verified = validateAudioMagicBytes(audioBuf, contentType);
  if (verified === null) {
    throw new ValidationError(
      "Audio magic bytes do not match declared content type",
    );
  }

  const blobKey = await blobStore.put(orgSchema, "greeting", audioBuf);
  return { blobKey, verified };
}

export function createTelephonyContentService(
  tenantDb: Kysely<TenantDatabase>,
): TelephonyContentService {
  const greetingRepo = createGreetingRepository(tenantDb);
  const smsResponseRepo = createSmsResponseRepository(tenantDb);

  return {
    async listGreetings(
      phoneNumber?: E164,
    ): Promise<readonly GreetingRecord[]> {
      if (phoneNumber !== undefined && phoneNumber !== "") {
        return greetingRepo.listByNumber(phoneNumber);
      }
      return greetingRepo.listAll();
    },

    async createGreeting(input: {
      phoneNumber: E164;
      greetingType: string;
      locale: string;
      text: string;
      isAudio?: boolean;
    }): Promise<GreetingRecord> {
      return greetingRepo.create(input);
    },

    async updateGreeting(
      id: PhoneGreetingId,
      input: { phoneNumber?: E164; text?: string; isAudio?: boolean },
    ): Promise<GreetingRecord> {
      return greetingRepo.update(id, input);
    },

    async deleteGreeting(id: PhoneGreetingId): Promise<void> {
      await greetingRepo.delete(id);
    },

    async uploadGreetingAudio(
      blobStore: BlobStore,
      orgSchema: OrgSchema,
      greetingId: PhoneGreetingId,
      audioBase64: string,
      contentType: GreetingAudioContentType,
    ): Promise<GreetingRecord> {
      const { blobKey, verified } = await validateAndStoreAudio(
        blobStore,
        orgSchema,
        audioBase64,
        contentType,
      );
      return greetingRepo.update(greetingId, {
        isAudio: true,
        audioBlobKey: blobKey,
        audioContentType: verified,
      });
    },

    async createAudioGreeting(
      blobStore: BlobStore,
      orgSchema: OrgSchema,
      input: {
        phoneNumber: E164;
        greetingType: string;
        locale: string;
        audioBase64: string;
        contentType: GreetingAudioContentType;
      },
    ): Promise<GreetingRecord> {
      const { blobKey, verified } = await validateAndStoreAudio(
        blobStore,
        orgSchema,
        input.audioBase64,
        input.contentType,
      );
      return greetingRepo.create({
        phoneNumber: input.phoneNumber,
        greetingType: input.greetingType,
        locale: input.locale,
        text: "",
        isAudio: true,
        audioBlobKey: blobKey,
        audioContentType: verified,
      });
    },

    async getGreetingAudio(
      blobStore: BlobStore,
      greetingId: PhoneGreetingId,
    ): Promise<{ audioBase64: string; contentType: string }> {
      const greeting = await greetingRepo.findById(greetingId);
      if (!greeting) {
        throw new NotFoundError(ErrorCode.GREETING_NOT_FOUND);
      }
      if (!greeting.isAudio || greeting.audioBlobKey === null) {
        throw new ValidationError("Greeting does not have audio content");
      }
      const blob = await blobStore.get(greeting.audioBlobKey);
      if (blob === null) {
        throw new NotFoundError(ErrorCode.GREETING_NOT_FOUND);
      }
      return {
        audioBase64: blob.toString("base64"),
        contentType: greeting.audioContentType ?? "application/octet-stream",
      };
    },

    async listSmsResponses(
      locale?: string,
    ): Promise<readonly SmsResponseRecord[]> {
      return smsResponseRepo.list(locale);
    },

    async createSmsResponse(input: {
      responseType: string;
      locale: string;
      text: string;
    }): Promise<SmsResponseRecord> {
      return smsResponseRepo.create(input);
    },

    async updateSmsResponse(
      id: SmsResponseId,
      input: { text?: string },
    ): Promise<SmsResponseRecord> {
      return smsResponseRepo.update(id, input);
    },

    async deleteSmsResponse(id: SmsResponseId): Promise<void> {
      await smsResponseRepo.delete(id);
    },
  };
}
