/**
* | output |
* | --- |
* | "Expired" |
*
* @param {Admin_Invite_Pending_ExpiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_expired: ((inputs?: Admin_Invite_Pending_ExpiredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Pending_ExpiredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Pending_ExpiredInputs = {};
