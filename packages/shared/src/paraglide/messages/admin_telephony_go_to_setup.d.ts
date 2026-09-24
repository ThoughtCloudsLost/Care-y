/**
* | output |
* | --- |
* | "Set up telephony" |
*
* @param {Admin_Telephony_Go_To_SetupInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_go_to_setup: ((inputs?: Admin_Telephony_Go_To_SetupInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Go_To_SetupInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Go_To_SetupInputs = {};
