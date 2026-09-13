/**
* | output |
* | --- |
* | "Confirm password" |
*
* @param {Account_Create_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_create_confirm: ((inputs?: Account_Create_ConfirmInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Create_ConfirmInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Create_ConfirmInputs = {};
