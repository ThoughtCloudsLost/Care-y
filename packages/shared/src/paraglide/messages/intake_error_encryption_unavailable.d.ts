/**
* | output |
* | --- |
* | "This form can't encrypt right now. Please call instead." |
*
* @param {Intake_Error_Encryption_UnavailableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_encryption_unavailable: ((inputs?: Intake_Error_Encryption_UnavailableInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Error_Encryption_UnavailableInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Error_Encryption_UnavailableInputs = {};
