/**
* | output |
* | --- |
* | "Submitting to server..." |
*
* @param {Admin_Rotation_SubmittingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_submitting: ((inputs?: Admin_Rotation_SubmittingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Rotation_SubmittingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Rotation_SubmittingInputs = {};
