/**
* | output |
* | --- |
* | "Send text messages to clients" |
*
* @param {Permission_Send_Client_SmsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_send_client_sms: ((inputs?: Permission_Send_Client_SmsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Send_Client_SmsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Send_Client_SmsInputs = {};
