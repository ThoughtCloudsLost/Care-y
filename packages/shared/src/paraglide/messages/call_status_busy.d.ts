/**
* | output |
* | --- |
* | "Busy" |
*
* @param {Call_Status_BusyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const call_status_busy: ((inputs?: Call_Status_BusyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Call_Status_BusyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Call_Status_BusyInputs = {};
