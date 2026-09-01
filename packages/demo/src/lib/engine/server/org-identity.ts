/**
 * The demo org's display name, shared between the structural seed
 * (org_config.name) and the splash injection in vite.ts. It lives in its
 * own module because vite.ts is bundled into the Vite config at load
 * time, where seed-structure.ts's libsodium import cannot go.
 */
export const DEMO_ORG_NAME = "Handbook Example Org";
