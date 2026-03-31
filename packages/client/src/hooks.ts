import type { Reroute } from "@sveltejs/kit";
import { deLocalizeUrl } from "$lib/paraglide/runtime.js";

// With cookie-only strategy, deLocalizeUrl is a no-op (no locale prefix in URLs).
// This hook is scaffolding: if URL-based locales are added later, it prevents
// SvelteKit from 404ing on /en/tickets etc. Safe to include now at zero runtime cost.
export const reroute: Reroute = ({ url }) => deLocalizeUrl(url).pathname;
