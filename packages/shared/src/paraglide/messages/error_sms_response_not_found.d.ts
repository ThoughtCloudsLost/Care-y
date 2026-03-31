/**
* | output |
* | --- |
* | "SMS response not found." |
*
* @param {Error_Sms_Response_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_sms_response_not_found: ((inputs?: Error_Sms_Response_Not_FoundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Sms_Response_Not_FoundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Sms_Response_Not_FoundInputs = {};
