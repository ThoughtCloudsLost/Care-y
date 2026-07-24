import { createHmac } from "node:crypto";

const secret = process.env.TOTP_SECRET;
if (!secret) {
  console.error("set TOTP_SECRET in .env");
  process.exit(1);
}
const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

let bits = "";
for (const c of secret) {
  const val = BASE32.indexOf(c.toUpperCase());
  if (val === -1) continue;
  bits += val.toString(2).padStart(5, "0");
}
const bytes = [];
for (let i = 0; i + 8 <= bits.length; i += 8)
  bytes.push(parseInt(bits.substring(i, i + 8), 2));

const key = Buffer.from(bytes);
const counter = Math.floor(Date.now() / 1000 / 30);
const counterBuf = Buffer.alloc(8);
counterBuf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
counterBuf.writeUInt32BE(counter & 0xffffffff, 4);

const hmac = createHmac("sha1", key).update(counterBuf).digest();
const offset = hmac[hmac.length - 1] & 0xf;
const code =
  (((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3]) %
  1000000;

const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
console.log(`${code.toString().padStart(6, "0")} (${remaining}s remaining)`);
