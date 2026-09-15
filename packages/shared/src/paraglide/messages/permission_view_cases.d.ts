/**
* | output |
* | --- |
* | "View cases" |
*
* @param {Permission_View_CasesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_view_cases: ((inputs?: Permission_View_CasesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_View_CasesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_View_CasesInputs = {};
