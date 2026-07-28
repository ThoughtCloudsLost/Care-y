/**
 * Shim for node:path
 *
 * Minimal surface used by the reachable graph. The schema-utils shim
 * replaces the FileMigrationProvider so path.join is no longer needed
 * there. This exists for any transitive imports that reference node:path.
 */

export function join(...parts: string[]): string {
  return parts.join("/").replace(/\/+/g, "/");
}

export function resolve(...parts: string[]): string {
  return join(...parts);
}

export function basename(p: string, ext?: string): string {
  const base = p.split("/").pop() ?? p;
  if (ext !== undefined && ext !== "" && base.endsWith(ext)) {
    return base.slice(0, -ext.length);
  }
  return base;
}

export function dirname(p: string): string {
  const parts = p.split("/");
  parts.pop();
  return parts.join("/") || ".";
}

export function extname(p: string): string {
  const base = basename(p);
  const idx = base.lastIndexOf(".");
  return idx > 0 ? base.slice(idx) : "";
}

export default { join, resolve, basename, dirname, extname };
