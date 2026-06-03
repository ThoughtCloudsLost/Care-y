/**
* | output |
* | --- |
* | "Invite with Link" |
*
* @param {Admin_Invite_Menu_LinkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_invite_menu_link: ((inputs?: Admin_Invite_Menu_LinkInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Menu_LinkInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Menu_LinkInputs = {};
