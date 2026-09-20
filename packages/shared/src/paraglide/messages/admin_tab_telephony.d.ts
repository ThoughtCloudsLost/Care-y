/**
* | output |
* | --- |
* | "Telephony" |
*
* @param {Admin_Tab_TelephonyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_tab_telephony: ((inputs?: Admin_Tab_TelephonyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Tab_TelephonyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Tab_TelephonyInputs = {};
