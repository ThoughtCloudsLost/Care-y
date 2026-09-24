/**
* | output |
* | --- |
* | "Urgent" |
*
* @param {Priority_Stamp_UrgentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const priority_stamp_urgent: ((inputs?: Priority_Stamp_UrgentInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Priority_Stamp_UrgentInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Priority_Stamp_UrgentInputs = {};
