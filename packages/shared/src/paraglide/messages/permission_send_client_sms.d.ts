/**
* | output |
* | --- |
* | "Send client SMS" |
*
* @param {Permission_Send_Client_SmsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_send_client_sms: ((inputs?: Permission_Send_Client_SmsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Send_Client_SmsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Send_Client_SmsInputs = {};
