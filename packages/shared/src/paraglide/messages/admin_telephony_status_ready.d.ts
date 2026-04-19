/**
* | output |
* | --- |
* | "Phone service active" |
*
* @param {Admin_Telephony_Status_ReadyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_status_ready: ((inputs?: Admin_Telephony_Status_ReadyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Status_ReadyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Status_ReadyInputs = {};
