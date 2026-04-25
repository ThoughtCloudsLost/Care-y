/**
* | output |
* | --- |
* | "What is this note type used for?" |
*
* @param {Admin_Note_Types_Description_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_description_placeholder: ((inputs?: Admin_Note_Types_Description_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Note_Types_Description_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Note_Types_Description_PlaceholderInputs = {};
