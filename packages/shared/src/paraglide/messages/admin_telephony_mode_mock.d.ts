/**
* | output |
* | --- |
* | "Simulated provider (development only)" |
*
* @param {Admin_Telephony_Mode_MockInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_mode_mock: ((inputs?: Admin_Telephony_Mode_MockInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Mode_MockInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Mode_MockInputs = {};
