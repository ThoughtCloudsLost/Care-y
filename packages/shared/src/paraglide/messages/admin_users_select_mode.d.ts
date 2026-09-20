/**
* | output |
* | --- |
* | "Select users" |
*
* @param {Admin_Users_Select_ModeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_users_select_mode: ((inputs?: Admin_Users_Select_ModeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Users_Select_ModeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Users_Select_ModeInputs = {};
