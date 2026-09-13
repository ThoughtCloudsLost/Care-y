/**
* | output |
* | --- |
* | "Canceled" |
*
* @param {Logs_Call_Status_CanceledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_call_status_canceled: ((inputs?: Logs_Call_Status_CanceledInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Call_Status_CanceledInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Call_Status_CanceledInputs = {};
