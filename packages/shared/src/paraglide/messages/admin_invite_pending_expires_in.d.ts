/**
* | output |
* | --- |
* | "Expires {time}" |
*
* @param {Admin_Invite_Pending_Expires_InInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_expires_in: ((inputs: Admin_Invite_Pending_Expires_InInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Pending_Expires_InInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Pending_Expires_InInputs = {
    time: NonNullable<unknown>;
};
