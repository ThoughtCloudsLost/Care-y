/**
* | output |
* | --- |
* | "SMS response not found." |
*
* @param {Error_Sms_Response_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_sms_response_not_found: ((inputs?: Error_Sms_Response_Not_FoundInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Sms_Response_Not_FoundInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Sms_Response_Not_FoundInputs = {};
