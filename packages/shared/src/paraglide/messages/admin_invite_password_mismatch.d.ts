/**
* | output |
* | --- |
* | "Passwords do not match" |
*
* @param {Admin_Invite_Password_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_password_mismatch: ((inputs?: Admin_Invite_Password_MismatchInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Password_MismatchInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Password_MismatchInputs = {};
