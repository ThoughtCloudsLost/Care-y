/**
* | output |
* | --- |
* | "Edit the case summary" |
*
* @param {Permission_Edit_Case_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_edit_case_summary: ((inputs?: Permission_Edit_Case_SummaryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Edit_Case_SummaryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Edit_Case_SummaryInputs = {};
