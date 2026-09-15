/**
* | output |
* | --- |
* | "Write case notes" |
*
* @param {Permission_Write_Case_NotesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_write_case_notes: ((inputs?: Permission_Write_Case_NotesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Write_Case_NotesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Write_Case_NotesInputs = {};
