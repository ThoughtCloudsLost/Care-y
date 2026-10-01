/**
* | output |
* | --- |
* | "Fund managers are not told when someone records an entry." |
*
* @param {Admin_Funds_Notify_Off_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_notify_off_hint: ((inputs?: Admin_Funds_Notify_Off_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Funds_Notify_Off_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Funds_Notify_Off_HintInputs = {};
