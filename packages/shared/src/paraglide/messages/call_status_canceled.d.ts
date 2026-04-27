/**
* | output |
* | --- |
* | "Call canceled" |
*
* @param {Call_Status_CanceledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const call_status_canceled: ((inputs?: Call_Status_CanceledInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Call_Status_CanceledInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Call_Status_CanceledInputs = {};
