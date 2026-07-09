/**
* | output |
* | --- |
* | "Urgent" |
*
* @param {Priority_Stamp_UrgentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const priority_stamp_urgent: ((inputs?: Priority_Stamp_UrgentInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Priority_Stamp_UrgentInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Priority_Stamp_UrgentInputs = {};
