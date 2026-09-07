/**
* | output |
* | --- |
* | "Volunteers cannot send one-time share links." |
*
* @param {Admin_Channel_Share_Link_Off_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_channel_share_link_off_hint: ((inputs?: Admin_Channel_Share_Link_Off_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Channel_Share_Link_Off_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Channel_Share_Link_Off_HintInputs = {};
