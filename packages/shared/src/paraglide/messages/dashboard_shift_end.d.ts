/**
* | output |
* | --- |
* | "End shift" |
*
* @param {Dashboard_Shift_EndInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_end: ((inputs?: Dashboard_Shift_EndInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Shift_EndInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Shift_EndInputs = {};
