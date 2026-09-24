/**
* | output |
* | --- |
* | "Delete others' notes" |
*
* @param {Permission_Delete_Others_NotesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_delete_others_notes: ((inputs?: Permission_Delete_Others_NotesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Delete_Others_NotesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Delete_Others_NotesInputs = {};
