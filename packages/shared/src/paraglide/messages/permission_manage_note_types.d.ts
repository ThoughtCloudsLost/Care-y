/**
* | output |
* | --- |
* | "Manage note types" |
*
* @param {Permission_Manage_Note_TypesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_note_types: ((inputs?: Permission_Manage_Note_TypesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_Note_TypesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_Note_TypesInputs = {};
