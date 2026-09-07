/**
* | output |
* | --- |
* | "Channel Policy" |
*
* @param {Admin_Tab_Channel_PolicyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_channel_policy: ((inputs?: Admin_Tab_Channel_PolicyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Tab_Channel_PolicyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Tab_Channel_PolicyInputs = {};
