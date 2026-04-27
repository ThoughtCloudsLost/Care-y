import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  seedOrgPublicKey,
  TEST_OPS_KEY,
  type TestDb,
} from "../test-utils.js";
import {
  createNoteTypeService,
  type NoteTypeService,
} from "./note-type-service.js";
import { createSecretsEncryptor } from "../config/secrets.js";
import { deriveSecretsKey } from "../config/secrets.js";
import { RoleId } from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("NoteTypeService (DB)", () => {
  let testDb: TestDb;
  let svc: NoteTypeService;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    const secretsKey = deriveSecretsKey(TEST_OPS_KEY);
    const encryptor = createSecretsEncryptor(secretsKey);
    svc = createNoteTypeService(testDb.db, encryptor);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("create sets default role gating to volunteer", async () => {
    const nt = await svc.create({
      encryptedName: Buffer.from("test-type"),
      encryptedIcon: Buffer.from("star"),
      escalationTargets: [],
    });

    expect(nt.minViewRole).toBe(RoleId.VOLUNTEER);
    expect(nt.minCreateRole).toBe(RoleId.VOLUNTEER);
  });

  it("create accepts explicit min role values", async () => {
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

  it("create allows create role below view role (escalation pattern)", async () => {
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

  it("listActive returns canCreate based on caller role", async () => {
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

  it("getMinCreateRole returns the stored value", async () => {
    const nt = await svc.create({
      encryptedName: Buffer.from("role-check"),
      encryptedIcon: Buffer.from("key"),
      escalationTargets: [],
      minCreateRole: RoleId.MANAGER,
    });

    const role = await svc.getMinCreateRole(nt.id);
    expect(role).toBe(RoleId.MANAGER);
  });
});
