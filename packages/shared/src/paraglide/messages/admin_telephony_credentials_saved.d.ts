/**
* | output |
* | --- |
* | "Credentials saved" |
*
* @param {Admin_Telephony_Credentials_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_credentials_saved: ((inputs?: Admin_Telephony_Credentials_SavedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Credentials_SavedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Credentials_SavedInputs = {};
