/**
* | output |
* | --- |
* | "Low" |
*
* @param {Priority_Stamp_LowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const priority_stamp_low: ((inputs?: Priority_Stamp_LowInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Priority_Stamp_LowInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Priority_Stamp_LowInputs = {};
