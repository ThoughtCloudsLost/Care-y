/**
* | output |
* | --- |
* | "Link copied to clipboard" |
*
* @param {Admin_Invite_Link_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_copied: ((inputs?: Admin_Invite_Link_CopiedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Link_CopiedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Link_CopiedInputs = {};
