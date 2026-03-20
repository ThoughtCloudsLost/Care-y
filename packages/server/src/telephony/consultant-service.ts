/**
 * Service layer for volunteer consultant phone registration and verification.
 *
 * Owns the verification code generation, hashing, and expiry logic that
 * was previously inline in the route. Routes delegate here instead of
 * creating repositories directly.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { createConsultantRepository } from "./models/consultant-repo.js";
import { randomInt, createHash } from "node:crypto";
import { NotFoundError, AuthError } from "../errors.js";

const VERIFICATION_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export interface ConsultantInfo {
  readonly id: string;
  readonly isVerified: boolean;
  readonly preferredCallMethod: string;
}

export interface ConsultantService {
  getByUserId(userId: string): Promise<ConsultantInfo | null>;
  register(
    userId: string,
    encryptedPhone: Buffer,
    phoneHash: string,
    preferredCallMethod: string,
  ): Promise<{ id: string }>;
  verify(userId: string, code: string): Promise<void>;
  updatePreference(userId: string, preferredCallMethod: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

export function createConsultantService(
  tenantDb: Kysely<TenantDatabase>,
): ConsultantService {
  const repo = createConsultantRepository(tenantDb);

  return {
    async getByUserId(userId: string): Promise<ConsultantInfo | null> {
      const record = await repo.findByUserId(userId);
      if (!record) return null;
      return {
        id: record.id,
        isVerified: record.isVerified,
        preferredCallMethod: record.preferredCallMethod,
      };
    },

    async register(
      userId: string,
      encryptedPhone: Buffer,
      phoneHash: string,
      preferredCallMethod: string,
    ): Promise<{ id: string }> {
      const consultant = await repo.create({
        userId,
        encryptedPhone,
        phoneHash,
        preferredCallMethod,
      });

      const code = String(randomInt(100000, 1000000));
      const codeHash = hashCode(code);
      const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_MS);

      await repo.setVerificationCode(consultant.id, codeHash, expiresAt);

      // SMS sending requires relay endpoints (not yet implemented).
      // Code is stored but not yet delivered.

      return { id: consultant.id };
    },

    async verify(userId: string, code: string): Promise<void> {
      const record = await repo.findByUserId(userId);
      if (!record) {
        throw new NotFoundError("No consultant registration found");
      }

      const codeHash = hashCode(code);
      const verified = await repo.verifyAndActivate(
        record.id,
        codeHash,
        new Date(),
      );

      if (!verified) {
        throw new AuthError("Invalid or expired verification code");
      }
    },

    async updatePreference(
      userId: string,
      preferredCallMethod: string,
    ): Promise<void> {
      const record = await repo.findByUserId(userId);
      if (!record) {
        throw new NotFoundError("No consultant registration found");
      }

      await repo.updatePreferredCallMethod(record.id, preferredCallMethod);
    },

    async deleteByUserId(userId: string): Promise<void> {
      const record = await repo.findByUserId(userId);
      if (!record) {
        throw new NotFoundError("No consultant registration found");
      }

      await repo.delete(record.id);
    },
  };
}
