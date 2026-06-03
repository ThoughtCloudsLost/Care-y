/**
* | output |
* | --- |
* | "Send text message code" |
*
* @param {Twofa_Sms_Send_CodeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_sms_send_code: ((inputs?: Twofa_Sms_Send_CodeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Sms_Send_CodeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Sms_Send_CodeInputs = {};
