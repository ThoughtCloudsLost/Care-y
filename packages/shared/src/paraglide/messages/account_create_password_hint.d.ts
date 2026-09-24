/**
* | output |
* | --- |
* | "Use 8 or more characters. A few random words are easy to remember and hard to guess." |
*
* @param {Account_Create_Password_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_create_password_hint: ((inputs?: Account_Create_Password_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Create_Password_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Create_Password_HintInputs = {};
