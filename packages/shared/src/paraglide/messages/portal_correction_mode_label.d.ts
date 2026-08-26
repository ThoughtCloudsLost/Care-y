/**
* | output |
* | --- |
* | "Correcting contact info" |
*
* @param {Portal_Correction_Mode_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_correction_mode_label: ((inputs?: Portal_Correction_Mode_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Correction_Mode_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Correction_Mode_LabelInputs = {};
