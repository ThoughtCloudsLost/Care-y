/**
* | output |
* | --- |
* | "No phone number enrolled. Set up SMS verification first." |
*
* @param {Error_No_Sms_Phone_EnrolledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_no_sms_phone_enrolled: ((inputs?: Error_No_Sms_Phone_EnrolledInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_No_Sms_Phone_EnrolledInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_No_Sms_Phone_EnrolledInputs = {};
