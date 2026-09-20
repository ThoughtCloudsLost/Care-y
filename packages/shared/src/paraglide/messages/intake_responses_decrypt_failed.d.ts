/**
* | output |
* | --- |
* | "Could not decrypt" |
*
* @param {Intake_Responses_Decrypt_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_decrypt_failed: ((inputs?: Intake_Responses_Decrypt_FailedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_Decrypt_FailedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_Decrypt_FailedInputs = {};
