/**
* | output |
* | --- |
* | "Message clients in portal" |
*
* @param {Permission_Message_Clients_In_PortalInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_message_clients_in_portal: ((inputs?: Permission_Message_Clients_In_PortalInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Message_Clients_In_PortalInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Message_Clients_In_PortalInputs = {};
