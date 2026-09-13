/**
* | output |
* | --- |
* | "Call status" |
*
* @param {Logs_Filter_Call_StatusInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_filter_call_status: ((inputs?: Logs_Filter_Call_StatusInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Filter_Call_StatusInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Filter_Call_StatusInputs = {};
