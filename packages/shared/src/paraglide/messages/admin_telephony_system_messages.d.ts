/**
* | output |
* | --- |
* | "Automated texts" |
*
* @param {Admin_Telephony_System_MessagesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_system_messages: ((inputs?: Admin_Telephony_System_MessagesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_System_MessagesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_System_MessagesInputs = {};
