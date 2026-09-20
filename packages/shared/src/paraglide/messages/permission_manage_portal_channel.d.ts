/**
* | output |
* | --- |
* | "Manage portal channel" |
*
* @param {Permission_Manage_Portal_ChannelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_portal_channel: ((inputs?: Permission_Manage_Portal_ChannelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_Portal_ChannelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_Portal_ChannelInputs = {};
