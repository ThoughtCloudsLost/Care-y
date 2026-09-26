/**
 * Capabilities the server enforces inside resolvers rather than through
 * procedure middleware.
 *
 * The server checks these permissions inline because a single procedure
 * behaves differently depending on the caller's permissions (e.g.
 * contact details come back masked without VIEW_CLIENT_PII, deleting
 * someone else's note requires DELETE_OTHERS_NOTES while deleting your
 * own does not). The onboarding invite routes check MANAGE_USERS
 * inline because they run on authedProcedure for the 2FA exemption.
 * Writing a follow-up takes WRITE_CASE_NOTES for an internal entry and
 * the channel key for an outbound one, decided from the entry's type.
 *
 * The server test (permission-coverage.test.ts) pins the INLINE_CHECKED
 * list and asserts that every entry here appears in that list, so the
 * two cannot drift apart.
 */

import { Permission } from "./roles.js";

export const INLINE_CHECKED_CAPABILITIES = {
  deleteOthersNotes: Permission.DELETE_OTHERS_NOTES,
  generateInvite: Permission.MANAGE_USERS,
  viewClientPii: Permission.VIEW_CLIENT_PII,
  editClientContact: Permission.EDIT_CLIENT_CONTACT,
  writeCaseNotes: Permission.WRITE_CASE_NOTES,
} as const satisfies Record<string, Permission>;

export type InlineCheckedCapability = keyof typeof INLINE_CHECKED_CAPABILITIES;
