/**
* | output |
* | --- |
* | "There is no way to recover this password. Write it down somewhere safe or use a password manager." |
*
* @param {Account_Create_Warning_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_create_warning_password: ((inputs?: Account_Create_Warning_PasswordInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Create_Warning_PasswordInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Create_Warning_PasswordInputs = {};
