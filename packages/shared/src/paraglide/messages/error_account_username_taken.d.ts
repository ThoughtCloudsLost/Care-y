/**
* | output |
* | --- |
* | "That username is already taken. Try a different one." |
*
* @param {Error_Account_Username_TakenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_account_username_taken: ((inputs?: Error_Account_Username_TakenInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Account_Username_TakenInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Account_Username_TakenInputs = {};
