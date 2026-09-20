/**
* | output |
* | --- |
* | "Correct my contact info" |
*
* @param {Portal_Correction_Mode_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_correction_mode_button: ((inputs?: Portal_Correction_Mode_ButtonInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Correction_Mode_ButtonInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Correction_Mode_ButtonInputs = {};
