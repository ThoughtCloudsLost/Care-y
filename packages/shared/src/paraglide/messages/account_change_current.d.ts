/**
* | output |
* | --- |
* | "Current password" |
*
* @param {Account_Change_CurrentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_change_current: ((inputs?: Account_Change_CurrentInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Change_CurrentInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Change_CurrentInputs = {};
