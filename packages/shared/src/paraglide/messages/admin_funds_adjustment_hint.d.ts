/**
* | output |
* | --- |
* | "Add money collected outside the app, such as a website donation, or take money out to correct a balance." |
*
* @param {Admin_Funds_Adjustment_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_adjustment_hint: ((inputs?: Admin_Funds_Adjustment_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Funds_Adjustment_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Funds_Adjustment_HintInputs = {};
