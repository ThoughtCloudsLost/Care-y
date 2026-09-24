/**
* | output |
* | --- |
* | "Controls whether a client can access the secure portal for their case." |
*
* @param {Permission_Manage_Portal_Channel_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_portal_channel_hint: ((inputs?: Permission_Manage_Portal_Channel_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_Portal_Channel_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_Portal_Channel_HintInputs = {};
