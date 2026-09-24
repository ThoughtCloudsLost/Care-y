/**
* | output |
* | --- |
* | "Show" |
*
* @param {Admin_Invite_Credential_ShowInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_credential_show: ((inputs?: Admin_Invite_Credential_ShowInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Credential_ShowInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Credential_ShowInputs = {};
