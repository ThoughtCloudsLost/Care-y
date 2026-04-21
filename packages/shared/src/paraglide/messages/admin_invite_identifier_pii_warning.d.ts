/**
* | output |
* | --- |
* | "Login Usernames are stored with weaker encryption than display names because the server needs to be able to read them. Avoid using real names or email addres..." |
*
* @param {Admin_Invite_Identifier_Pii_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_identifier_pii_warning: ((inputs?: Admin_Invite_Identifier_Pii_WarningInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Identifier_Pii_WarningInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Identifier_Pii_WarningInputs = {};
