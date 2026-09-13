/**
* | output |
* | --- |
* | "This response could not be decrypted. The blob may be malformed or from an earlier format." |
*
* @param {Intake_Responses_Decrypt_Failed_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_decrypt_failed_hint: ((inputs?: Intake_Responses_Decrypt_Failed_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_Decrypt_Failed_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_Decrypt_Failed_HintInputs = {};
