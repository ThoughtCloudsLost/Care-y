/**
* | output |
* | --- |
* | "Password" |
*
* @param {Admin_Invite_Credential_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_credential_password: ((inputs?: Admin_Invite_Credential_PasswordInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Credential_PasswordInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Credential_PasswordInputs = {};
