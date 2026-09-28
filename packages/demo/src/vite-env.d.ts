/// <reference types="vite/client" />

/*
 * The demo compiles client sources that rely on ambient declarations the
 * client project carries in its own program. shared-worker-types.d.ts
 * (WorkerOptions extendedLifetime augmentation) is pulled in via the
 * tsconfig include list rather than a reference here, per lint rules.
 */

/**
 * Fetch URLs of the seed snapshot's three files, provided by
 * seedSnapshotPlugin() in vite.ts.
 */
declare module "virtual:care-y-seed-snapshot" {
  export const seedSnapshotUrls: {
    readonly rows: string;
    readonly blobs: string;
    readonly manifest: string;
  };
}
