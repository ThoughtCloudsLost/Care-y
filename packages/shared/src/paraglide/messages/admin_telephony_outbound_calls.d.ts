/**
* | output |
* | --- |
* | "Outgoing calls" |
*
* @param {Admin_Telephony_Outbound_CallsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_outbound_calls: ((inputs?: Admin_Telephony_Outbound_CallsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Outbound_CallsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Outbound_CallsInputs = {};
