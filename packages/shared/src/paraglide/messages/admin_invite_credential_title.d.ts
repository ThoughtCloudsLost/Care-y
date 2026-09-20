/**
* | output |
* | --- |
* | "Account Created" |
*
* @param {Admin_Invite_Credential_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_credential_title: ((inputs?: Admin_Invite_Credential_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Credential_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Credential_TitleInputs = {};
