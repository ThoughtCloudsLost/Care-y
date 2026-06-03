/**
* | output |
* | --- |
* | "Revoke" |
*
* @param {Admin_Invite_Pending_RevokeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_revoke: ((inputs?: Admin_Invite_Pending_RevokeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Pending_RevokeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Pending_RevokeInputs = {};
