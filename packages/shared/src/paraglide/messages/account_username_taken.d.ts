/**
* | output |
* | --- |
* | "That username is already taken. Try a different one." |
*
* @param {Account_Username_TakenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_username_taken: ((inputs?: Account_Username_TakenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Username_TakenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Username_TakenInputs = {};
