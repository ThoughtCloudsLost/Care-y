/**
 * The permission for each channel that reaches a client.
 *
 * Reaching a client is split per channel, so an org can staff messaging
 * and calling separately. The server builds its relay gates and its
 * outbound follow-up gates from this map, which lets the browser hide a
 * channel the signed-in account cannot use instead of offering a control
 * the server will refuse.
 *
 * The server test (permission-coverage.test.ts) asserts that every value
 * here is a key the server enforces.
 */

import { Permission } from "./roles.js";

export const CLIENT_CHANNEL_PERMISSIONS = {
  portal: Permission.MESSAGE_CLIENTS_IN_PORTAL,
  sms: Permission.SEND_CLIENT_SMS,
  email: Permission.SEND_CLIENT_EMAIL,
  call: Permission.CALL_CLIENTS,
} as const satisfies Record<string, Permission>;

export type ClientChannel = keyof typeof CLIENT_CHANNEL_PERMISSIONS;
