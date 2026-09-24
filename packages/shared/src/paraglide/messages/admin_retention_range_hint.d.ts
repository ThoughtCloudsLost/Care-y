/**
* | output |
* | --- |
* | "Between 1 and 3,650 days (10 years)" |
*
* @param {Admin_Retention_Range_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_retention_range_hint: ((inputs?: Admin_Retention_Range_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Retention_Range_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Retention_Range_HintInputs = {};
