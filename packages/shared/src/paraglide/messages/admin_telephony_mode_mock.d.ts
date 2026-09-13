/**
* | output |
* | --- |
* | "Simulated provider (development only)" |
*
* @param {Admin_Telephony_Mode_MockInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_mode_mock: ((inputs?: Admin_Telephony_Mode_MockInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Mode_MockInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Mode_MockInputs = {};
