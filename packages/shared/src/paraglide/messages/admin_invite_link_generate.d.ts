/**
* | output |
* | --- |
* | "Generate Invite Link" |
*
* @param {Admin_Invite_Link_GenerateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_generate: ((inputs?: Admin_Invite_Link_GenerateInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Link_GenerateInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Link_GenerateInputs = {};
