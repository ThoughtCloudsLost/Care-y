/**
 * Service layer for phone greeting and SMS response content management.
 *
 * Wraps greeting and SMS response repositories. Routes delegate here
 * instead of creating repositories directly.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  createGreetingRepository,
  type GreetingRecord,
} from "./models/greeting-repo.js";
import {
  createSmsResponseRepository,
  type SmsResponseRecord,
} from "./models/sms-response-repo.js";

export interface TelephonyContentService {
  listGreetings(phoneId: string): Promise<readonly GreetingRecord[]>;
  createGreeting(input: {
    phoneId: string;
    greetingType: string;
    locale: string;
    text: string;
    isAudio?: boolean;
  }): Promise<GreetingRecord>;
  updateGreeting(
    id: string,
    input: { text?: string; isAudio?: boolean },
  ): Promise<GreetingRecord>;
  deleteGreeting(id: string): Promise<void>;
  listSmsResponses(locale?: string): Promise<readonly SmsResponseRecord[]>;
  createSmsResponse(input: {
    responseType: string;
    locale: string;
    text: string;
  }): Promise<SmsResponseRecord>;
  updateSmsResponse(
    id: string,
    input: { text?: string },
  ): Promise<SmsResponseRecord>;
  deleteSmsResponse(id: string): Promise<void>;
}

export function createTelephonyContentService(
  tenantDb: Kysely<TenantDatabase>,
): TelephonyContentService {
  const greetingRepo = createGreetingRepository(tenantDb);
  const smsResponseRepo = createSmsResponseRepository(tenantDb);

  return {
    async listGreetings(phoneId: string): Promise<readonly GreetingRecord[]> {
      return greetingRepo.listByPhone(phoneId);
    },

    async createGreeting(input: {
      phoneId: string;
      greetingType: string;
      locale: string;
      text: string;
      isAudio?: boolean;
    }): Promise<GreetingRecord> {
      return greetingRepo.create(input);
    },

    async updateGreeting(
      id: string,
      input: { text?: string; isAudio?: boolean },
    ): Promise<GreetingRecord> {
      return greetingRepo.update(id, input);
    },

    async deleteGreeting(id: string): Promise<void> {
      await greetingRepo.delete(id);
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
      id: string,
      input: { text?: string },
    ): Promise<SmsResponseRecord> {
      return smsResponseRepo.update(id, input);
    },

    async deleteSmsResponse(id: string): Promise<void> {
      await smsResponseRepo.delete(id);
    },
  };
}
