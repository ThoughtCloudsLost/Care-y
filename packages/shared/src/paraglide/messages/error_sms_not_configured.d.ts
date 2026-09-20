/**
* | output |
* | --- |
* | "SMS is not available. Telephony is not configured." |
*
* @param {Error_Sms_Not_ConfiguredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_sms_not_configured: ((inputs?: Error_Sms_Not_ConfiguredInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Sms_Not_ConfiguredInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Sms_Not_ConfiguredInputs = {};
