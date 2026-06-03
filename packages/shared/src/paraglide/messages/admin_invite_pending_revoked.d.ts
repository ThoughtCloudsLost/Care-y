/**
* | output |
* | --- |
* | "Invite revoked" |
*
* @param {Admin_Invite_Pending_RevokedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_revoked: ((inputs?: Admin_Invite_Pending_RevokedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Pending_RevokedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Pending_RevokedInputs = {};
