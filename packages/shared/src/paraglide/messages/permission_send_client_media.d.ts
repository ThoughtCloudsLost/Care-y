/**
* | output |
* | --- |
* | "Send files to clients" |
*
* @param {Permission_Send_Client_MediaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_send_client_media: ((inputs?: Permission_Send_Client_MediaInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Send_Client_MediaInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Send_Client_MediaInputs = {};
