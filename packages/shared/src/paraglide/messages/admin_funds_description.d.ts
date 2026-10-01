/**
* | output |
* | --- |
* | "A fund holds money set aside for one purpose, such as gas cards or emergency housing. Names and amounts are encrypted before they leave this device." |
*
* @param {Admin_Funds_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_description: ((inputs?: Admin_Funds_DescriptionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Funds_DescriptionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Funds_DescriptionInputs = {};
