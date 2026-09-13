/**
* | output |
* | --- |
* | "Your session will end soon due to inactivity. Any activity keeps it signed in." |
*
* @param {Account_Idle_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_idle_warning: ((inputs?: Account_Idle_WarningInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Idle_WarningInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Idle_WarningInputs = {};
