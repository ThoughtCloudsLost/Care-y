/**
* | output |
* | --- |
* | "Edit Note Type" |
*
* @param {Admin_Note_Types_EditInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_edit: ((inputs?: Admin_Note_Types_EditInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Note_Types_EditInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Note_Types_EditInputs = {};
