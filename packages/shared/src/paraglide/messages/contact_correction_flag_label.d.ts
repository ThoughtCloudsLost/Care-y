/**
* | output |
* | --- |
* | "Contact correction, verify before contacting" |
*
* @param {Contact_Correction_Flag_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const contact_correction_flag_label: ((inputs?: Contact_Correction_Flag_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Contact_Correction_Flag_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Contact_Correction_Flag_LabelInputs = {};
