/**
* | output |
* | --- |
* | "Channel Policy" |
*
* @param {Admin_Channel_Policy_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_channel_policy_title: ((inputs?: Admin_Channel_Policy_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Channel_Policy_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Channel_Policy_TitleInputs = {};
