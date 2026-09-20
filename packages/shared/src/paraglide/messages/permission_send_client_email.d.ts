/**
* | output |
* | --- |
* | "Send client email" |
*
* @param {Permission_Send_Client_EmailInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_send_client_email: ((inputs?: Permission_Send_Client_EmailInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Send_Client_EmailInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Send_Client_EmailInputs = {};
