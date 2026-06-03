/**
* | output |
* | --- |
* | "Invite link generated" |
*
* @param {Admin_Invite_Link_GeneratedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_generated: ((inputs?: Admin_Invite_Link_GeneratedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Link_GeneratedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Link_GeneratedInputs = {};
