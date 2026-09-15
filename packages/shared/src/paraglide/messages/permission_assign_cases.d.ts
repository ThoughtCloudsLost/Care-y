/**
* | output |
* | --- |
* | "Assign cases to other people" |
*
* @param {Permission_Assign_CasesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_assign_cases: ((inputs?: Permission_Assign_CasesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Assign_CasesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Assign_CasesInputs = {};
