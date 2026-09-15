/**
* | output |
* | --- |
* | "Define the kinds of notes people can write" |
*
* @param {Permission_Manage_Note_TypesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_note_types: ((inputs?: Permission_Manage_Note_TypesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_Note_TypesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_Note_TypesInputs = {};
