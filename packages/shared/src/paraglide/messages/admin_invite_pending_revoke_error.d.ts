/**
* | output |
* | --- |
* | "Failed to revoke invite" |
*
* @param {Admin_Invite_Pending_Revoke_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_revoke_error: ((inputs?: Admin_Invite_Pending_Revoke_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Pending_Revoke_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Pending_Revoke_ErrorInputs = {};
