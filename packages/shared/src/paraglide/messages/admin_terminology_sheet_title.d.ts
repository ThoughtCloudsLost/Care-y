/**
* | output |
* | --- |
* | "Edit Terminology" |
*
* @param {Admin_Terminology_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_sheet_title: ((inputs?: Admin_Terminology_Sheet_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_Sheet_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_Sheet_TitleInputs = {};
