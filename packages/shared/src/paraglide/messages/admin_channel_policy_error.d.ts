/**
* | output |
* | --- |
* | "Could not update channel policy" |
*
* @param {Admin_Channel_Policy_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_channel_policy_error: ((inputs?: Admin_Channel_Policy_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Channel_Policy_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Channel_Policy_ErrorInputs = {};
