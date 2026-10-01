/**
* | output |
* | --- |
* | "USD" |
*
* @param {Admin_Funds_Currency_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_currency_placeholder: ((inputs?: Admin_Funds_Currency_PlaceholderInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Funds_Currency_PlaceholderInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Funds_Currency_PlaceholderInputs = {};
