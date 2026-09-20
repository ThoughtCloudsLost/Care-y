/**
* | output |
* | --- |
* | "Edit case summary" |
*
* @param {Permission_Edit_Case_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_edit_case_summary: ((inputs?: Permission_Edit_Case_SummaryInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Edit_Case_SummaryInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Edit_Case_SummaryInputs = {};
