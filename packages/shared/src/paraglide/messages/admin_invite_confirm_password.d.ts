/**
* | output |
* | --- |
* | "Confirm Password" |
*
* @param {Admin_Invite_Confirm_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_confirm_password: ((inputs?: Admin_Invite_Confirm_PasswordInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Confirm_PasswordInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Confirm_PasswordInputs = {};
