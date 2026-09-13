/**
 * Browser-side intake form fixture helpers.
 *
 * The intake form creation flow runs inside page.evaluate() because field
 * labels and configs must be encrypted with the org branding key, which
 * only exists in browser sessions. This module extracts the shared
 * scaffolding (import crypto modules, fetch org public key, save form,
 * activate form) so individual specs only define their field layouts.
 */

import type { Page } from "@playwright/test";
import { E2eError } from "./helpers";

// ── Types passed into page.evaluate ──────────────────────────────────

/** A field definition consumed by the browser-side fixture. */
export interface IntakeFieldSpec {
  /** Visible label (English). */
  readonly label: string;
  /** Field type and any type-specific config (options, subtype, range, etc.). */
  readonly config: Record<string, unknown>;
  /** Whether the field is required on the form. */
  readonly required: boolean;
  /** Visibility condition (conditional fields). */
  readonly visibleWhen?: Record<string, unknown>;
  /**
   * Stable field key. Omit to auto-generate; pass explicitly when another
   * field's visibleWhen references this field by key.
   */
  readonly fieldKey?: string;
}

/** Options for createIntakeFormFixture. */
export interface CreateIntakeFormOpts {
  readonly name: string;
  readonly slug: string;
  readonly destinationQueueId?: string;
  readonly fields: readonly IntakeFieldSpec[];
}

/** Successful result from the browser-side fixture. */
export interface IntakeFormFixtureResult {
  readonly formId: string;
}

/**
 * Create an intake form through the browser-side crypto pipeline.
 *
 * Runs inside page.evaluate: imports the form crypto and @care-y/crypto
 * modules via the Vite dev server, fetches the org public key, encrypts
 * each field, calls intakeForms.save, and activates the form. The page
 * must be logged in as an admin before calling this.
 */
export async function createIntakeFormFixture(
  page: Page,
  opts: CreateIntakeFormOpts,
): Promise<IntakeFormFixtureResult> {
  const result = await page.evaluate(
    async (args: {
      name: string;
      slug: string;
      destinationQueueId: string | undefined;
      fields: {
        label: string;
        config: Record<string, unknown>;
        required: boolean;
        visibleWhen?: Record<string, unknown>;
        fieldKey?: string;
      }[];
    }) => {
      // Dynamic imports resolve through the Vite dev server, giving
      // access to the same crypto helpers the admin form editor uses.
      // Specifiers go through variables: the e2e tsconfig cannot type
      // browser-served module paths, and a bare package specifier does
      // not resolve in a native browser import, so the crypto barrel
      // goes through Vite's /@id/ resolution endpoint.
      const formCryptoUrl = "/src/lib/portal/intake-form-crypto.ts";
      const cryptoBarrelUrl = "/@id/@care-y/crypto";
      const { encryptFieldContent } = (await import(formCryptoUrl)) as {
        encryptFieldContent: (
          plain: {
            label: Record<string, string>;
            config: Record<string, unknown>;
            visibleWhen?: Record<string, unknown>;
          },
          orgPub: Uint8Array,
        ) => { encryptedLabel: string; encryptedConfig: string };
      };
      const { decode } = (await import(cryptoBarrelUrl)) as {
        decode: (b64: string) => Uint8Array;
      };

      // Fetch the org public key from the public branding endpoint.
      const brandingRes = await fetch("/trpc/branding.getPublicBranding", {
        credentials: "include",
      });
      if (!brandingRes.ok) {
        return { ok: false as const, error: "branding fetch failed" };
      }
      const brandingJson = (await brandingRes.json()) as {
        result: { data: { orgPublicKey: string | null } };
      };
      const orgPubB64 = brandingJson.result.data.orgPublicKey;
      if (orgPubB64 === null) {
        return { ok: false as const, error: "org public key is null" };
      }
      const orgPub = decode(orgPubB64);

      // Encrypt each field and build the save payload.
      const fields = args.fields.map((f) => {
        const enc = encryptFieldContent(
          {
            label: { en: f.label },
            config: f.config,
            ...(f.visibleWhen != null && { visibleWhen: f.visibleWhen }),
          },
          orgPub,
        );
        return {
          fieldKey: f.fieldKey ?? crypto.randomUUID(),
          fieldType: typeof f.config.type === "string" ? f.config.type : "text",
          encryptedLabel: enc.encryptedLabel,
          encryptedConfig: enc.encryptedConfig,
          isRequired: f.required,
        };
      });

      // Save form via the admin tRPC mutation.
      const saveRes = await fetch("/trpc/intakeForms.save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          formId: null,
          name: args.name,
          slug: args.slug,
          isDefault: false,
          ...(args.destinationQueueId != null && {
            destinationQueueId: args.destinationQueueId,
          }),
          fields,
        }),
      });
      if (!saveRes.ok) {
        const body = await saveRes.text();
        return { ok: false as const, error: `save failed: ${body}` };
      }
      const saveData = (await saveRes.json()) as {
        result: { data: { formId: string } };
      };

      // New forms are drafts (is_active defaults to false) and the
      // public slug lookup only returns active forms; activate it.
      const actRes = await fetch("/trpc/intakeForms.setActive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          formId: saveData.result.data.formId,
          active: true,
        }),
      });
      if (!actRes.ok) {
        const body = await actRes.text();
        return { ok: false as const, error: `activate failed: ${body}` };
      }

      return { ok: true as const, formId: saveData.result.data.formId };
    },
    {
      name: opts.name,
      slug: opts.slug,
      destinationQueueId: opts.destinationQueueId,
      fields: opts.fields.map((f) => ({
        label: f.label,
        config: f.config,
        required: f.required,
        visibleWhen: f.visibleWhen,
        fieldKey: f.fieldKey,
      })),
    },
  );

  if (!result.ok) {
    throw new E2eError(`Intake form fixture failed: ${result.error}`);
  }
  return { formId: result.formId };
}
