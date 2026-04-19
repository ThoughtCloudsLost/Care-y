/**
* | output |
* | --- |
* | "Update credentials" |
*
* @param {Admin_Telephony_Update_CredentialsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_update_credentials: ((inputs?: Admin_Telephony_Update_CredentialsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Update_CredentialsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Update_CredentialsInputs = {};
