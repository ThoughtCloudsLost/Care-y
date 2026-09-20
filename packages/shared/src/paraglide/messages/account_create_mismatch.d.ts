/**
* | output |
* | --- |
* | "Passwords do not match." |
*
* @param {Account_Create_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_create_mismatch: ((inputs?: Account_Create_MismatchInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Create_MismatchInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Create_MismatchInputs = {};
