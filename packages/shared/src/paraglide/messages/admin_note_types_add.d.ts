/**
* | output |
* | --- |
* | "Add Note Type" |
*
* @param {Admin_Note_Types_AddInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_add: ((inputs?: Admin_Note_Types_AddInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Note_Types_AddInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Note_Types_AddInputs = {};
