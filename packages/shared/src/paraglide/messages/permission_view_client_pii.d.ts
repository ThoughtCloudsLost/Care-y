/**
* | output |
* | --- |
* | "View client PII" |
*
* @param {Permission_View_Client_PiiInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_view_client_pii: ((inputs?: Permission_View_Client_PiiInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_View_Client_PiiInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_View_Client_PiiInputs = {};
