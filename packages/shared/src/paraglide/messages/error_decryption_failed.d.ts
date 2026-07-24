/**
* | output |
* | --- |
* | "Could not unlock this content." |
*
* @param {Error_Decryption_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_decryption_failed: ((inputs?: Error_Decryption_FailedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Decryption_FailedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Decryption_FailedInputs = {};
