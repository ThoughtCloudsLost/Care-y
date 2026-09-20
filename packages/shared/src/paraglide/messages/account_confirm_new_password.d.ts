/**
* | output |
* | --- |
* | "Confirm new password" |
*
* @param {Account_Confirm_New_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_confirm_new_password: ((inputs?: Account_Confirm_New_PasswordInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Confirm_New_PasswordInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Confirm_New_PasswordInputs = {};
