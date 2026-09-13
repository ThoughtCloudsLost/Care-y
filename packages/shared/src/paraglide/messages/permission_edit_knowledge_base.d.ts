/**
* | output |
* | --- |
* | "Edit knowledge base" |
*
* @param {Permission_Edit_Knowledge_BaseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_edit_knowledge_base: ((inputs?: Permission_Edit_Knowledge_BaseInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Edit_Knowledge_BaseInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Edit_Knowledge_BaseInputs = {};
