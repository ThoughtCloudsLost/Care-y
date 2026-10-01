/**
* | output |
* | --- |
* | "Three-letter code, such as USD, EUR or MXN." |
*
* @param {Admin_Funds_Currency_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_currency_hint: ((inputs?: Admin_Funds_Currency_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Funds_Currency_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Funds_Currency_HintInputs = {};
