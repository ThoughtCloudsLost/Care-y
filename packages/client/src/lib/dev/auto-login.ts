/**
 * Dev-only auto-login. Logs in as the seed admin user and bypasses 2FA.
 * This file is dynamically imported only when import.meta.env.DEV is true,
 * so Vite's dead-code elimination strips it from production builds entirely.
 */
import { trpc } from "$lib/trpc/index.js";

function getBypass2fa(): { mutate: () => Promise<unknown> } {
  const route = trpc.auth.devBypass2fa;
  if (!route) throw new Error("devBypass2fa route missing (not in dev mode?)");
  return route;
}

export async function devAutoLogin(): Promise<void> {
  // Try calling devBypass2fa first. If the session already exists and is
  // authed but not 2FA-verified, this fixes it without a fresh login.
  // If there's no session at all, this will throw UNAUTHORIZED.
  try {
    await getBypass2fa().mutate();
    return;
  } catch {
    // No valid session, need full login.
  }

  await trpc.auth.login.mutate({
    identifier: "admin.dev",
    password: "dev-password-1234!",
  });
  await getBypass2fa().mutate();
}
