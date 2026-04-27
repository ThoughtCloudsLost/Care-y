/**
* | output |
* | --- |
* | "Share these credentials securely with the new volunteer. This is the only time they will be shown." |
*
* @param {Admin_Invite_Credential_InstructionsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_credential_instructions: ((inputs?: Admin_Invite_Credential_InstructionsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Credential_InstructionsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Credential_InstructionsInputs = {};
