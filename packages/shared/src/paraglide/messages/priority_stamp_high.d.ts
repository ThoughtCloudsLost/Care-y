/**
* | output |
* | --- |
* | "High" |
*
* @param {Priority_Stamp_HighInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const priority_stamp_high: ((inputs?: Priority_Stamp_HighInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Priority_Stamp_HighInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Priority_Stamp_HighInputs = {};
