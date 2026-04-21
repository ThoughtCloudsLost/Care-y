/**
* | output |
* | --- |
* | "Display name updated" |
*
* @param {Admin_Display_Name_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_display_name_updated: ((inputs?: Admin_Display_Name_UpdatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Display_Name_UpdatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Display_Name_UpdatedInputs = {};
