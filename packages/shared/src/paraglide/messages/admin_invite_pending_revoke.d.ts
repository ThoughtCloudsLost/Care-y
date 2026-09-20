/**
* | output |
* | --- |
* | "Revoke" |
*
* @param {Admin_Invite_Pending_RevokeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_revoke: ((inputs?: Admin_Invite_Pending_RevokeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Pending_RevokeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Pending_RevokeInputs = {};
