/**
* | output |
* | --- |
* | "Reset client login" |
*
* @param {Permission_Reset_Client_LoginInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_reset_client_login: ((inputs?: Permission_Reset_Client_LoginInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Reset_Client_LoginInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Reset_Client_LoginInputs = {};
