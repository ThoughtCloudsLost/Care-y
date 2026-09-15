/**
* | output |
* | --- |
* | "Delete other people's notes" |
*
* @param {Permission_Delete_Others_NotesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_delete_others_notes: ((inputs?: Permission_Delete_Others_NotesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Delete_Others_NotesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Delete_Others_NotesInputs = {};
