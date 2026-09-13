/**
* | output |
* | --- |
* | "Username" |
*
* @param {Account_Login_UsernameInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_login_username: ((inputs?: Account_Login_UsernameInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Login_UsernameInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Login_UsernameInputs = {};
