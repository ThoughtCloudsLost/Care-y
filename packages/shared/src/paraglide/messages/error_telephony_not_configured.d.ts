/**
* | output |
* | --- |
* | "Telephony is not configured for this organization." |
*
* @param {Error_Telephony_Not_ConfiguredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_telephony_not_configured: ((inputs?: Error_Telephony_Not_ConfiguredInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Telephony_Not_ConfiguredInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Telephony_Not_ConfiguredInputs = {};
