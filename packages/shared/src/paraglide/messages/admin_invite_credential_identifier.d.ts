/**
* | output |
* | --- |
* | "Login Username" |
*
* @param {Admin_Invite_Credential_IdentifierInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_credential_identifier: ((inputs?: Admin_Invite_Credential_IdentifierInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Credential_IdentifierInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Credential_IdentifierInputs = {};
