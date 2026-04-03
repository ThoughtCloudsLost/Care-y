/**
* | output |
* | --- |
* | "No active shift" |
*
* @param {Dashboard_Shift_No_ShiftInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_no_shift: ((inputs?: Dashboard_Shift_No_ShiftInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Shift_No_ShiftInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Shift_No_ShiftInputs = {};
