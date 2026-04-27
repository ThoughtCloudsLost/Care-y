/**
* | output |
* | --- |
* | "Remove blocked number" |
*
* @param {Admin_Blocklist_Remove_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_remove_title: ((inputs?: Admin_Blocklist_Remove_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Blocklist_Remove_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Blocklist_Remove_TitleInputs = {};
