/**
* | output |
* | --- |
* | "Manage channel routing" |
*
* @param {Permission_Manage_Channel_RoutingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_channel_routing: ((inputs?: Permission_Manage_Channel_RoutingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_Channel_RoutingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_Channel_RoutingInputs = {};
