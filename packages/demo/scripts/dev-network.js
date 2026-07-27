import { execSync } from "child_process";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Reuses the client package's network config (.env.local) and mkcert
// certs so the demo serves over the same Tailscale hostname setup.
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", "..", "client", ".env.local");

let ip;
let hostname;
try {
  const content = readFileSync(envPath, "utf8");
  const ipMatch = content.match(/^TAILSCALE_IP=(.+)$/m);
  ip = ipMatch?.[1]?.trim();
  const hostMatch = content.match(/^DEV_HOSTNAME=(.+)$/m);
  hostname = hostMatch?.[1]?.trim();
} catch {
  console.error(`Missing ${envPath}`);
  console.error("Create it with your Tailscale IP:");
  console.error("  TAILSCALE_IP=100.x.y.z");
  console.error("  DEV_HOSTNAME=dev.care-y.local  # optional");
  process.exit(1);
}

if (!ip || ip === "100.x.y.z") {
  console.error("TAILSCALE_IP not set in packages/client/.env.local");
  console.error(
    'Run "tailscale ip -4" to find your IP, then update .env.local:',
  );
  console.error("  TAILSCALE_IP=100.x.y.z");
  process.exit(1);
}

// Fixed port so the demo URL stays stable and the client's dev:mobile
// (which owns 5173) can run alongside. strictPort fails loud instead
// of sliding to a port the printed URL would no longer match.
const port = 5174;
const displayHost = hostname || ip;
console.log(`Starting demo dev on Tailscale: https://${displayHost}:${port}`);
if (hostname) {
  console.log(`  (binding to ${ip}, accessible via hostname)`);
}
execSync(`npx vite --port ${port} --strictPort --host ${ip}`, {
  stdio: "inherit",
  env: { ...process.env, VITE_MOBILE: "true" },
});
