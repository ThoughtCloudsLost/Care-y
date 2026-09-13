/**
* | output |
* | --- |
* | "Could not decrypt" |
*
* @param {Intake_Responses_Decrypt_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_decrypt_failed: ((inputs?: Intake_Responses_Decrypt_FailedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_Decrypt_FailedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_Decrypt_FailedInputs = {};
