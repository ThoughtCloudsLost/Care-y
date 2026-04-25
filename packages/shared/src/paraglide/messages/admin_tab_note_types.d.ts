/**
* | output |
* | --- |
* | "Follow-Ups" |
*
* @param {Admin_Tab_Note_TypesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_note_types: ((inputs?: Admin_Tab_Note_TypesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Tab_Note_TypesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Tab_Note_TypesInputs = {};
