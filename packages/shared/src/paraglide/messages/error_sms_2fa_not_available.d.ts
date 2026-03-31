/**
* | output |
* | --- |
* | "SMS verification is not available for this organization." |
*
* @param {Error_Sms_2fa_Not_AvailableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_sms_2fa_not_available: ((inputs?: Error_Sms_2fa_Not_AvailableInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Sms_2fa_Not_AvailableInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Sms_2fa_Not_AvailableInputs = {};
