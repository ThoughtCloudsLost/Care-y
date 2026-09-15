/**
* | output |
* | --- |
* | "Link cases together" |
*
* @param {Permission_Link_CasesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_link_cases: ((inputs?: Permission_Link_CasesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Link_CasesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Link_CasesInputs = {};
