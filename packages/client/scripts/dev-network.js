import { execSync } from "child_process";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");

let ip;
try {
  const content = readFileSync(envPath, "utf8");
  const match = content.match(/^TAILSCALE_IP=(.+)$/m);
  ip = match?.[1]?.trim();
} catch {
  console.error(`Missing ${envPath}`);
  console.error("Create it with your Tailscale IP:");
  console.error("  TAILSCALE_IP=100.x.y.z");
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

console.log(`Starting SvelteKit dev on Tailscale: https://${ip}:5173`);
execSync(`npx vite dev --host ${ip}`, {
  stdio: "inherit",
  env: { ...process.env, VITE_MOBILE: "true" },
});
