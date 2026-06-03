/**
* | output |
* | --- |
* | "Expires {time}" |
*
* @param {Admin_Invite_Pending_Expires_InInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_expires_in: ((inputs: Admin_Invite_Pending_Expires_InInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Pending_Expires_InInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Pending_Expires_InInputs = {
    time: NonNullable<unknown>;
};
