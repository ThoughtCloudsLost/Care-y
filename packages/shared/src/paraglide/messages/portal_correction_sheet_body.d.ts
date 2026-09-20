/**
* | output |
* | --- |
* | "Enter the phone number or email you want the support team to use. A volunteer will review the correction before anything changes." |
*
* @param {Portal_Correction_Sheet_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_correction_sheet_body: ((inputs?: Portal_Correction_Sheet_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Correction_Sheet_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Correction_Sheet_BodyInputs = {};
