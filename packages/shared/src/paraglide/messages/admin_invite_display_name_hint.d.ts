/**
* | output |
* | --- |
* | "End-to-end encrypted. Only your team can read this." |
*
* @param {Admin_Invite_Display_Name_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_display_name_hint: ((inputs?: Admin_Invite_Display_Name_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Display_Name_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Display_Name_HintInputs = {};
