/**
* | output |
* | --- |
* | "Save new password" |
*
* @param {Account_Change_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_change_password: ((inputs?: Account_Change_PasswordInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Change_PasswordInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Change_PasswordInputs = {};
