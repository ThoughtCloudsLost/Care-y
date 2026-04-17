/**
* | output |
* | --- |
* | "Cancel" |
*
* @param {Admin_Invite_CancelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_cancel: ((inputs?: Admin_Invite_CancelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_CancelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_CancelInputs = {};
