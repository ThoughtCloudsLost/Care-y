/**
* | output |
* | --- |
* | "High" |
*
* @param {Priority_Stamp_HighInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const priority_stamp_high: ((inputs?: Priority_Stamp_HighInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Priority_Stamp_HighInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Priority_Stamp_HighInputs = {};
