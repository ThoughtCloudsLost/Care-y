/**
* | output |
* | --- |
* | "Write case notes" |
*
* @param {Permission_Write_Case_NotesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_write_case_notes: ((inputs?: Permission_Write_Case_NotesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Write_Case_NotesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Write_Case_NotesInputs = {};
