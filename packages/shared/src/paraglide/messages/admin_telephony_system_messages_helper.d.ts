/**
* | output |
* | --- |
* | "The number used for appointment reminders and status updates" |
*
* @param {Admin_Telephony_System_Messages_HelperInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_system_messages_helper: ((inputs?: Admin_Telephony_System_Messages_HelperInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_System_Messages_HelperInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_System_Messages_HelperInputs = {};
