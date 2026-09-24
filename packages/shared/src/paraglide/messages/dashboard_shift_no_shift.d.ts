/**
* | output |
* | --- |
* | "No active shift" |
*
* @param {Dashboard_Shift_No_ShiftInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_no_shift: ((inputs?: Dashboard_Shift_No_ShiftInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Shift_No_ShiftInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Shift_No_ShiftInputs = {};
