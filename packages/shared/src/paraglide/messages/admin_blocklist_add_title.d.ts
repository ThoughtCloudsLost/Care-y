/**
* | output |
* | --- |
* | "Block Number" |
*
* @param {Admin_Blocklist_Add_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_add_title: ((inputs?: Admin_Blocklist_Add_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Blocklist_Add_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Blocklist_Add_TitleInputs = {};
