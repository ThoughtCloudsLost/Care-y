/**
* | output |
* | --- |
* | "Find this in your {provider} account settings" |
*
* @param {Admin_Telephony_Account_Id_HelperInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_account_id_helper: ((inputs: Admin_Telephony_Account_Id_HelperInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Account_Id_HelperInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Account_Id_HelperInputs = {
    provider: NonNullable<unknown>;
};
