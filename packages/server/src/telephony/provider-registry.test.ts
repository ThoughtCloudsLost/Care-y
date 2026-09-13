/**
 * Provider-registry consistency tests.
 *
 * Five registries define "valid provider" in different layers, all now keyed
 * by the shared TELEPHONY_PROVIDER_IDS / STORED_PROVIDER_IDS arrays so an id
 * outside that source fails to compile:
 *   1. shared telephonyProviderSchema (z.enum, what users can select)
 *   2. server providerConfigSchemas (config validation per provider)
 *   3. server index.ts providerConstructors (runtime constructor map)
 *   4. server index.ts providerStatics (static metadata map)
 *   5. relay.ts readSignatureHeader switch (webhook signature lookup)
 *
 * Lists 3-5 live in runtime code that cannot be imported without side effects.
 * This file covers the relationship between lists 1 and 2 directly, and
 * tests constructor availability by importing provider modules. It documents
 * the gap for lists 4-5 so future drift is caught by a human reviewer.
 */

import { describe, it, expect } from "vitest";
import { telephonyProviderSchema } from "@care-y/shared";
import { providerConfigSchemas } from "./schemas.js";

describe("provider registry consistency", () => {
  // The user-facing enum decides which providers a user
  // can select in the admin UI. Every value must have a corresponding config
  // schema on the server so the factory can validate the decrypted blob.

  const userSelectableProviders = Object.values(
    telephonyProviderSchema.enum,
  ) as string[];

  const serverSchemaProviders = Object.keys(providerConfigSchemas);

  it("every user-selectable provider has a server-side config schema", () => {
    for (const provider of userSelectableProviders) {
      expect(
        serverSchemaProviders,
        `Provider "${provider}" is in the shared telephonyProviderSchema ` +
          `but has no entry in server providerConfigSchemas. A user can ` +
          `select it, but the server cannot validate its config.`,
      ).toContain(provider);
    }
  });

  // The inverse direction: config schemas that are NOT in the shared enum
  // are internal-only (e.g. "mock"). They should not be selectable by users,
  // but having a schema for them is fine (the factory validates whatever the
  // DB row says). This test documents which providers are server-only.

  it("server-only config schemas are not in the user-selectable enum", () => {
    const serverOnly = serverSchemaProviders.filter(
      (p) => !userSelectableProviders.includes(p),
    );
    // "mock" is expected to be server-only (dev/test, not user-selectable).
    // "signalwire" keeps its config schema (the stored shape is exercised by
    // config-service normalization) but was pulled from the selectable enum
    // until its provider module exists: selecting it would persist credentials
    // whose webhooks can never be verified.
    // If a new server-only provider appears, add it to this list explicitly.
    expect(serverOnly).toEqual(["signalwire", "mock"]);
  });

  // Runtime constructor coverage: providerConstructors in index.ts is built
  // at startup and cannot be imported without starting the server. This test
  // verifies that constructor modules exist by importing them. If a provider
  // has a config schema and is user-selectable but has no constructor module,
  // the factory will throw NotFoundError at runtime when an org configures it.

  it("every user-selectable provider has an importable constructor", async () => {
    // Each entry maps provider id to a dynamic import that resolves the
    // constructor function. If the provider module does not exist or does
    // not export a constructor, the import will fail and the test catches it.
    const constructorImports: Record<
      string,
      Promise<Record<string, unknown>>
    > = {
      twilio: import("./twilio.js"),
      // signalwire is declared in the shared schema but has no provider
      // implementation module. This test will fail for it.
    };

    for (const provider of userSelectableProviders) {
      const importPromise = constructorImports[provider];
      if (importPromise === undefined) {
        expect.fail(
          `Provider "${provider}" is user-selectable but has no ` +
            `constructor import registered in this test. Either the ` +
            `provider module has not been created, or this test needs ` +
            `updating. Users can select "${provider}" in the admin UI, ` +
            `but the factory cannot instantiate it at runtime.`,
        );
      }

      // Await the import to verify the module actually loads.
      const mod = await importPromise;
      expect(mod, `Provider "${provider}" module failed to load`).toBeDefined();
    }
  });
});
