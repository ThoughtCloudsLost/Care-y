import { randomBytes } from "node:crypto";
import type { Kysely } from "kysely";
import { RoleId, ErrorCode } from "@care-y/shared";
import type { TenantDatabase } from "../db/types.js";
import { isPgUniqueViolation } from "../db/pg-errors.js";
import { ConflictError } from "../errors.js";
import { SESSION_MAX_AGE_MS } from "../auth/service.js";
import { createInviteService } from "./invite-service.js";
import {
  createScopedAuthService,
  createTenantSessions,
  type OrgContext,
} from "../trpc/context.js";
import type {
  FieldEncryptor,
  BlindIndexer,
} from "../crypto/field-encryptor.js";
import type { SessionTokenizer } from "../crypto/session-tokenizer.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import { createSealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { PasswordHasher } from "../auth/password.js";
import type { SecretsEncryptor } from "../config/secrets.js";

// ── Types ────────────────────────────────────────────────────────────

export interface OnboardingServiceDeps {
  readonly hasher: PasswordHasher;
  readonly encryptor: FieldEncryptor;
  readonly indexer: BlindIndexer;
  readonly tokenizer: SessionTokenizer;
  readonly secretsEncryptor: SecretsEncryptor;
}

export interface BootstrapAdminInput {
  readonly identifier: string;
  readonly password: string;
  readonly displayName: string;
  readonly preferredLocale: string | undefined;
  readonly orgPublicKey: Buffer;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly orgId: string;
}

export interface RegisterFromInviteInput {
  readonly identifier: string;
  readonly password: string;
  readonly displayName: string;
  readonly preferredLocale: string | undefined;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly invite: {
    readonly id: string;
    readonly roleId: string;
  };
}

export interface UpdateOrgGeneralInput {
  readonly encryptedOrgName: string;
  readonly countryCode: string;
  readonly defaultLanguage: string;
  readonly encryptedTerminology?: string;
}

export interface SaveTelephonyInput {
  readonly mode: string;
  readonly accountSid?: string;
  readonly authToken?: string;
}

export interface OnboardingService {
  getSetupStatus(): Promise<{ needsSetup: boolean }>;

  bootstrapAdmin(
    input: BootstrapAdminInput,
  ): Promise<{ userId: string; sessionToken: string }>;

  registerFromInvite(
    input: RegisterFromInviteInput,
    sealedBox: SealedBoxEncryptor,
    orgCtx: { orgId: string; orgSlug: string; orgSchema: string },
  ): Promise<{ userId: string; sessionToken: string }>;

  updateOrgGeneral(input: UpdateOrgGeneralInput): Promise<void>;

  saveTelephonyChoice(input: SaveTelephonyInput): Promise<{ mode: string }>;
}

// ── Standalone helper ────────────────────────────────────────────────

export async function resolveOrgPublicKey(
  tenantDb: Kysely<TenantDatabase>,
): Promise<SealedBoxEncryptor | null> {
  const row = await tenantDb
    .selectFrom("org_config")
    .select("org_public_key")
    .executeTakeFirst();

  if (!row?.org_public_key) return null;
  return createSealedBoxEncryptor(row.org_public_key);
}

// ── Factory ──────────────────────────────────────────────────────────

export function createOnboardingService(
  db: Kysely<TenantDatabase>,
  deps: OnboardingServiceDeps,
): OnboardingService {
  const { hasher, encryptor, indexer, tokenizer, secretsEncryptor } = deps;

  return {
    async getSetupStatus(): Promise<{ needsSetup: boolean }> {
      const userCount = await db
        .selectFrom("users")
        .select(db.fn.countAll<string>().as("count"))
        .where("is_active", "=", true)
        .executeTakeFirstOrThrow();

      const config = await db
        .selectFrom("org_config")
        .select(["org_public_key", "setup_completed"])
        .executeTakeFirst();

      return {
        needsSetup:
          Number(userCount.count) === 0 ||
          !config?.org_public_key ||
          !config.setup_completed,
      };
    },

    async bootstrapAdmin(
      input: BootstrapAdminInput,
    ): Promise<{ userId: string; sessionToken: string }> {
      const orgPublicKey = input.orgPublicKey;
      const sealedBox = createSealedBoxEncryptor(orgPublicKey);

      const identifierHash = indexer.hash(input.identifier, input.orgId);
      // ADR-052: identifier is org-key tier (sealed box, server-blind)
      const encryptedIdentifier = sealedBox.seal(input.identifier);
      const encryptedDisplayName = sealedBox.seal(input.displayName);
      const encryptedPreferredLocale =
        input.preferredLocale !== undefined
          ? sealedBox.seal(input.preferredLocale)
          : null;
      const passwordHash = await hasher.hash(input.password);

      return db.transaction().execute(async (tx) => {
        const activeCount = await tx
          .selectFrom("users")
          .select(tx.fn.countAll<string>().as("count"))
          .where("is_active", "=", true)
          .executeTakeFirstOrThrow();

        if (Number(activeCount.count) > 0) {
          throw new ConflictError(ErrorCode.ORG_ALREADY_SETUP);
        }

        await tx
          .updateTable("org_config")
          .set({ org_public_key: orgPublicKey })
          .execute();

        let userRow;
        try {
          userRow = await tx
            .insertInto("users")
            .values({
              identifier_hash: identifierHash,
              encrypted_identifier: encryptedIdentifier,
              password_hash: passwordHash,
              encrypted_display_name: encryptedDisplayName,
              encrypted_preferred_locale: encryptedPreferredLocale,
              role_id: RoleId.ADMIN,
              has_seen_briefing: false,
            })
            .returning("id")
            .executeTakeFirstOrThrow();
        } catch (err: unknown) {
          if (isPgUniqueViolation(err)) {
            throw new ConflictError(ErrorCode.ACCOUNT_ALREADY_EXISTS);
          }
          throw err;
        }

        const token = randomBytes(32).toString("hex");
        const encryptedIp = sealedBox.seal(input.ipAddress);
        const encryptedUa = sealedBox.seal(input.userAgent);
        const ipToken = tokenizer.tokenize(input.ipAddress);
        const uaToken = tokenizer.tokenize(input.userAgent);

        await tx
          .insertInto("sessions")
          .values({
            token,
            user_id: userRow.id,
            encrypted_ip_address: encryptedIp,
            encrypted_user_agent: encryptedUa,
            ip_token: ipToken,
            ua_token: uaToken,
            twofa_verified: true,
            expires_at: new Date(Date.now() + SESSION_MAX_AGE_MS),
          })
          .execute();

        return { userId: userRow.id, sessionToken: token };
      });
    },

    async registerFromInvite(
      input: RegisterFromInviteInput,
      sealedBox: SealedBoxEncryptor,
      orgCtx: { orgId: string; orgSlug: string; orgSchema: string },
    ): Promise<{ userId: string; sessionToken: string }> {
      return db.transaction().execute(async (tx) => {
        const txOrgCtx: OrgContext = {
          orgId: orgCtx.orgId,
          orgSlug: orgCtx.orgSlug,
          orgSchema: orgCtx.orgSchema,
          tenantDb: tx,
          sealedBox,
        };

        const txSessions = createTenantSessions(txOrgCtx, tokenizer);
        const txAuth = createScopedAuthService(txOrgCtx, txSessions, {
          hasher,
          encryptor,
          indexer,
          tokenizer,
        });
        const txInvite = createInviteService(tx);

        const user = await txAuth.register({
          identifier: input.identifier,
          password: input.password,
          displayName: input.displayName,
          preferredLocale: input.preferredLocale,
          roleId: input.invite.roleId,
        });

        await txAuth.markBriefingSeen(user.id);
        await txInvite.consume(input.invite.id);

        const session = await txSessions.create({
          token: randomBytes(32).toString("hex"),
          userId: user.id,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS),
        });

        return { userId: user.id, sessionToken: session.token };
      });
    },

    async updateOrgGeneral(input: UpdateOrgGeneralInput): Promise<void> {
      const updates: Record<string, unknown> = {
        encrypted_name: Buffer.from(input.encryptedOrgName, "base64"),
        default_country_code: input.countryCode,
        default_language: input.defaultLanguage,
      };
      if (input.encryptedTerminology !== undefined) {
        updates.encrypted_terminology = Buffer.from(
          input.encryptedTerminology,
          "base64",
        );
      }

      await db.updateTable("org_config").set(updates).execute();
    },

    async saveTelephonyChoice(
      input: SaveTelephonyInput,
    ): Promise<{ mode: string }> {
      let telephonyConfig: Record<string, string>;

      if (
        input.mode === "byot" &&
        input.accountSid != null &&
        input.authToken != null
      ) {
        telephonyConfig = {
          mode: "byot",
          provider: "twilio",
          accountSid: input.accountSid,
          authToken: input.authToken,
        };
      } else {
        telephonyConfig = { mode: input.mode };
      }

      const encrypted = secretsEncryptor.encrypt(
        Buffer.from(JSON.stringify(telephonyConfig), "utf8"),
      );

      await db
        .updateTable("org_config")
        .set({ setup_telephony_config: encrypted })
        .execute();

      return { mode: input.mode };
    },
  };
}
