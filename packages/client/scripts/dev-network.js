import { execSync } from "child_process";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");

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
  console.error(
    "  DEV_HOSTNAME=dev.care-y.local  # optional, enables WebAuthn",
  );
  process.exit(1);
}

if (!ip || ip === "100.x.y.z") {
  console.error("TAILSCALE_IP not set in .env.local");
  console.error(
    'Run "tailscale ip -4" to find your IP, then update .env.local:',
  );
  console.error("  TAILSCALE_IP=100.x.y.z");
  process.exit(1);
}

const displayHost = hostname || ip;
console.log(`Starting SvelteKit dev on Tailscale: https://${displayHost}:5173`);
if (hostname) {
  console.log(`  (binding to ${ip}, accessible via hostname)`);
}
execSync(`npx vite dev --host ${ip}`, {
  stdio: "inherit",
  env: { ...process.env, VITE_MOBILE: "true" },
});
