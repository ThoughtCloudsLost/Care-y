/**
 * Every procedure in the built router is either permission-gated or
 * explicitly allowlisted here with a reason.
 *
 * The manifest (PROCEDURE_PERMISSIONS in @care-y/shared) covers the gated
 * side. This file covers the ungated side: procedures that are
 * deliberately reachable without a permission key, either because they
 * serve unauthenticated callers (login, intake, portal) or because
 * they are self-service operations on the caller's own session.
 *
 * Adding an entry to UNGATED_PROCEDURES requires explicit user approval.
 * Each entry is a declaration that an endpoint is deliberately reachable
 * without a permission key. The failure this list exists to prevent:
 * auth.register was once reachable by any authenticated session, so any
 * logged-in volunteer could create new users. A procedure that mutates
 * org state or exposes other users' data must never appear here.
 */

import { describe, it, expect } from "vitest";
import { PROCEDURE_PERMISSIONS } from "@care-y/shared";
import { createAppRouter } from "../routes/router.js";
import { createTestRouterDeps, ALL_OPTIONAL_ROUTERS } from "../test-utils.js";

/**
 * Procedures that carry no permission metadata and are deliberately
 * ungated. The value is a one-line reason explaining why no permission
 * key is needed.
 */
const UNGATED_PROCEDURES: Record<string, string> = {
  // --- top-level ---
  health: "liveness probe, no org or auth context",

  // --- auth: pre-session ---
  "auth.getSalt": "pre-login salt lookup, no session exists yet",
  "auth.login": "entry point, no session exists yet",
  "auth.logout": "session teardown, authedProcedure only (self-service)",
  "auth.me": "returns the caller's own profile, authedProcedure only",

  // --- org ---
  "org.create":
    "first org creation, no org context exists yet (publicProcedure)",
  "org.getChannelPolicy":
    "channel policy read for any authenticated member (authed2faProcedure)",

  // --- oprf ---
  "oprf.evaluate":
    "OPRF evaluation, pre-login or pre-enrollment (publicProcedure with inline 2FA gate)",

  // --- keys: self-service crypto ---
  "keys.initCryptoKeys":
    "first-time key setup for the caller's own account (authedProcedure)",
  "keys.uploadVolPublic":
    "update caller's own volPublic after password change (authedProcedure)",
  "keys.rotateKeys":
    "password-change key rotation for the caller's own keys (authedProcedure)",
  "keys.rotationStatus":
    "check rotation lock status for the caller's own keys (authedProcedure)",
  "keys.getWrappedOrgKey":
    "retrieve caller's own wrapped org key copy (authedProcedure)",

  // --- profile: self-service ---
  "profile.updateDisplayName":
    "caller updates their own display name (authedProcedure)",
  "profile.updatePreferredLocale":
    "caller updates their own locale preference (authedProcedure)",
  "profile.updateUsername":
    "caller changes their own username (authedProcedure, password-verified)",
  "profile.changePassword":
    "caller changes their own password (authedProcedure, rate-limited)",
  "profile.myTicketKeyWraps":
    "caller reads their own ticket key wraps (authedProcedure)",
  "profile.markBriefingSeen":
    "caller marks their own briefing as seen (authedProcedure)",

  // --- recentViews: self-service ---
  "recentViews.get":
    "caller reads their own recently-viewed history (authedProcedure)",
  "recentViews.put":
    "caller writes their own recently-viewed history (authedProcedure)",

  // --- twoFactor: enrollment and verification ---
  "twoFactor.status":
    "2FA enrollment status for the caller's own session (authedProcedure)",
  "twoFactor.enroll.totpSetup":
    "TOTP enrollment for the caller (authedProcedure, pre-2FA)",
  "twoFactor.enroll.totpVerify":
    "TOTP enrollment verification for the caller (authedProcedure, pre-2FA)",
  "twoFactor.enroll.webauthnOptions":
    "WebAuthn registration options for the caller (authedProcedure, pre-2FA)",
  "twoFactor.enroll.webauthnVerify":
    "WebAuthn registration for the caller (authedProcedure, pre-2FA)",
  "twoFactor.enroll.emailSend":
    "email 2FA enrollment for the caller (authedProcedure, pre-2FA)",
  "twoFactor.enroll.emailVerify":
    "email 2FA enrollment verification (authedProcedure, pre-2FA)",
  "twoFactor.enroll.smsSend":
    "SMS 2FA enrollment for the caller (authedProcedure, pre-2FA)",
  "twoFactor.enroll.smsVerify":
    "SMS 2FA enrollment verification (authedProcedure, pre-2FA)",
  "twoFactor.enroll.pushVerify":
    "push 2FA enrollment for the caller (authedProcedure, pre-2FA)",
  "twoFactor.enroll.backupCodes":
    "backup code generation for the caller (authedProcedure, pre-2FA)",
  "twoFactor.enroll.markVerifiedOnFirstEnrollment":
    "mark session verified after first enrollment (authedProcedure, pre-2FA)",
  "twoFactor.verify.totp":
    "post-login TOTP challenge (authedProcedure, pre-2FA)",
  "twoFactor.verify.webauthnOptions":
    "post-login WebAuthn options (authedProcedure, pre-2FA)",
  "twoFactor.verify.webauthnComplete":
    "post-login WebAuthn assertion (authedProcedure, pre-2FA)",
  "twoFactor.verify.emailSend":
    "post-login email code send (authedProcedure, pre-2FA)",
  "twoFactor.verify.emailComplete":
    "post-login email code verification (authedProcedure, pre-2FA)",
  "twoFactor.verify.smsSend":
    "post-login SMS code send (authedProcedure, pre-2FA)",
  "twoFactor.verify.smsComplete":
    "post-login SMS code verification (authedProcedure, pre-2FA)",
  "twoFactor.verify.backupCode":
    "post-login backup code verification (authedProcedure, pre-2FA)",
  "twoFactor.verify.pushSend":
    "post-login push challenge send (authedProcedure, pre-2FA)",
  "twoFactor.verify.pushPoll":
    "post-login push challenge poll (authedProcedure, pre-2FA)",
  "twoFactor.verify.pushApprove":
    "approve push challenge from a verified device (authed2faProcedure)",
  "twoFactor.verify.pushDeny":
    "deny push challenge from a verified device (authed2faProcedure)",
  "twoFactor.methods.list":
    "list own enrolled methods (authed2faProcedure, self-service)",
  "twoFactor.methods.remove":
    "remove own enrolled method (authed2faProcedure, self-service)",

  // --- consultant: self-service phone registration ---
  "consultant.get": "read caller's own consultant record (authed2faProcedure)",
  "consultant.register":
    "register caller's own phone preference (authed2faProcedure)",
  "consultant.verify":
    "verify caller's own phone registration code (authed2faProcedure)",
  "consultant.updatePreference":
    "update caller's own call preference (authed2faProcedure)",
  "consultant.setSmsPings":
    "toggle caller's own SMS ping preference (authed2faProcedure)",
  "consultant.delete":
    "delete caller's own consultant record (authed2faProcedure)",

  // --- notifications: self-service ---
  "notifications.vapidPublicKey":
    "VAPID public key, needed for push subscription (authed2faProcedure)",
  "notifications.subscribePush":
    "subscribe caller's own device for push (authed2faProcedure)",
  "notifications.unsubscribePush":
    "unsubscribe caller's own push endpoint (authed2faProcedure)",
  "notifications.listPushSubscriptions":
    "list caller's own push subscriptions (authed2faProcedure)",
  "notifications.getPreferences":
    "read caller's own notification preferences (authed2faProcedure)",
  "notifications.setPreference":
    "set caller's own notification preference (authed2faProcedure)",
  "notifications.resetPreferences":
    "reset caller's own notification preferences (authed2faProcedure)",

  // --- branding: public + authed reads ---
  "branding.getPublicBranding":
    "public branding for login/intake pages (orgProcedure, no auth)",
  "branding.getBranding":
    "branding for any authenticated member (authed2faProcedure)",

  // --- onboarding ---
  "onboarding.getStatus": "setup status check, pre-bootstrap (publicProcedure)",
  "onboarding.bootstrapAdmin":
    "first admin creation, no users exist yet (publicProcedure)",
  "onboarding.validateInvite":
    "invite token validation, pre-registration (publicProcedure)",
  "onboarding.registerFromInvite":
    "invite-based registration, no session exists yet (publicProcedure)",
  "onboarding.generateInvite":
    "invite generation, inline MANAGE_USERS check (authedProcedure for 2FA exemption)",
  "onboarding.listPendingInvites":
    "invite listing, inline MANAGE_USERS check (authedProcedure for 2FA exemption)",
  "onboarding.revokeInvite":
    "invite revocation, inline MANAGE_USERS check (authedProcedure for 2FA exemption)",
  "onboarding.updateOrgGeneral":
    "org setup, inline MANAGE_ORG_IDENTITY check (authedProcedure for 2FA exemption)",
  "onboarding.reauthenticate":
    "re-login during onboarding flow (publicProcedure)",
  "onboarding.markBriefingSeen":
    "caller marks their own briefing as seen (authedProcedure)",
  "onboarding.completeSetup":
    "finalize org setup, inline MANAGE_ROLES check (authedProcedure for 2FA exemption)",

  // --- clients: self-service backfill ---
  "clients.backfillAliasHash":
    "lazy alias hash backfill for webhook-created rows (authed2faProcedure, idempotent write-if-null)",

  // --- clientPortal: public-facing intake and portal ---
  "clientPortal.getIntakeConfig":
    "intake configuration (PoW flag), public-facing (orgProcedure)",
  "clientPortal.getIntakeForm":
    "intake form definition, public-facing (orgProcedure)",
  "clientPortal.getIntakeChallenge":
    "PoW challenge for intake, public-facing (orgProcedure)",
  "clientPortal.submitIntake":
    "intake form submission, public-facing (orgProcedure)",
  "clientPortal.portalBootstrap":
    "secure link portal bootstrap, channel-authed (orgProcedure)",
  "clientPortal.portalMessages":
    "secure link message list, channel-authed (orgProcedure)",
  "clientPortal.portalMessagePage":
    "secure link message pagination, channel-authed (orgProcedure)",
  "clientPortal.portalReply":
    "secure link client reply, channel-authed (orgProcedure)",
  "clientPortal.openShare": "read a share link, public-facing (orgProcedure)",
  "clientPortal.getAccountSalt":
    "encrypted account salt lookup, public-facing (orgProcedure)",
  "clientPortal.accountLogin":
    "encrypted account login, public-facing (orgProcedure)",
  "clientPortal.accountBootstrap":
    "encrypted account portal bootstrap, session-authed (orgProcedure)",
  "clientPortal.accountMessages":
    "encrypted account message list, session-authed (orgProcedure)",
  "clientPortal.accountReply":
    "encrypted account client reply, session-authed (orgProcedure)",
  "clientPortal.accountUpgrade":
    "upgrade secure link to encrypted account (orgProcedure)",
  "clientPortal.accountChangePassword":
    "encrypted account password change, session-authed (orgProcedure)",
  "clientPortal.accountLogout":
    "encrypted account logout, session-authed (orgProcedure)",
  "clientPortal.evaluateChannelOprf":
    "channel-scoped OPRF evaluation, public-facing (orgProcedure)",
  "clientPortal.contactInfo":
    "sealed contact info for channel-authed portal (orgProcedure)",
  "clientPortal.accountContactInfo":
    "sealed contact info for account-authed portal (orgProcedure)",
  "clientPortal.addPassphrase":
    "add passphrase to bare-link channel, channel-authed (orgProcedure)",
};

describe("procedure gate coverage", () => {
  const router = createAppRouter({
    ...createTestRouterDeps(),
    ...ALL_OPTIONAL_ROUTERS,
  });
  const allPaths = Object.keys(router._def.procedures);

  it("mounts enough procedures to be a meaningful check", () => {
    // Guard against an under-stubbed dep set that yields a tiny router.
    expect(allPaths.length).toBeGreaterThan(100);
  });

  it("gates every procedure with a permission or lists it as ungated", () => {
    const uncovered: string[] = [];
    for (const path of allPaths) {
      const hasPermissionMeta = path in PROCEDURE_PERMISSIONS;
      const hasAllowlistEntry = path in UNGATED_PROCEDURES;
      if (!hasPermissionMeta && !hasAllowlistEntry) {
        uncovered.push(path);
      }
    }

    expect(
      uncovered,
      `Procedures with no permission gate and no allowlist entry:\n  ${uncovered.join("\n  ")}\n\nEither add a permission via permissionProcedure or add an UNGATED_PROCEDURES entry with a reason.`,
    ).toEqual([]);
  });

  it("keeps no stale entry in the ungated allowlist", () => {
    const stale: string[] = [];
    for (const path of Object.keys(UNGATED_PROCEDURES)) {
      const existsInRouter = allPaths.includes(path);
      const nowGated = path in PROCEDURE_PERMISSIONS;
      if (!existsInRouter) {
        stale.push(`${path} (no longer exists in router)`);
      } else if (nowGated) {
        stale.push(
          `${path} (now carries permission meta, remove from allowlist)`,
        );
      }
    }

    expect(
      stale,
      `Stale entries in UNGATED_PROCEDURES:\n  ${stale.join("\n  ")}\n\nRemove them: the procedure either no longer exists or now has a permission gate.`,
    ).toEqual([]);
  });

  it("does not double-list a procedure in both manifests", () => {
    const doubled: string[] = [];
    for (const path of Object.keys(UNGATED_PROCEDURES)) {
      if (path in PROCEDURE_PERMISSIONS) {
        doubled.push(path);
      }
    }

    expect(
      doubled,
      `Procedures in both PROCEDURE_PERMISSIONS and UNGATED_PROCEDURES:\n  ${doubled.join("\n  ")}`,
    ).toEqual([]);
  });
});
