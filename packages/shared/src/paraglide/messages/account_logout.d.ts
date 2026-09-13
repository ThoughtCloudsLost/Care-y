/**
* | output |
* | --- |
* | "Sign out" |
*
* @param {Account_LogoutInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_logout: ((inputs?: Account_LogoutInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_LogoutInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_LogoutInputs = {};
