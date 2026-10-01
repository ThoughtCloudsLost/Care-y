import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from "vitest";
import { ConflictError, ValidationError } from "../errors.js";
import type * as EnvBootstrap from "../env-bootstrap.js";
import type * as DbModule from "../db/db.js";
import {
  withCli,
  singlePositional,
  buildSetupUrl,
  type CliRun,
} from "./cli-utils.js";

// vi.mock required: withCli ends the owner-role pool on every path, and
// these cases exercise exit codes, not the database. The loader is mocked
// out too so the harness imports without a secrets file. The real db.ts
// builds its pool without connecting, and building Kysely instances over
// the stub pool opens no connection either.
const mockDestroy = vi.fn(async () => undefined);
vi.mock("../env-bootstrap.js", () => ({}) satisfies typeof EnvBootstrap);
vi.mock("../db/db.js", async (importOriginal) => ({
  ...(await importOriginal<typeof DbModule>()),
  createAdminPool: () => ({ end: () => mockDestroy() }),
}));

describe("withCli", () => {
  let exitSpy: MockInstance<typeof process.exit>;
  let errorSpy: MockInstance<typeof console.error>;

  beforeEach(() => {
    mockDestroy.mockClear();
    exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes the positionals to run, closes the pool and exits 0", async () => {
    const run = vi.fn<CliRun>(async () => undefined);

    await withCli("org:test", run, ["acme"]);

    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0]?.[1]).toEqual({ positionals: ["acme"] });
    expect(mockDestroy).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("treats arguments after -- as positionals", async () => {
    const run = vi.fn<CliRun>(async () => undefined);

    await withCli("org:test", run, ["--", "acme"]);

    expect(run.mock.calls[0]?.[1]).toEqual({ positionals: ["acme"] });
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it("prints the message of an AppError and exits 1", async () => {
    await withCli(
      "org:test",
      async () => {
        throw new ConflictError("ORG_ALREADY_SETUP");
      },
      [],
    );

    expect(errorSpy).toHaveBeenCalledWith("org:test: ORG_ALREADY_SETUP");
    expect(mockDestroy).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("rethrows an error that is not an AppError without exiting", async () => {
    const bug = new TypeError("unexpected");

    await expect(
      withCli(
        "org:test",
        async () => {
          throw bug;
        },
        [],
      ),
    ).rejects.toBe(bug);

    expect(mockDestroy).toHaveBeenCalledTimes(1);
    expect(exitSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("refuses an option with exit 1 before running the command", async () => {
    const run = vi.fn<CliRun>(async () => undefined);

    await withCli("org:test", run, ["--force", "acme"]);

    expect(run).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(String(errorSpy.mock.calls[0]?.[0])).toContain("org:test: ");
    expect(String(errorSpy.mock.calls[0]?.[0])).toContain("--force");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});

describe("singlePositional", () => {
  it("returns the only positional", () => {
    expect(singlePositional({ positionals: ["acme"] }, "cmd <slug>")).toBe(
      "acme",
    );
  });

  it("throws a ValidationError with the usage line when none is given", () => {
    expect(() => singlePositional({ positionals: [] }, "cmd <slug>")).toThrow(
      new ValidationError("usage: cmd <slug>"),
    );
  });

  it("throws a ValidationError when more than one is given", () => {
    expect(() =>
      singlePositional({ positionals: ["a", "b"] }, "cmd <slug>"),
    ).toThrow(ValidationError);
  });
});

describe("buildSetupUrl", () => {
  it("puts the slug on the app domain and the token in the setup path", () => {
    expect(buildSetupUrl("example.org", "acme", "tok_en-123")).toBe(
      "https://acme.example.org/setup/tok_en-123",
    );
  });
});
