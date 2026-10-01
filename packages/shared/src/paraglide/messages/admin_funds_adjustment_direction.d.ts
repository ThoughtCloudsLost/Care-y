/**
* | output |
* | --- |
* | "Direction" |
*
* @param {Admin_Funds_Adjustment_DirectionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_adjustment_direction: ((inputs?: Admin_Funds_Adjustment_DirectionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Funds_Adjustment_DirectionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Funds_Adjustment_DirectionInputs = {};
