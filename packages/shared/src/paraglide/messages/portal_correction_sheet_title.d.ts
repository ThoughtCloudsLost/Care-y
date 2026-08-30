/**
* | output |
* | --- |
* | "Correct my contact info" |
*
* @param {Portal_Correction_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_correction_sheet_title: ((inputs?: Portal_Correction_Sheet_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Correction_Sheet_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Correction_Sheet_TitleInputs = {};
