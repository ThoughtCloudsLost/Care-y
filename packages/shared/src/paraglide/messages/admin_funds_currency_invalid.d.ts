/**
* | output |
* | --- |
* | "Enter a three-letter currency code." |
*
* @param {Admin_Funds_Currency_InvalidInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_currency_invalid: ((inputs?: Admin_Funds_Currency_InvalidInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Funds_Currency_InvalidInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Funds_Currency_InvalidInputs = {};
