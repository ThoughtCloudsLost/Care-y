import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  seedOrgPublicKey,
  testSealedBox,
  TEST_OPS_KEY,
  type TestDb,
} from "../test-utils.js";
import {
  createNoteTypeService,
  seedDefaultNoteTypes,
  DEFAULT_NOTE_TYPES,
  type NoteTypeService,
} from "./note-type-service.js";
import { createSecretsEncryptor } from "../config/secrets.js";
import { deriveSecretsKey } from "../config/secrets.js";
import type { SecretsEncryptor } from "../config/secrets.js";
import { RoleId, type EscalationTarget } from "@care-y/shared";
import { NotFoundError, ForbiddenError } from "../errors.js";

describe.skipIf(!process.env.DATABASE_URL)("NoteTypeService (DB)", () => {
  let testDb: TestDb;
  let svc: NoteTypeService;
  let secretsEncryptor: SecretsEncryptor;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    const secretsKey = deriveSecretsKey(TEST_OPS_KEY);
    secretsEncryptor = createSecretsEncryptor(secretsKey);
    svc = createNoteTypeService(testDb.db, secretsEncryptor);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  describe("create", () => {
    it("sets default role gating to volunteer", async () => {
      const nt = await svc.create({
        encryptedName: Buffer.from("test-type"),
        encryptedIcon: Buffer.from("star"),
        escalationTargets: [],
      });

      expect(nt.minViewRole).toBe(RoleId.VOLUNTEER);
      expect(nt.minCreateRole).toBe(RoleId.VOLUNTEER);
    });

    it("accepts explicit min role values", async () => {
      const nt = await svc.create({
        encryptedName: Buffer.from("manager-only"),
        encryptedIcon: Buffer.from("shield"),
        escalationTargets: [],
        minViewRole: RoleId.MANAGER,
        minCreateRole: RoleId.ADMIN,
      });

      expect(nt.minViewRole).toBe(RoleId.MANAGER);
      expect(nt.minCreateRole).toBe(RoleId.ADMIN);
    });

    it("allows create role below view role (escalation pattern)", async () => {
      const nt = await svc.create({
        encryptedName: Buffer.from("escalation-type"),
        encryptedIcon: Buffer.from("shield"),
        escalationTargets: [],
        minViewRole: RoleId.ADMIN,
        minCreateRole: RoleId.VOLUNTEER,
      });

      expect(nt.minViewRole).toBe(RoleId.ADMIN);
      expect(nt.minCreateRole).toBe(RoleId.VOLUNTEER);
    });

    it("stores and returns requiresOnClose flag", async () => {
      const nt = await svc.create({
        encryptedName: Buffer.from("close-required"),
        encryptedIcon: Buffer.from("clipboard"),
        escalationTargets: [],
        requiresOnClose: true,
      });

      expect(nt.requiresOnClose).toBe(true);
    });

    it("defaults requiresOnClose to false", async () => {
      const nt = await svc.create({
        encryptedName: Buffer.from("no-close"),
        encryptedIcon: Buffer.from("note"),
        escalationTargets: [],
      });

      expect(nt.requiresOnClose).toBe(false);
    });
  });

  describe("update", () => {
    it("updates encryptedName and encryptedIcon", async () => {
      const created = await svc.create({
        encryptedName: Buffer.from("original"),
        encryptedIcon: Buffer.from("old-icon"),
        escalationTargets: [],
      });

      const updated = await svc.update({
        id: created.id,
        encryptedName: Buffer.from("renamed"),
        encryptedIcon: Buffer.from("new-icon"),
      });

      expect(updated.encryptedName.toString()).toBe("renamed");
      expect(updated.encryptedIcon.toString()).toBe("new-icon");
    });

    it("updates escalation targets (roundtrip through encryption)", async () => {
      const targets: EscalationTarget[] = [
        { type: "role", value: "admin" },
        { type: "ticket_access" },
      ];
      const created = await svc.create({
        encryptedName: Buffer.from("esc-test"),
        encryptedIcon: Buffer.from("bell"),
        escalationTargets: [],
      });

      await svc.update({ id: created.id, escalationTargets: targets });

      const retrieved = await svc.getEscalationTargets(created.id);
      expect(retrieved).toEqual(targets);
    });

    it("deactivates a non-default type", async () => {
      const nt = await svc.create({
        encryptedName: Buffer.from("deactivate-me"),
        encryptedIcon: Buffer.from("x"),
        escalationTargets: [],
      });

      const updated = await svc.update({ id: nt.id, isActive: false });
      expect(updated.isActive).toBe(false);
    });

    it("throws NotFoundError for nonexistent ID", async () => {
      await expect(
        svc.update({
          id: "00000000-0000-0000-0000-000000000000",
          encryptedName: Buffer.from("nope"),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("returns existing row when no fields to update", async () => {
      const created = await svc.create({
        encryptedName: Buffer.from("no-op-update"),
        encryptedIcon: Buffer.from("circle"),
        escalationTargets: [],
      });

      const result = await svc.update({ id: created.id });
      expect(result.id).toBe(created.id);
      expect(result.encryptedName.toString()).toBe("no-op-update");
    });

    it("throws NotFoundError on no-op update for nonexistent ID", async () => {
      await expect(
        svc.update({ id: "00000000-0000-0000-0000-000000000000" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("rejects deactivation of the default note type", async () => {
      const nt = await svc.create({
        encryptedName: Buffer.from("default-guard"),
        encryptedIcon: Buffer.from("lock"),
        escalationTargets: [],
      });

      await testDb.db
        .updateTable("org_config")
        .set({ default_note_type_id: nt.id })
        .execute();

      await expect(svc.update({ id: nt.id, isActive: false })).rejects.toThrow(
        ForbiddenError,
      );

      await testDb.db
        .updateTable("org_config")
        .set({ default_note_type_id: null })
        .execute();
    });

    it("allows other updates on the default note type", async () => {
      const nt = await svc.create({
        encryptedName: Buffer.from("default-rename"),
        encryptedIcon: Buffer.from("star"),
        escalationTargets: [],
      });

      await testDb.db
        .updateTable("org_config")
        .set({ default_note_type_id: nt.id })
        .execute();

      const updated = await svc.update({
        id: nt.id,
        encryptedName: Buffer.from("still-default"),
      });

      expect(updated.encryptedName.toString()).toBe("still-default");
      expect(updated.isActive).toBe(true);

      await testDb.db
        .updateTable("org_config")
        .set({ default_note_type_id: null })
        .execute();
    });
  });

  describe("list (admin)", () => {
    it("returns all types including inactive with decrypted targets", async () => {
      const targets: EscalationTarget[] = [{ type: "role", value: "admin" }];
      const active = await svc.create({
        encryptedName: Buffer.from("list-active"),
        encryptedIcon: Buffer.from("a"),
        escalationTargets: targets,
      });
      const inactive = await svc.create({
        encryptedName: Buffer.from("list-inactive"),
        encryptedIcon: Buffer.from("b"),
        escalationTargets: [],
      });
      await svc.update({ id: inactive.id, isActive: false });

      const all = await svc.list();
      const ids = all.map((t) => t.id);

      expect(ids).toContain(active.id);
      expect(ids).toContain(inactive.id);

      const adminType = all.find((t) => t.id === active.id);
      expect(adminType?.escalationTargets).toEqual(targets);
    });
  });

  describe("listActive", () => {
    it("returns canCreate based on caller role", async () => {
      const nt = await svc.create({
        encryptedName: Buffer.from("admin-create"),
        encryptedIcon: Buffer.from("lock"),
        escalationTargets: [],
        minCreateRole: RoleId.ADMIN,
      });

      const asVolunteer = await svc.listActive(RoleId.VOLUNTEER);
      const volType = asVolunteer.types.find((t) => t.id === nt.id);
      expect(volType?.canCreate).toBe(false);

      const asAdmin = await svc.listActive(RoleId.ADMIN);
      const adminType = asAdmin.types.find((t) => t.id === nt.id);
      expect(adminType?.canCreate).toBe(true);
    });

    it("excludes inactive types", async () => {
      const nt = await svc.create({
        encryptedName: Buffer.from("will-deactivate"),
        encryptedIcon: Buffer.from("x"),
        escalationTargets: [],
      });
      await svc.update({ id: nt.id, isActive: false });

      const result = await svc.listActive(RoleId.ADMIN);
      const ids = result.types.map((t) => t.id);
      expect(ids).not.toContain(nt.id);
    });

    it("includes notificationHints derived from targets", async () => {
      const nt = await svc.create({
        encryptedName: Buffer.from("hints-test"),
        encryptedIcon: Buffer.from("bell"),
        escalationTargets: [
          { type: "role", value: "admin" },
          { type: "ticket_access" },
        ],
      });

      const result = await svc.listActive(RoleId.ADMIN);
      const found = result.types.find((t) => t.id === nt.id);
      expect(found?.notificationHints).toEqual(
        expect.arrayContaining(["role:admin", "ticket_access"]),
      );
    });

    it("returns defaultNoteTypeId from org_config", async () => {
      const nt = await svc.create({
        encryptedName: Buffer.from("default-check"),
        encryptedIcon: Buffer.from("d"),
        escalationTargets: [],
      });

      await testDb.db
        .updateTable("org_config")
        .set({ default_note_type_id: nt.id })
        .execute();

      const result = await svc.listActive(RoleId.VOLUNTEER);
      expect(result.defaultNoteTypeId).toBe(nt.id);

      await testDb.db
        .updateTable("org_config")
        .set({ default_note_type_id: null })
        .execute();
    });
  });

  describe("getEscalationContext", () => {
    it("returns targets and minViewRole for existing type", async () => {
      const targets: EscalationTarget[] = [
        { type: "role", value: "manager" },
        { type: "ticket_access" },
      ];
      const nt = await svc.create({
        encryptedName: Buffer.from("ctx-test"),
        encryptedIcon: Buffer.from("shield"),
        escalationTargets: targets,
        minViewRole: RoleId.MANAGER,
      });

      const ctx = await svc.getEscalationContext(nt.id);
      expect(ctx).not.toBeNull();
      expect(ctx!.targets).toEqual(targets);
      expect(ctx!.minViewRole).toBe(RoleId.MANAGER);
    });

    it("returns null for nonexistent type", async () => {
      const ctx = await svc.getEscalationContext(
        "00000000-0000-0000-0000-000000000000",
      );
      expect(ctx).toBeNull();
    });
  });

  describe("getEscalationTargets", () => {
    it("returns empty array for nonexistent type", async () => {
      const targets = await svc.getEscalationTargets(
        "00000000-0000-0000-0000-000000000000",
      );
      expect(targets).toEqual([]);
    });

    it("returns empty array for type with no targets", async () => {
      const nt = await svc.create({
        encryptedName: Buffer.from("no-targets"),
        encryptedIcon: Buffer.from("circle"),
        escalationTargets: [],
      });

      const targets = await svc.getEscalationTargets(nt.id);
      expect(targets).toEqual([]);
    });
  });

  describe("getMinCreateRole", () => {
    it("returns the stored value", async () => {
      const nt = await svc.create({
        encryptedName: Buffer.from("role-check"),
        encryptedIcon: Buffer.from("key"),
        escalationTargets: [],
        minCreateRole: RoleId.MANAGER,
      });

      const role = await svc.getMinCreateRole(nt.id);
      expect(role).toBe(RoleId.MANAGER);
    });

    it("returns undefined for nonexistent type", async () => {
      const role = await svc.getMinCreateRole(
        "00000000-0000-0000-0000-000000000000",
      );
      expect(role).toBeUndefined();
    });
  });

  describe("getDefaultTypeId", () => {
    it("returns null when no default is set", async () => {
      await testDb.db
        .updateTable("org_config")
        .set({ default_note_type_id: null })
        .execute();

      const id = await svc.getDefaultTypeId();
      expect(id).toBeNull();
    });

    it("returns the configured default", async () => {
      const nt = await svc.create({
        encryptedName: Buffer.from("default-id-test"),
        encryptedIcon: Buffer.from("d"),
        escalationTargets: [],
      });

      await testDb.db
        .updateTable("org_config")
        .set({ default_note_type_id: nt.id })
        .execute();

      const id = await svc.getDefaultTypeId();
      expect(id).toBe(nt.id);

      await testDb.db
        .updateTable("org_config")
        .set({ default_note_type_id: null })
        .execute();
    });
  });

  describe("seedDefaultNoteTypes", () => {
    it("creates all default types and sets Comment as default", async () => {
      const seedDb = await createTestDb();
      try {
        await seedOrgPublicKey(seedDb.db);

        await seedDb.db
          .insertInto("org_config")
          .values({ org_public_key: null })
          .onConflict((oc) => oc.doNothing())
          .execute();

        await seedDefaultNoteTypes(seedDb.db, testSealedBox, secretsEncryptor);

        const seedSvc = createNoteTypeService(seedDb.db, secretsEncryptor);
        const all = await seedSvc.list();

        expect(all).toHaveLength(DEFAULT_NOTE_TYPES.length);

        const defaultId = await seedSvc.getDefaultTypeId();
        expect(defaultId).toBeDefined();

        const defaultType = all.find((t) => t.id === defaultId);
        expect(defaultType).toBeDefined();
        expect(defaultType!.requiresOnClose).toBe(false);

        const resolutionType = all.find((t) => t.requiresOnClose);
        expect(resolutionType).toBeDefined();

        for (const nt of all) {
          expect(nt.encryptedName).toBeInstanceOf(Buffer);
          expect(nt.encryptedIcon).toBeInstanceOf(Buffer);
          expect(nt.encryptedName.length).toBeGreaterThan(0);
        }
      } finally {
        await seedDb.cleanup();
      }
    });

    it("encrypts escalation targets that can be decrypted by the service", async () => {
      const seedDb = await createTestDb();
      try {
        await seedOrgPublicKey(seedDb.db);

        await seedDb.db
          .insertInto("org_config")
          .values({ org_public_key: null })
          .onConflict((oc) => oc.doNothing())
          .execute();

        await seedDefaultNoteTypes(seedDb.db, testSealedBox, secretsEncryptor);

        const seedSvc = createNoteTypeService(seedDb.db, secretsEncryptor);
        const all = await seedSvc.list();

        const safetyConcern = all.find((t) =>
          t.escalationTargets.some(
            (et) => et.type === "role" && et.value === "admin",
          ),
        );
        expect(safetyConcern).toBeDefined();
        expect(safetyConcern!.escalationTargets.length).toBeGreaterThan(1);
      } finally {
        await seedDb.cleanup();
      }
    });
  });
});
