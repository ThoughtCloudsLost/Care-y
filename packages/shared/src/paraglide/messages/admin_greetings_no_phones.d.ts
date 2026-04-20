/**
* | output |
* | --- |
* | "Set up phone numbers in the Telephony section before adding greetings." |
*
* @param {Admin_Greetings_No_PhonesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_no_phones: ((inputs?: Admin_Greetings_No_PhonesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_No_PhonesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_No_PhonesInputs = {};
