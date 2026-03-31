/**
* | output |
* | --- |
* | "Telephony is not configured for this organization." |
*
* @param {Error_Telephony_Not_ConfiguredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_telephony_not_configured: ((inputs?: Error_Telephony_Not_ConfiguredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Telephony_Not_ConfiguredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Telephony_Not_ConfiguredInputs = {};
