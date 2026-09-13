/**
* | output |
* | --- |
* | "Password" |
*
* @param {Account_Login_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_login_password: ((inputs?: Account_Login_PasswordInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Login_PasswordInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Login_PasswordInputs = {};
