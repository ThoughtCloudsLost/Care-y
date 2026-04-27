/**
* | output |
* | --- |
* | "Changes may take a few minutes to take effect." |
*
* @param {Admin_Telephony_Grace_PeriodInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_grace_period: ((inputs?: Admin_Telephony_Grace_PeriodInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Grace_PeriodInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Grace_PeriodInputs = {};
