/**
* | output |
* | --- |
* | "Completed" |
*
* @param {Logs_Call_Status_CompletedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_call_status_completed: ((inputs?: Logs_Call_Status_CompletedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Call_Status_CompletedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Call_Status_CompletedInputs = {};
