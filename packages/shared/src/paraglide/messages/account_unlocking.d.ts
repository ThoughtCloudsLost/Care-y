/**
* | output |
* | --- |
* | "Unlocking your messages..." |
*
* @param {Account_UnlockingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_unlocking: ((inputs?: Account_UnlockingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_UnlockingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_UnlockingInputs = {};
