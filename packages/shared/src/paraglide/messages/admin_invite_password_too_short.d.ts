/**
* | output |
* | --- |
* | "Password must be at least 16 characters" |
*
* @param {Admin_Invite_Password_Too_ShortInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_password_too_short: ((inputs?: Admin_Invite_Password_Too_ShortInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Password_Too_ShortInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Password_Too_ShortInputs = {};
