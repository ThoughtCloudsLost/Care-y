/**
* | output |
* | --- |
* | "SMS verification is not available for this organization." |
*
* @param {Error_Sms_2fa_Not_AvailableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_sms_2fa_not_available: ((inputs?: Error_Sms_2fa_Not_AvailableInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Sms_2fa_Not_AvailableInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Sms_2fa_Not_AvailableInputs = {};
