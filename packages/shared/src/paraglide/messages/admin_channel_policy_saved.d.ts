/**
* | output |
* | --- |
* | "Channel policy updated" |
*
* @param {Admin_Channel_Policy_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_channel_policy_saved: ((inputs?: Admin_Channel_Policy_SavedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Channel_Policy_SavedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Channel_Policy_SavedInputs = {};
