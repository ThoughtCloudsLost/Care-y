/**
 * Client permission gates agree with what the server enforces.
 *
 * A gate on a key the server ignores hides a control for no reason; a
 * key the server enforces but no screen can grant is an ability nobody
 * can hand out. Both were live failure modes during the permission
 * rewrite, and neither shows up as a type error, because both sides
 * spell the key through the same enum.
 *
 * Sources are read as text through Vite's raw glob rather than fs: the
 * paths resolve at transform time from a literal pattern, and `?raw`
 * never executes a module it loads, which is what makes reading the
 * server package from the client suite harmless. Importing the router
 * instead would pull pg and the tenant DB into a host-run suite.
 *
 * Limit worth stating: this compares sets, not call-site pairs. Linking
 * a component's gate to the procedure it guards would need either a
 * hand-maintained table or a refactor that names the key at the call
 * site. So a gate that checks the wrong key while the server checks
 * another passes here.
 */

import { describe, it, expect } from "vitest";
import { Permission } from "@care-y/shared";

// The glob options must be written inline at every call: Vite parses them
// statically and rejects an identifier.
function rawSources(
  modules: Record<string, unknown>,
  skip: (file: string) => boolean = () => false,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(modules)
      .filter(([file]) => !file.endsWith(".test.ts") && !skip(file))
      .map(([file, source]) => [file, source as string]),
  );
}

/** The admin screen that hands permissions out, role by role. */
const ROLE_MATRIX = "../components/admin/RolePermissionsSection.svelte";

const CLIENT_SOURCES = rawSources(
  {
    ...import.meta.glob("../../**/*.svelte", {
      query: "?raw",
      import: "default",
      eager: true,
    }),
    ...import.meta.glob("../../**/*.ts", {
      query: "?raw",
      import: "default",
      eager: true,
    }),
  },
  (file) => file.includes("/paraglide/") || file.includes("/test-mocks/"),
);

const SERVER_SOURCES = rawSources(
  import.meta.glob("../../../../server/src/**/*.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
);

function permissionsNamedIn(sources: Iterable<string>): Set<Permission> {
  const found = new Set<Permission>();
  for (const source of sources) {
    for (const match of source.matchAll(/Permission\.([A-Z_]+)/g)) {
      const name = match[1];
      if (name === undefined) continue;
      const value = (Permission as Record<string, string>)[name];
      if (value !== undefined) found.add(value as Permission);
    }
  }
  return found;
}

/** Keys the server names in a gate: a procedure, an inline check, or a relay route. */
function serverEnforcedPermissions(): Set<Permission> {
  const found = new Set<Permission>();
  const gatePattern =
    /(?:permissionProcedure|hasPermissionForOrg|requirePermissionForOrg)\s*\([^)]*?Permission\.([A-Z_]+)/gs;

  for (const [file, source] of Object.entries(SERVER_SOURCES)) {
    const matches = [...source.matchAll(gatePattern)];

    // The relay maps route to key rather than calling a gate helper.
    if (file.endsWith("/routes/relay.ts")) {
      for (const m of source.matchAll(/"\/relay\/[^"]+",\s*Permission\.(\w+)/g))
        matches.push(m);
    }
    // blob-download selects between two keys on blob category.
    if (file.endsWith("/routes/blob-download.ts")) {
      for (const m of source.matchAll(/Permission\.([A-Z_]+)/g))
        matches.push(m);
    }

    for (const match of matches) {
      const name = match[1];
      if (name === undefined) continue;
      const value = (Permission as Record<string, string>)[name];
      if (value !== undefined) found.add(value as Permission);
    }
  }
  return found;
}

describe("client permission gates", () => {
  const serverEnforced = serverEnforcedPermissions();
  const matrixSource = CLIENT_SOURCES[ROLE_MATRIX] ?? "";

  // Every client source except the role matrix, which names every key by
  // definition and would make the gate test vacuous.
  const gateSources = Object.entries(CLIENT_SOURCES)
    .filter(([file]) => file !== ROLE_MATRIX)
    .map(([, source]) => source);

  it("reads both packages", () => {
    // The globs cross a package boundary and resolve at transform time,
    // so an empty result would silently pass every test below.
    expect(gateSources.length).toBeGreaterThan(100);
    expect(matrixSource).toContain("Permission.");
    expect(serverEnforced.size).toBeGreaterThan(30);
  });

  it("gates only on keys the server enforces", () => {
    const ungoverned = [...permissionsNamedIn(gateSources)]
      .filter((p) => !serverEnforced.has(p))
      .sort();

    expect(ungoverned).toEqual([]);
  });

  it("offers every enforced key in the role matrix", () => {
    // No exclusions: the matrix lists the three locked keys too, shown
    // against Admin and not togglable, so an org can see what Admin holds
    // rather than finding an ability it was never told about.
    const inMatrix = permissionsNamedIn([matrixSource]);
    const missing = [...serverEnforced].filter((p) => !inMatrix.has(p)).sort();

    expect(missing).toEqual([]);
  });

  it("gates every permission through permissionProcedure", () => {
    // A procedure chaining requireRole itself would enforce a key while
    // declaring nothing in meta, which is the state the meta exists to
    // rule out and what the server's router walk depends on. The helper
    // is the only sanctioned construction, so no route file names
    // requireRole at all.
    const offenders = Object.entries(SERVER_SOURCES)
      .filter(([file]) => file.includes("/routes/"))
      .filter(([, source]) => /requireRole\s*\(/.test(source))
      .map(([file]) => file)
      .sort();

    expect(offenders).toEqual([]);
  });

  it("writes the permission meta in one place", () => {
    // permissionProcedure sets meta and middleware from one argument, so
    // the two cannot disagree. A hand-written .meta({permission})
    // elsewhere would break that quietly.
    const helper = Object.entries(SERVER_SOURCES).find(([file]) =>
      file.endsWith("/trpc/trpc.ts"),
    );

    expect(helper?.[1]).toContain(
      "authed2faProcedure.meta({ permission }).use(requireRole(permission))",
    );

    const handWritten = Object.entries(SERVER_SOURCES)
      .filter(([file]) => !file.endsWith("/trpc/trpc.ts"))
      .filter(([, source]) => /\.meta\(\s*\{\s*permission/.test(source))
      .map(([file]) => file)
      .sort();

    expect(handWritten).toEqual([]);
  });

  it("checks each inline-pinned key inside a resolver", () => {
    // The server's coverage test pins these by name because it cannot
    // read source. This is the other half: each one has the check it
    // claims, so a key cannot sit on that list after its check is gone.
    const inlineChecked = [
      Permission.VIEW_CLIENT_PII,
      Permission.EDIT_CLIENT_CONTACT,
      Permission.DELETE_OTHERS_NOTES,
    ];

    const checkedInResolvers = new Set<Permission>();
    for (const source of Object.values(SERVER_SOURCES)) {
      const calls = source.matchAll(
        /(?:hasPermissionForOrg|requirePermissionForOrg)\s*\([^)]*?Permission\.([A-Z_]+)/gs,
      );
      for (const match of calls) {
        const name = match[1];
        if (name === undefined) continue;
        const value = (Permission as Record<string, string>)[name];
        if (value !== undefined) checkedInResolvers.add(value as Permission);
      }
    }

    const unchecked = inlineChecked
      .filter((p) => !checkedInResolvers.has(p))
      .sort();

    expect(unchecked).toEqual([]);
  });

  it("picks blob download keys from blob category alone", () => {
    // The server test pins these two keys as raw-HTTP enforcement. A
    // third category taking a third key would leave that list short.
    const blob = Object.entries(SERVER_SOURCES).find(([file]) =>
      file.endsWith("/routes/blob-download.ts"),
    );
    const named = permissionsNamedIn([blob?.[1] ?? ""]);

    expect([...named].sort()).toEqual(
      [Permission.VIEW_KNOWLEDGE_BASE, Permission.DOWNLOAD_CASE_MEDIA].sort(),
    );
  });

  it("names no permission the enum does not define", () => {
    // Catches a rename that left a gate behind: the regex matches the
    // spelling, the enum lookup is what decides it is real.
    const spellings = new Set<string>();
    for (const source of [...gateSources, matrixSource]) {
      for (const match of source.matchAll(/Permission\.([A-Z_]+)/g)) {
        const name = match[1];
        if (name !== undefined) spellings.add(name);
      }
    }

    const unknown = [...spellings]
      .filter((name) => !(name in Permission))
      .sort();

    expect(unknown).toEqual([]);
  });
});
