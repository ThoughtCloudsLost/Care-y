/**
* | output |
* | --- |
* | "Send correction" |
*
* @param {Portal_Correction_Sheet_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_correction_sheet_submit: ((inputs?: Portal_Correction_Sheet_SubmitInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Correction_Sheet_SubmitInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Correction_Sheet_SubmitInputs = {};
