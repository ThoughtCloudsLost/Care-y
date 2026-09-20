/**
* | output |
* | --- |
* | "Send correction" |
*
* @param {Portal_Correction_Sheet_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_correction_sheet_submit: ((inputs?: Portal_Correction_Sheet_SubmitInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Correction_Sheet_SubmitInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Correction_Sheet_SubmitInputs = {};
