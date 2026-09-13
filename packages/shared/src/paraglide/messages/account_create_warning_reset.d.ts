/**
* | output |
* | --- |
* | "If your password is ever reset, your message history is permanently lost. There is no way to get it back." |
*
* @param {Account_Create_Warning_ResetInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_create_warning_reset: ((inputs?: Account_Create_Warning_ResetInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Create_Warning_ResetInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Create_Warning_ResetInputs = {};
