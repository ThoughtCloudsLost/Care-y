/**
* | output |
* | --- |
* | "Connected numbers" |
*
* @param {Admin_Telephony_Connected_NumbersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_connected_numbers: ((inputs?: Admin_Telephony_Connected_NumbersInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Connected_NumbersInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Connected_NumbersInputs = {};
