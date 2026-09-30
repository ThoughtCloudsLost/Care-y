import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
  type Mock,
} from "vitest";
import { getSodium, requireSodium, encode } from "@care-y/crypto";
import { RoleId } from "@care-y/shared";
import { SEED_HANDBOOK_TICKET } from "@care-y/shared/dev/seed-handbook-ticket.js";
import { SeedReplayError } from "$lib/errors.js";
import {
  DEV_SEED_STORY_COUNT,
  seedReplay,
  type SeedPhoneLookup,
  type SeedReplayBridge,
  type SeedReplayClient,
  type SeedReplayDeps,
} from "./seed-replay.js";

const ADMIN_ID = "admin-user";
const VOICEMAIL = new Uint8Array([0, 1, 2, 3, 4, 5]);

class FakeProcedureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FakeProcedureError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readField(input: unknown, key: string): unknown {
  if (!isRecord(input)) return undefined;
  return Object.entries(input).find(([k]) => k === key)?.[1];
}

function readString(input: unknown, key: string): string {
  const value = readField(input, key);
  if (typeof value !== "string") {
    throw new FakeProcedureError(`Input has no string ${key}`);
  }
  return value;
}

function readLength(input: unknown, key: string): number {
  const value = readField(input, key);
  if (!Array.isArray(value)) {
    throw new FakeProcedureError(`Input has no array ${key}`);
  }
  return value.length;
}

type Handler = (input: unknown) => unknown;

interface Call {
  readonly path: string;
  readonly input: unknown;
}

interface FakeServer {
  readonly client: SeedReplayClient;
  readonly calls: Call[];
  readonly handlers: Map<string, Handler>;
  /** Follow-ups written per ticket, as the timeline would list them. */
  readonly followUps: Map<string, number>;
}

/**
 * A stand-in for the app router: every procedure call is recorded, and the
 * ones whose results the replay reads answer from a small in-memory model.
 * Messages and ticket events each write one follow-up, as on the server.
 */
function createFakeServer(): FakeServer {
  const calls: Call[] = [];
  const followUps = new Map<string, number>();
  let seq = 0;
  const nextId = (prefix: string): string => {
    seq++;
    return `${prefix}-${String(seq)}`;
  };
  const writeOne = (input: unknown): void => {
    const ticketId = readString(input, "ticketId");
    followUps.set(ticketId, (followUps.get(ticketId) ?? 0) + 1);
  };

  const handlers = new Map<string, Handler>([
    ["auth.listUsers", () => []],
    ["auth.register", () => ({ user: { id: nextId("user") } })],
    ["auth.me", () => ({ user: { id: ADMIN_ID } })],
    [
      "tickets.listQueues",
      () => [{ id: "queue-1" }, { id: "queue-2" }, { id: "queue-3" }],
    ],
    [
      "kb.listCategories",
      () =>
        [1, 2, 3].map((sortOrder) => ({
          id: `category-${String(sortOrder)}`,
          sortOrder,
        })),
    ],
    ["tickets.noteTypes.create", () => ({ id: nextId("note-type") })],
    ["kb.createItem", () => ({ id: nextId("article") })],
    [
      "dev.seedQuarantine",
      (input) => {
        const routable = readField(input, "routable");
        const count = typeof routable === "number" ? routable : 0;
        return {
          count: count + 2,
          routableIds: Array.from({ length: count }, () =>
            nextId("quarantine"),
          ),
        };
      },
    ],
    ["tickets.listQueueMemberPublicKeys", () => []],
    [
      "tickets.create",
      (input) => {
        const ticketId = readString(input, "id");
        followUps.set(ticketId, 0);
        return { id: ticketId };
      },
    ],
    [
      "voicemailQuarantine.route",
      () => {
        // Routing opens the ticket and writes its voicemail follow-up.
        const ticketId = nextId("routed-ticket");
        followUps.set(ticketId, 1);
        return { ticketId };
      },
    ],
    [
      "tickets.get",
      () => ({
        keyGeneration: "key-generation",
        keyWrap: { ephemeralPoint: "e", nonce: "n", wrappedKey: "w" },
      }),
    ],
    [
      "tickets.listFollowUps",
      (input) => ({
        followUps: Array.from(
          { length: followUps.get(readString(input, "ticketId")) ?? 0 },
          (_, k) => ({ index: k }),
        ),
      }),
    ],
    [
      "tickets.uploadAttachment",
      (input) => ({ attachmentId: readString(input, "attachmentId") }),
    ],
    ["telephonyAdmin.devSeedTelephony", () => ({ skipped: false })],
  ]);
  for (const path of [
    "tickets.createFollowUp",
    "tickets.update",
    "tickets.take",
    "tickets.assignTo",
    "dev.seedVoicemail",
    "dev.reopenAsClient",
  ]) {
    handlers.set(path, (input) => {
      writeOne(input);
      return undefined;
    });
  }

  // Async, so a throwing handler surfaces as a rejection like a real call.
  const dispatch = async (path: string, input: unknown): Promise<unknown> => {
    calls.push({ path, input });
    const handler = handlers.get(path);
    return handler?.(input);
  };

  const proxyAt = (path: readonly string[]): unknown =>
    new Proxy(
      {},
      {
        get(_target, key): unknown {
          if (typeof key !== "string" || key === "then") return undefined;
          if (key === "mutate" || key === "query") {
            return (input?: unknown) => dispatch(path.join("."), input);
          }
          return proxyAt([...path, key]);
        },
      },
    );

  return {
    // The proxy answers every procedure path; only the ones in `handlers`
    // return data. Its shape is untyped, so it is asserted to the client.
    client: proxyAt([]) as SeedReplayClient,
    calls,
    handlers,
    followUps,
  };
}

interface FakeBridge {
  readonly bridge: SeedReplayBridge;
  /** Ticket id to the plaintext title it was created with. */
  readonly titles: Map<string, string>;
  readonly encrypted: { ticketId: string; plaintext: string }[];
}

function createFakeBridge(): FakeBridge {
  const titles = new Map<string, string>();
  const encrypted: { ticketId: string; plaintext: string }[] = [];
  const bridge: SeedReplayBridge = {
    orgDecryptBatch(items) {
      return Promise.resolve(
        items.map((item) => ({
          cacheKey: item.cacheKey,
          plaintext: null,
          generation: null,
        })),
      );
    },
    createTicketEncryption(ticketId, fields) {
      titles.set(
        ticketId,
        fields.find((f) => f.name === "title")?.plaintext ?? "",
      );
      return Promise.resolve({
        encryptedFields: fields.map((f) => ({
          name: f.name,
          ciphertext: "ciphertext",
        })),
        keyWraps: [],
        keyGeneration: "key-generation",
      });
    },
    unwrapTk() {
      return Promise.resolve();
    },
    encrypt(ticketId, _slot, plaintext) {
      encrypted.push({ ticketId, plaintext });
      return Promise.resolve("ciphertext");
    },
    encryptAttachment() {
      return Promise.resolve({
        blob: new ArrayBuffer(8),
        fileKeyWrap: "wrap",
        encryptedFilename: "filename",
      });
    },
  };
  return { bridge, titles, encrypted };
}

/** Numbers ending in an even digit already have a client. */
function fakeLookup(phone: string): Promise<SeedPhoneLookup> {
  const last = Number(phone.at(-1));
  return Promise.resolve(
    last % 2 === 0
      ? { found: true, clientId: `client-${phone}` }
      : { found: false, token: `token-${phone}` },
  );
}

function inputsOf(calls: readonly Call[], path: string): unknown[] {
  return calls.filter((c) => c.path === path).map((c) => c.input);
}

describe("seedReplay", () => {
  let server: FakeServer;
  let fake: FakeBridge;
  let phoneLookup: Mock<typeof fakeLookup>;
  let loadVoicemail: Mock<() => Promise<Uint8Array>>;
  let progress: string[];
  let deps: SeedReplayDeps;

  beforeAll(async () => {
    await getSodium();
  });

  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    server = createFakeServer();
    fake = createFakeBridge();
    phoneLookup = vi.fn(fakeLookup);
    loadVoicemail = vi.fn(() => Promise.resolve(VOICEMAIL));
    progress = [];
    const orgPublicKey = requireSodium().crypto_box_keypair().publicKey;
    deps = {
      client: server.client,
      bridge: fake.bridge,
      orgKeyManager: { getPublicKey: () => orgPublicKey },
      phoneLookup,
      loadVoicemail,
      storyCount: DEV_SEED_STORY_COUNT,
      onProgress: (message) => progress.push(message),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  /** Every ticket the replay opened, by create or by quarantine routing. */
  function createdTicketIds(): string[] {
    const routed = server.calls.filter(
      (c) => c.path === "voicemailQuarantine.route",
    ).length;
    const created = inputsOf(server.calls, "tickets.create").map((input) =>
      readString(input, "id"),
    );
    const routedIds = [...server.followUps.keys()].filter((id) =>
      id.startsWith("routed-ticket"),
    );
    expect(routedIds).toHaveLength(routed);
    return [...created, ...routedIds];
  }

  function handbookTicketId(): string {
    const entry = [...fake.titles].find(
      ([, title]) => title === SEED_HANDBOOK_TICKET.title,
    );
    if (entry === undefined) {
      throw new FakeProcedureError("Handbook ticket was not created");
    }
    return entry[0];
  }

  it("times every ticket once, with one point per follow-up it wrote", async () => {
    await seedReplay(deps);

    const tickets = createdTicketIds();
    const timelines = inputsOf(server.calls, "dev.applySeedTimeline");
    const timed = timelines.map((input) => readString(input, "ticketId"));
    expect(new Set(timed).size).toBe(timed.length);
    expect(new Set(timed)).toEqual(new Set(tickets));

    for (const input of timelines) {
      const ticketId = readString(input, "ticketId");
      expect(readLength(input, "points")).toBe(server.followUps.get(ticketId));
    }
    expect(progress.at(-1)).toBe("Done!");
  });

  it("returns the handbook ticket first, then every other ticket it opened", async () => {
    const result = await seedReplay(deps);

    expect(result.ticketIds[0]).toBe(handbookTicketId());
    expect(new Set(result.ticketIds).size).toBe(result.ticketIds.length);
    expect(new Set(result.ticketIds)).toEqual(new Set(createdTicketIds()));

    const articles = inputsOf(server.calls, "kb.createItem").length;
    expect(result.articleIds).toHaveLength(articles);
    expect(result.noteTypeIds).toHaveLength(
      inputsOf(server.calls, "tickets.noteTypes.create").length,
    );

    const cursorTickets = inputsOf(
      server.calls,
      "tickets.updateReadCursor",
    ).map((input) => readString(input, "ticketId"));
    expect(result.readCursorTicketIds).toEqual(cursorTickets);
    expect(result.readCursorTicketIds).toContain(handbookTicketId());
  });

  it("never replays the handbook ticket's merged-in rows", async () => {
    await seedReplay(deps);

    const ticketId = handbookTicketId();
    const mergedContent = SEED_HANDBOOK_TICKET.followUps
      .filter((fu) => fu.mergedIn === true && fu.content !== "")
      .map((fu) => fu.content);
    expect(mergedContent.length).toBeGreaterThan(0);
    const written = fake.encrypted
      .filter((e) => e.ticketId === ticketId)
      .map((e) => e.plaintext);
    for (const content of mergedContent) {
      expect(written).not.toContain(content);
    }

    const handbookTypes = inputsOf(server.calls, "tickets.createFollowUp")
      .filter((input) => readField(input, "ticketId") === ticketId)
      .map((input) => readField(input, "type"));
    expect(handbookTypes).not.toContain("merge_note");

    const timeline = inputsOf(server.calls, "dev.applySeedTimeline").find(
      (input) => readField(input, "ticketId") === ticketId,
    );
    const replayedRows = SEED_HANDBOOK_TICKET.followUps.filter(
      (fu) => fu.mergedIn !== true,
    ).length;
    expect(readLength(timeline, "points")).toBe(replayedRows);
  });

  it("rejects with SeedReplayError when a procedure fails, and never reports done", async () => {
    const failure = new FakeProcedureError("preset create refused");
    server.handlers.set("tickets.createPreset", () => {
      throw failure;
    });

    const result = seedReplay(deps);
    await expect(result).rejects.toBeInstanceOf(SeedReplayError);
    await expect(result).rejects.toHaveProperty("cause", failure);
    expect(progress).not.toContain("Done!");
    expect(
      server.calls.some((c) => c.path === "telephonyAdmin.devSeedTelephony"),
    ).toBe(false);
  });

  it("resolves clients through the phone lookup and audio through the voicemail loader, never fetch", async () => {
    const fetchSpy = vi.fn(() =>
      Promise.reject(new FakeProcedureError("fetch is not a replay dep")),
    );
    vi.stubGlobal("fetch", fetchSpy);

    await seedReplay(deps);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(loadVoicemail).toHaveBeenCalledTimes(1);
    expect(phoneLookup).toHaveBeenCalledTimes(createdTicketIds().length);

    const lookedUp = await Promise.all(
      phoneLookup.mock.calls.map(([phone]) => fakeLookup(phone)),
    );
    const expected = new Set(
      lookedUp.map((r) => (r.found ? r.clientId : r.token)),
    );
    const createTargets = inputsOf(server.calls, "tickets.create").map(
      (input) =>
        readField(input, "clientId") ?? readField(input, "clientToken"),
    );
    const routeTargets = inputsOf(
      server.calls,
      "voicemailQuarantine.route",
    ).map((input) => {
      const target = readField(input, "target");
      return readField(target, "clientId") ?? readField(target, "clientToken");
    });
    expect(new Set([...createTargets, ...routeTargets])).toEqual(expected);

    const audio = encode(VOICEMAIL);
    expect(
      readField(inputsOf(server.calls, "dev.seedQuarantine")[0], "audio"),
    ).toBe(audio);
    for (const input of inputsOf(server.calls, "dev.seedVoicemail")) {
      expect(readField(input, "audio")).toBe(audio);
    }
  });

  it("opens one ticket per generated story plus the handbook ticket", async () => {
    const result = await seedReplay({ ...deps, storyCount: 52 });

    expect(result.ticketIds).toHaveLength(53);
    expect(result.ticketIds[0]).toBe(handbookTicketId());
  });

  it("rejects a story count that is not a positive integer before calling anything", async () => {
    await expect(seedReplay({ ...deps, storyCount: 0 })).rejects.toBeInstanceOf(
      SeedReplayError,
    );
    await expect(
      seedReplay({ ...deps, storyCount: 2.5 }),
    ).rejects.toBeInstanceOf(SeedReplayError);
    expect(server.calls).toHaveLength(0);
  });

  it("assigns to the users it is given, finding existing accounts instead of registering them", async () => {
    // "tchen" already has an account; "newcomer" does not.
    server.handlers.set("auth.listUsers", () => [
      { id: "existing-user", encryptedIdentifier: "sealed:tchen" },
    ]);
    server.handlers.set("auth.register", () => ({
      user: { id: "registered-user" },
    }));
    const bridge: SeedReplayBridge = {
      ...fake.bridge,
      orgDecryptBatch(items) {
        return Promise.resolve(
          items.map((item) => ({
            cacheKey: item.cacheKey,
            plaintext: item.ciphertext.startsWith("sealed:")
              ? item.ciphertext.slice("sealed:".length)
              : null,
            generation: null,
          })),
        );
      },
    };

    await seedReplay({
      ...deps,
      bridge,
      storyCount: 52,
      users: [
        {
          identifier: "tchen",
          displayName: "Tao Chen",
          roleId: RoleId.VOLUNTEER,
          queueIndices: [0, 1],
        },
        {
          identifier: "newcomer",
          displayName: "New Comer",
          roleId: RoleId.VOLUNTEER,
          queueIndices: [2],
        },
      ],
    });

    const registered = inputsOf(server.calls, "auth.register").map((input) =>
      readString(input, "identifier"),
    );
    expect(registered).toEqual(["newcomer"]);

    const memberships = inputsOf(server.calls, "tickets.addQueueMember")
      .map((input) => ({
        queueId: readField(input, "queueId"),
        userId: readField(input, "userId"),
      }))
      .filter((m) => m.userId !== ADMIN_ID);
    expect(memberships).toEqual([
      { queueId: "queue-1", userId: "existing-user" },
      { queueId: "queue-2", userId: "existing-user" },
      { queueId: "queue-3", userId: "registered-user" },
    ]);

    const assignInputs = inputsOf(server.calls, "tickets.assignTo");
    const targets = assignInputs
      .map((input) => readField(input, "targetUserId"))
      .filter((target) => target !== null);
    for (const target of targets) {
      expect(["existing-user", "registered-user"]).toContain(target);
    }
    // The first user listed works the handbook ticket's first shift.
    const handbookTarget = assignInputs
      .filter((input) => readField(input, "ticketId") === handbookTicketId())
      .map((input) => readField(input, "targetUserId"))
      .find((target) => target !== null);
    expect(handbookTarget).toBe("existing-user");
  });
});
