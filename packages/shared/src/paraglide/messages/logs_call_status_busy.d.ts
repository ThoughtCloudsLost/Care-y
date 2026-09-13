/**
* | output |
* | --- |
* | "Busy" |
*
* @param {Logs_Call_Status_BusyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_call_status_busy: ((inputs?: Logs_Call_Status_BusyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Call_Status_BusyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Call_Status_BusyInputs = {};
