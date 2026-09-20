/**
* | output |
* | --- |
* | "Invite" |
*
* @param {Admin_Invite_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_button: ((inputs?: Admin_Invite_ButtonInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_ButtonInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_ButtonInputs = {};
