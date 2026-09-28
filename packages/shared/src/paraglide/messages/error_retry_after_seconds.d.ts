/**
* | output |
* | --- |
* | "Too many attempts. Try again in {seconds} seconds." |
*
* @param {Error_Retry_After_SecondsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_retry_after_seconds: ((inputs: Error_Retry_After_SecondsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Retry_After_SecondsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Retry_After_SecondsInputs = {
    seconds: NonNullable<unknown>;
};
