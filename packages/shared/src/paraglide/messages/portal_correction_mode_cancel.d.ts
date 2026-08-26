/**
* | output |
* | --- |
* | "Cancel correction" |
*
* @param {Portal_Correction_Mode_CancelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_correction_mode_cancel: ((inputs?: Portal_Correction_Mode_CancelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Correction_Mode_CancelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Correction_Mode_CancelInputs = {};
