/**
* | output |
* | --- |
* | "Knowledge base" |
*
* @param {Roles_Group_Knowledge_BaseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_group_knowledge_base: ((inputs?: Roles_Group_Knowledge_BaseInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Group_Knowledge_BaseInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Group_Knowledge_BaseInputs = {};
