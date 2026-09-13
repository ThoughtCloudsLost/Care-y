/**
* | output |
* | --- |
* | "Enter the phone number or email you want the support team to use. A volunteer will review it before anything changes. For your safety this page never shows t..." |
*
* @param {Portal_Correction_Sheet_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_correction_sheet_body: ((inputs?: Portal_Correction_Sheet_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Correction_Sheet_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Correction_Sheet_BodyInputs = {};
