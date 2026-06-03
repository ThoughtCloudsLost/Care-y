/**
* | output |
* | --- |
* | "Generate a single-use invite link. Share it with the new team member to create their own account." |
*
* @param {Admin_Invite_Link_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_link_subtext: ((inputs?: Admin_Invite_Link_SubtextInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Link_SubtextInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Link_SubtextInputs = {};
