/**
* | output |
* | --- |
* | "The number clients see when a volunteer calls them" |
*
* @param {Admin_Telephony_Outbound_Calls_HelperInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_outbound_calls_helper: ((inputs?: Admin_Telephony_Outbound_Calls_HelperInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Outbound_Calls_HelperInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Outbound_Calls_HelperInputs = {};
