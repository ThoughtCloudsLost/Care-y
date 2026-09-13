/**
* | output |
* | --- |
* | "The conversation changed while you were setting up. Please try again." |
*
* @param {Account_Stale_ThreadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_stale_thread: ((inputs?: Account_Stale_ThreadInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Stale_ThreadInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Stale_ThreadInputs = {};
