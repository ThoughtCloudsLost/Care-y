/**
* | output |
* | --- |
* | "Failed" |
*
* @param {Logs_Call_Status_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_call_status_failed: ((inputs?: Logs_Call_Status_FailedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Call_Status_FailedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Call_Status_FailedInputs = {};
