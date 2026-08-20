/**
* | output |
* | --- |
* | "If you ever forget your password and it gets reset, your message history is lost. Changing it here keeps everything." |
*
* @param {Account_Change_Reset_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_change_reset_warning: ((inputs?: Account_Change_Reset_WarningInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Change_Reset_WarningInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Change_Reset_WarningInputs = {};
