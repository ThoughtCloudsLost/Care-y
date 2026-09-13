/**
* | output |
* | --- |
* | "Passwords do not match." |
*
* @param {Account_Create_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_create_mismatch: ((inputs?: Account_Create_MismatchInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Create_MismatchInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Create_MismatchInputs = {};
