/**
* | output |
* | --- |
* | "Invited by {name}" |
*
* @param {Admin_Invite_Pending_Invited_ByInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_pending_invited_by: ((inputs: Admin_Invite_Pending_Invited_ByInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Pending_Invited_ByInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Pending_Invited_ByInputs = {
    name: NonNullable<unknown>;
};
