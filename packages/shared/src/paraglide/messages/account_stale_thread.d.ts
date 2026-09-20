/**
* | output |
* | --- |
* | "The conversation changed while you were setting up. Please try again." |
*
* @param {Account_Stale_ThreadInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_stale_thread: ((inputs?: Account_Stale_ThreadInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Stale_ThreadInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Stale_ThreadInputs = {};
