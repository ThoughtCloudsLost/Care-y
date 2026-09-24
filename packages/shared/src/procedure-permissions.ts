/**
 * Single client-visible statement of which permission gates which tRPC
 * procedure.
 *
 * Every permission-gated procedure in the built router has an entry here,
 * keyed by its mounted path (e.g. "tickets.create"). The server test
 * (packages/server/src/trpc/permission-coverage.test.ts) asserts exact
 * two-way equality between this manifest and the built router's
 * meta.permission values. A wrong, missing, or stale entry fails CI.
 *
 * The client imports this to know, without hitting the server, which
 * procedures need which permission. The type carries the key set so
 * call sites that index into it get a compile error when a procedure
 * is removed.
 */

import { Permission } from "./roles.js";

export const PROCEDURE_PERMISSIONS = {
  // --- auth ---
  "auth.register": Permission.MANAGE_USERS,
  "auth.assignRole": Permission.MANAGE_ROLES,
  "auth.setPiiRetention": Permission.MANAGE_RETENTION,
  "auth.listUsers": Permission.MANAGE_USERS,
  "auth.setUserActive": Permission.MANAGE_USERS,
  "auth.getSoleHeldTicketCount": Permission.MANAGE_USERS,
  "auth.hubStatus": Permission.MANAGE_ROLES,
  "auth.getRolePermissions": Permission.MANAGE_ROLES,
  "auth.setRolePermission": Permission.MANAGE_ROLES,
  "auth.resetRolePermissions": Permission.MANAGE_ROLES,

  // --- org ---
  "org.getOrgGeneral": Permission.MANAGE_ORG_IDENTITY,
  "org.updateOrgGeneral": Permission.MANAGE_ORG_IDENTITY,
  "org.getIntakeQueue": Permission.MANAGE_CHANNEL_ROUTING,
  "org.setIntakeQueue": Permission.MANAGE_CHANNEL_ROUTING,
  "org.updateChannelPolicy": Permission.MANAGE_CHANNEL_ROUTING,

  // --- oprf ---
  "oprf.adminEvaluate": Permission.MANAGE_KEYS,

  // --- keys ---
  "keys.uploadOrgPublicKey": Permission.MANAGE_KEYS,
  "keys.rotateOrgKey": Permission.MANAGE_KEYS,
  "keys.wrapOrgKeyForUser": Permission.MANAGE_KEYS,
  "keys.listUnwrappedUsers": Permission.MANAGE_KEYS,
  "keys.adminBootstrapUserKeys": Permission.MANAGE_KEYS,
  "keys.resealStatus": Permission.MANAGE_KEYS,
  "keys.resealRows": Permission.MANAGE_KEYS,
  "keys.reindexRows": Permission.MANAGE_KEYS,
  "keys.resealPending": Permission.MANAGE_KEYS,
  "keys.reindexPending": Permission.MANAGE_KEYS,
  "keys.resealBlobPending": Permission.MANAGE_KEYS,
  "keys.resealBlobRow": Permission.MANAGE_KEYS,
  "keys.listFormAssetsForReseal": Permission.MANAGE_KEYS,
  "keys.getFormAssetBlob": Permission.MANAGE_KEYS,
  "keys.replaceFormAssetBlob": Permission.MANAGE_KEYS,

  // --- profile ---
  "profile.adminUpdateDisplayName": Permission.MANAGE_USERS,
  "profile.adminUpdateUsername": Permission.MANAGE_USERS,

  // --- dashboard ---
  "dashboard.getSetupChecklist": Permission.MANAGE_ORG_IDENTITY,
  "dashboard.dismissSetupChecklist": Permission.MANAGE_ORG_IDENTITY,

  // --- telephonyAdmin ---
  "telephonyAdmin.saveConfig": Permission.MANAGE_INFRASTRUCTURE,
  "telephonyAdmin.getConfig": Permission.MANAGE_INFRASTRUCTURE,
  "telephonyAdmin.provisionWebhooks": Permission.MANAGE_INFRASTRUCTURE,
  "telephonyAdmin.changeMode": Permission.MANAGE_INFRASTRUCTURE,
  "telephonyAdmin.addToBlocklist": Permission.MANAGE_INFRASTRUCTURE,
  "telephonyAdmin.removeFromBlocklist": Permission.MANAGE_INFRASTRUCTURE,
  "telephonyAdmin.listBlocklist": Permission.MANAGE_INFRASTRUCTURE,
  "telephonyAdmin.getProvisionedPhones": Permission.MANAGE_INFRASTRUCTURE,
  "telephonyAdmin.getPhonePurpose": Permission.MANAGE_INFRASTRUCTURE,
  "telephonyAdmin.setPhonePurpose": Permission.MANAGE_INFRASTRUCTURE,

  // --- telephonyContent ---
  "telephonyContent.listGreetings": Permission.WRITE_CALL_GREETINGS,
  "telephonyContent.getGreetingAudio": Permission.WRITE_CALL_GREETINGS,
  "telephonyContent.createGreeting": Permission.WRITE_CALL_GREETINGS,
  "telephonyContent.updateGreeting": Permission.WRITE_CALL_GREETINGS,
  "telephonyContent.deleteGreeting": Permission.WRITE_CALL_GREETINGS,
  "telephonyContent.uploadGreetingAudio": Permission.WRITE_CALL_GREETINGS,
  "telephonyContent.createAudioGreeting": Permission.WRITE_CALL_GREETINGS,
  "telephonyContent.listSmsResponses": Permission.WRITE_AUTOMATIC_REPLIES,
  "telephonyContent.createSmsResponse": Permission.WRITE_AUTOMATIC_REPLIES,
  "telephonyContent.updateSmsResponse": Permission.WRITE_AUTOMATIC_REPLIES,
  "telephonyContent.deleteSmsResponse": Permission.WRITE_AUTOMATIC_REPLIES,

  // --- tickets ---
  "tickets.create": Permission.OPEN_CASES,
  "tickets.resolveCreateTarget": Permission.VIEW_CASES,
  "tickets.get": Permission.VIEW_CASES,
  "tickets.list": Permission.VIEW_CASES,
  "tickets.recentFollowUps": Permission.VIEW_CASES,
  "tickets.listReadState": Permission.VIEW_CASES,
  "tickets.readStateSweep": Permission.VIEW_CASES,
  "tickets.counts": Permission.VIEW_CASES,
  "tickets.searchClients": Permission.VIEW_CASES,
  "tickets.update": Permission.CHANGE_CASE_STATUS,
  "tickets.close": Permission.CHANGE_CASE_STATUS,
  "tickets.reopen": Permission.CHANGE_CASE_STATUS,
  "tickets.createFollowUp": Permission.VIEW_CASES,
  "tickets.listFollowUps": Permission.VIEW_CASES,
  "tickets.listFollowUpSummary": Permission.VIEW_CASES,
  "tickets.listFollowUpsByIds": Permission.VIEW_CASES,
  "tickets.getReadCursor": Permission.VIEW_CASES,
  "tickets.updateReadCursor": Permission.VIEW_CASES,
  "tickets.updateInternalNote": Permission.WRITE_CASE_NOTES,
  "tickets.deleteInternalNote": Permission.VIEW_CASES,
  "tickets.toggleReaction": Permission.VIEW_CASES,
  "tickets.getReactions": Permission.VIEW_CASES,
  "tickets.createPreset": Permission.MANAGE_PRESETS,
  "tickets.listPresets": Permission.VIEW_CASES,
  "tickets.updatePreset": Permission.MANAGE_PRESETS,
  "tickets.deletePreset": Permission.MANAGE_PRESETS,
  "tickets.addDependency": Permission.LINK_CASES,
  "tickets.removeDependency": Permission.LINK_CASES,
  "tickets.listDependencies": Permission.VIEW_CASES,
  "tickets.mergeClients": Permission.MERGE_CLIENTS,
  "tickets.undoMerge": Permission.MERGE_CLIENTS,
  "tickets.lockMerge": Permission.MERGE_CLIENTS,
  "tickets.getMergeChannelInfo": Permission.MERGE_CLIENTS,
  "tickets.getRecording": Permission.DOWNLOAD_CASE_MEDIA,
  "tickets.getAttachment": Permission.DOWNLOAD_CASE_MEDIA,
  "tickets.listRecordings": Permission.DOWNLOAD_CASE_MEDIA,
  "tickets.uploadAttachment": Permission.SEND_CLIENT_MEDIA,
  "tickets.listAttachments": Permission.DOWNLOAD_CASE_MEDIA,
  "tickets.createQueue": Permission.MANAGE_QUEUES,
  "tickets.listQueues": Permission.VIEW_CASES,
  "tickets.updateQueue": Permission.MANAGE_QUEUES,
  "tickets.reorderQueues": Permission.MANAGE_QUEUES,
  "tickets.deleteQueue": Permission.MANAGE_QUEUES,
  "tickets.assign": Permission.ASSIGN_CASES,
  "tickets.take": Permission.CLAIM_CASES,
  "tickets.release": Permission.CLAIM_CASES,
  "tickets.assignTo": Permission.ASSIGN_CASES,
  "tickets.watchTicket": Permission.VIEW_CASES,
  "tickets.unwatchTicket": Permission.VIEW_CASES,
  "tickets.isWatching": Permission.VIEW_CASES,
  "tickets.addQueueWatcher": Permission.MANAGE_QUEUE_NOTIFICATIONS,
  "tickets.removeQueueWatcher": Permission.MANAGE_QUEUE_NOTIFICATIONS,
  "tickets.listQueueWatchers": Permission.MANAGE_QUEUE_NOTIFICATIONS,
  "tickets.addQueueMember": Permission.MANAGE_QUEUE_MEMBERSHIP,
  "tickets.removeQueueMember": Permission.MANAGE_QUEUE_MEMBERSHIP,
  "tickets.listQueueMembers": Permission.VIEW_CASES,
  "tickets.listQueueMemberPublicKeys": Permission.OPEN_CASES,
  "tickets.getUserQueues": Permission.MANAGE_QUEUE_MEMBERSHIP,
  "tickets.listAllQueueAssignments": Permission.MANAGE_QUEUE_MEMBERSHIP,
  "tickets.listPendingWrapBackfills": Permission.VIEW_CASES,
  "tickets.submitWrapBackfills": Permission.VIEW_CASES,
  "tickets.listVolunteers": Permission.VIEW_CASES,
  "tickets.listParticipants": Permission.VIEW_CASES,
  "tickets.recentActivity": Permission.VIEW_CASES,
  "tickets.myQueues": Permission.VIEW_CASES,
  "tickets.dashboardInfo": Permission.VIEW_CASES,
  "tickets.noteTypes.list": Permission.MANAGE_NOTE_TYPES,
  "tickets.noteTypes.listActive": Permission.VIEW_CASES,
  "tickets.noteTypes.create": Permission.MANAGE_NOTE_TYPES,
  "tickets.noteTypes.update": Permission.MANAGE_NOTE_TYPES,
  "tickets.metadataSearch": Permission.VIEW_CASES,
  "tickets.contentSearch": Permission.VIEW_CASES,
  "tickets.auditLog": Permission.VIEW_AUDIT_LOG,
  "tickets.updateContent": Permission.EDIT_CASE_SUMMARY,
  "tickets.rewrapFollowUp": Permission.VIEW_CASES,
  "tickets.getIntakeConversionTargets": Permission.VIEW_CASES,
  "tickets.convertIntakeKeyWrap": Permission.VIEW_CASES,
  "tickets.upgradeToSecureLink": Permission.MANAGE_PORTAL_CHANNEL,
  "tickets.regenerateSecureLink": Permission.MANAGE_PORTAL_CHANNEL,
  "tickets.revokeSecureLink": Permission.MANAGE_PORTAL_CHANNEL,
  "tickets.updateOutboundMessage": Permission.MESSAGE_CLIENTS_IN_PORTAL,
  "tickets.resetClientAccount": Permission.RESET_CLIENT_LOGIN,
  "tickets.listForClient": Permission.VIEW_CASES,
  "tickets.reseedPortalHistory": Permission.MANAGE_PORTAL_CHANNEL,
  "tickets.convertBlobForReseed": Permission.MANAGE_PORTAL_CHANNEL,
  "tickets.revokeReplyToken": Permission.REVOKE_REPLY_LINKS,

  // --- kb ---
  "kb.createCategory": Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES,
  "kb.listCategories": Permission.VIEW_KNOWLEDGE_BASE,
  "kb.updateCategory": Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES,
  "kb.deleteCategory": Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES,
  "kb.createItem": Permission.EDIT_KNOWLEDGE_BASE,
  "kb.getItem": Permission.VIEW_KNOWLEDGE_BASE,
  "kb.listItems": Permission.VIEW_KNOWLEDGE_BASE,
  "kb.updateItem": Permission.EDIT_KNOWLEDGE_BASE,
  "kb.deleteItem": Permission.DELETE_KNOWLEDGE_BASE_ARTICLES,
  "kb.listAuthors": Permission.VIEW_KNOWLEDGE_BASE,
  "kb.recentItems": Permission.VIEW_KNOWLEDGE_BASE,
  "kb.listBodies": Permission.VIEW_KNOWLEDGE_BASE,
  "kb.castVote": Permission.VIEW_KNOWLEDGE_BASE,
  "kb.removeVote": Permission.VIEW_KNOWLEDGE_BASE,
  "kb.getUserVote": Permission.VIEW_KNOWLEDGE_BASE,
  "kb.uploadAttachment": Permission.EDIT_KNOWLEDGE_BASE,
  "kb.listAttachments": Permission.VIEW_KNOWLEDGE_BASE,

  // --- branding ---
  "branding.saveBrandingField": Permission.MANAGE_ORG_IDENTITY,
  "branding.uploadIcons": Permission.MANAGE_ORG_IDENTITY,

  // --- reports ---
  "reports.queueStats": Permission.VIEW_REPORTS,
  "reports.volumeTrends": Permission.VIEW_REPORTS,
  "reports.resolutionTrends": Permission.VIEW_REPORTS,
  "reports.priorityBreakdown": Permission.VIEW_REPORTS,
  "reports.activeCount": Permission.VIEW_REPORTS,
  "reports.callLog": Permission.VIEW_REPORTS,

  // --- voicemailQuarantine ---
  "voicemailQuarantine.list": Permission.MANAGE_VOICEMAIL_QUARANTINE,
  "voicemailQuarantine.download": Permission.MANAGE_VOICEMAIL_QUARANTINE,
  "voicemailQuarantine.route": Permission.MANAGE_VOICEMAIL_QUARANTINE,
  "voicemailQuarantine.dismiss": Permission.MANAGE_VOICEMAIL_QUARANTINE,

  // --- clients ---
  "clients.list": Permission.VIEW_CLIENTS,
  "clients.get": Permission.VIEW_CLIENTS,
  "clients.updateAlias": Permission.EDIT_CLIENT_ALIAS,
  "clients.backfillPhoneMatchHash": Permission.VIEW_CLIENTS,
  "clients.updatePhone": Permission.VIEW_CASES,
  "clients.suggestDuplicates": Permission.VIEW_CLIENTS,
  "clients.getDismissals": Permission.VIEW_CLIENTS,
  "clients.putDismissals": Permission.VIEW_CLIENTS,
  "clients.mergeScanData": Permission.VIEW_CLIENTS,
  "clients.getPhoneSharedLine": Permission.VIEW_CLIENTS,
  "clients.setPhoneSharedLine": Permission.VIEW_CLIENTS,
  "clients.updateEmail": Permission.VIEW_CASES,
  "clients.deleteClient": Permission.DELETE_CLIENTS,

  // --- escalation ---
  "escalation.list": Permission.MANAGE_ESCALATION,
  "escalation.create": Permission.MANAGE_ESCALATION,
  "escalation.update": Permission.MANAGE_ESCALATION,
  "escalation.remove": Permission.MANAGE_ESCALATION,

  // --- intakeForms ---
  "intakeForms.list": Permission.MANAGE_INTAKE_FORMS,
  "intakeForms.get": Permission.MANAGE_INTAKE_FORMS,
  "intakeForms.save": Permission.MANAGE_INTAKE_FORMS,
  "intakeForms.remove": Permission.MANAGE_INTAKE_FORMS,
  "intakeForms.setActive": Permission.MANAGE_INTAKE_FORMS,
  "intakeForms.getWebIntakeEnabled": Permission.MANAGE_INTAKE_FORMS,
  "intakeForms.setWebIntakeEnabled": Permission.MANAGE_INTAKE_FORMS,
  "intakeForms.getBuiltinDefaultEnabled": Permission.MANAGE_INTAKE_FORMS,
  "intakeForms.setBuiltinDefaultEnabled": Permission.MANAGE_INTAKE_FORMS,
  "intakeForms.listResponses": Permission.VIEW_INTAKE_RESPONSES,
  "intakeForms.backfillWraps": Permission.VIEW_INTAKE_RESPONSES,
  "intakeForms.logExport": Permission.VIEW_INTAKE_RESPONSES,
  "intakeForms.uploadFormAsset": Permission.MANAGE_INTAKE_FORMS,

  // --- clientPortal ---
  "clientPortal.createShare": Permission.MANAGE_SHARE_LINKS,
  "clientPortal.listShares": Permission.MANAGE_SHARE_LINKS,

  // --- savedFilters ---
  "savedFilters.list": Permission.VIEW_CASES,
  "savedFilters.share": Permission.VIEW_CASES,
  "savedFilters.unshare": Permission.VIEW_CASES,

  // --- dev ---
  "dev.resetSeedData": Permission.MANAGE_ROLES,
  "dev.seedQuarantine": Permission.MANAGE_ROLES,
} as const satisfies Record<string, Permission>;

export type GatedProcedurePath = keyof typeof PROCEDURE_PERMISSIONS;
