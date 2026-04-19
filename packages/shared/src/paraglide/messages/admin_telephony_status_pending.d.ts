/**
* | output |
* | --- |
* | "Phone service not set up" |
*
* @param {Admin_Telephony_Status_PendingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_status_pending: ((inputs?: Admin_Telephony_Status_PendingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Status_PendingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Status_PendingInputs = {};
