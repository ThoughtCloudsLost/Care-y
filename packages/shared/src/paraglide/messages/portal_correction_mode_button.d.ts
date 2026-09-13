/**
* | output |
* | --- |
* | "Correct my contact info" |
*
* @param {Portal_Correction_Mode_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_correction_mode_button: ((inputs?: Portal_Correction_Mode_ButtonInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Correction_Mode_ButtonInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Correction_Mode_ButtonInputs = {};
