/**
* | output |
* | --- |
* | "Add blocked number" |
*
* @param {Admin_Blocklist_Add_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_add_button: ((inputs?: Admin_Blocklist_Add_ButtonInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Blocklist_Add_ButtonInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Blocklist_Add_ButtonInputs = {};
