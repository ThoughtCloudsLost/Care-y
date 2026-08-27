/**
 * node:buffer shim for the browser bundle.
 *
 * Server code overwhelmingly uses the Buffer global that globals-init
 * installs, so nothing should need this. It exists because the failure
 * when something does is out of proportion to the mistake: Vite
 * externalizes the module into a stub whose getter throws, and the first
 * symptom is the engine failing to boot.
 *
 * Re-exports the npm buffer polyfill rather than aliasing straight to it.
 * Vite resolves an alias replacement relative to the importing file, and
 * `buffer` is a dependency of packages/demo, not packages/server, so a
 * bare specifier fails to resolve for every server-side importer. Going
 * through a file inside this package resolves it here, where it exists.
 */

export * from "buffer";
