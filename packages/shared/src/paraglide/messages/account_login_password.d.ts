/**
* | output |
* | --- |
* | "Password" |
*
* @param {Account_Login_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_login_password: ((inputs?: Account_Login_PasswordInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Login_PasswordInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Login_PasswordInputs = {};
