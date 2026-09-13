/**
* | output |
* | --- |
* | "That username is already taken. Try a different one." |
*
* @param {Error_Account_Username_TakenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_account_username_taken: ((inputs?: Error_Account_Username_TakenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Account_Username_TakenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Account_Username_TakenInputs = {};
