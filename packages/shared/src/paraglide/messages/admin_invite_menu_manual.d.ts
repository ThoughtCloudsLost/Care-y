/**
* | output |
* | --- |
* | "Create User Manually" |
*
* @param {Admin_Invite_Menu_ManualInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_invite_menu_manual: ((inputs?: Admin_Invite_Menu_ManualInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Invite_Menu_ManualInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Invite_Menu_ManualInputs = {};
